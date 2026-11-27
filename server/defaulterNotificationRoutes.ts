import type { Express, Request, RequestHandler, Response } from 'express';
import crypto from 'node:crypto';
import type {
  DefaulterAlertChannel,
  DefaulterAlertChannelResult,
  DefaulterAlertDeliveryStatus,
  DefaulterAlertTierScope,
  FeeDefaulterNotificationConfig,
  FeeDefaulterNotificationRecord,
  UserAccount,
  UserRole,
} from '../src/types';
import { getDb, saveDb } from './store.ts';
import {
  buildStudentPaymentTimeline,
  evaluateFeeDefaulterStatus,
  rankSchoolFeeDefaulters,
  resolveCurrentAcademicFeeMonth,
} from '../src/utils/financialDashboardEngine.ts';
import {
  DEFAULT_DEFAULTER_ALERT_TEMPLATE,
  createDefaultDefaulterAlertConfig,
  renderDefaulterAlertMessage,
  resolveParentContactsForAccount,
  selectEligibleDefaultersForAlert,
} from '../src/utils/defaulterNotificationEngine.ts';
import {
  getNotificationGatewayStatus,
  sendParentEmailViaGateway,
  sendParentWhatsAppViaGateway,
} from './notificationGateway.ts';

interface AuthedRequest extends Request {
  user?: UserAccount;
  activeSchoolId?: string;
}

interface RouteRegistrarDeps {
  requireAuth: RequestHandler;
  requireRoles: (roles: UserRole[]) => RequestHandler;
  appendAuditLog: (entry: {
    schoolId: string;
    actor: UserAccount;
    action: string;
    entityType: string;
    entityId: string;
    detail: string;
  }) => void;
}

const VALID_CHANNELS: DefaulterAlertChannel[] = ['WhatsApp', 'Email', 'Both'];
const VALID_TIERS: DefaulterAlertTierScope[] = ['Critical', 'CriticalAndHigh'];

function getTodayIso(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getOrCreateDefaulterAlertConfig(
  schoolId: string,
): FeeDefaulterNotificationConfig {
  const db = getDb();
  if (!db.feeDefaulterAlertConfigs || typeof db.feeDefaulterAlertConfigs !== 'object') {
    db.feeDefaulterAlertConfigs = {};
  }
  if (!db.feeDefaulterAlertConfigs[schoolId]) {
    db.feeDefaulterAlertConfigs[schoolId] = createDefaultDefaulterAlertConfig(schoolId);
  }
  const cfg = db.feeDefaulterAlertConfigs[schoolId];
  // Normalize any legacy 'SMS' persisted setting to 'WhatsApp'
  if ((cfg.channel as string) === 'SMS') {
    cfg.channel = 'WhatsApp';
  }
  return cfg;
}

function summarizeDeliveryStatus(
  results: DefaulterAlertChannelResult[],
): DefaulterAlertDeliveryStatus {
  if (results.length === 0) return 'Failed';
  const sentCount = results.filter((r) => r.status === 'Sent').length;
  const queuedCount = results.filter((r) => r.status === 'Queued (Gateway Unconfigured)').length;
  const failedCount = results.filter((r) => r.status === 'Failed').length;

  if (sentCount > 0 && failedCount === 0 && queuedCount === 0) return 'Sent';
  if (sentCount > 0) return 'Partial';
  if (queuedCount > 0 && failedCount === 0) return 'Portal Queued';
  if (queuedCount > 0) return 'Partial';
  return 'Failed';
}

async function dispatchSingleDefaulterAlert(params: {
  channel: DefaulterAlertChannel;
  phone: string | null;
  email: string | null;
  schoolName: string;
  studentName: string;
  activeMonth: string;
  messageBody: string;
}): Promise<DefaulterAlertChannelResult[]> {
  const { channel, phone, email, schoolName, studentName, activeMonth, messageBody } = params;
  const tasks: Promise<DefaulterAlertChannelResult>[] = [];

  const wantsWhatsApp = channel === 'WhatsApp' || channel === 'Both';
  const wantsEmail = channel === 'Email' || channel === 'Both';

  if (wantsWhatsApp) {
    if (phone) {
      tasks.push(sendParentWhatsAppViaGateway({ to: phone, body: messageBody }));
    } else {
      tasks.push(
        Promise.resolve({
          channel: 'WhatsApp',
          recipient: 'Not on file',
          status: 'Skipped (Missing Contact)',
          detail: 'No valid WhatsApp mobile number recorded for guardian.',
        }),
      );
    }
  }

  if (wantsEmail) {
    if (email) {
      tasks.push(
        sendParentEmailViaGateway({
          to: email,
          subject: `${schoolName} - Fee Payment Reminder (${studentName}, ${activeMonth})`,
          text: messageBody,
        }),
      );
    } else {
      tasks.push(
        Promise.resolve({
          channel: 'Email',
          recipient: 'Not on file',
          status: 'Skipped (Missing Contact)',
          detail: 'No valid parent email recorded on student profile.',
        }),
      );
    }
  }

  return Promise.all(tasks);
}

export function registerDefaulterNotificationRoutes(
  app: Express,
  deps: RouteRegistrarDeps,
): void {
  const { requireAuth, requireRoles, appendAuditLog } = deps;

  // Update automated high-priority defaulter alert rules for active school
  app.put(
    '/api/finance/defaulter-notifications/config',
    requireAuth,
    requireRoles(['super_admin', 'school_admin', 'principal', 'accountant']),
    (req: AuthedRequest, res: Response) => {
      const schoolId = req.activeSchoolId!;
      const body = (req.body || {}) as Partial<FeeDefaulterNotificationConfig>;

      const current = getOrCreateDefaulterAlertConfig(schoolId);

      const autoEnabled =
        typeof body.autoEnabled === 'boolean' ? body.autoEnabled : current.autoEnabled;
      const tierScope: DefaulterAlertTierScope =
        body.tierScope && VALID_TIERS.includes(body.tierScope)
          ? body.tierScope
          : current.tierScope;
      const channel: DefaulterAlertChannel =
        body.channel && VALID_CHANNELS.includes(body.channel) ? body.channel : current.channel;

      const parsedScore = Number(body.minPriorityScore);
      const minPriorityScore = Number.isFinite(parsedScore)
        ? Math.min(100, Math.max(0, Math.round(parsedScore)))
        : current.minPriorityScore;

      const parsedPercentLeft = Number(body.minPercentLeft);
      const minPercentLeft = Number.isFinite(parsedPercentLeft)
        ? Math.min(100, Math.max(0, Math.round(parsedPercentLeft)))
        : current.minPercentLeft;

      const parsedCooldown = Number(body.cooldownDays);
      const cooldownDays = Number.isFinite(parsedCooldown)
        ? Math.min(90, Math.max(1, Math.round(parsedCooldown)))
        : current.cooldownDays;

      const scheduleLabel =
        typeof body.scheduleLabel === 'string' && body.scheduleLabel.trim().length > 0
          ? body.scheduleLabel.trim().slice(0, 120)
          : current.scheduleLabel;

      const messageTemplate =
        typeof body.messageTemplate === 'string' && body.messageTemplate.trim().length > 0
          ? body.messageTemplate.trim().slice(0, 1000)
          : current.messageTemplate || DEFAULT_DEFAULTER_ALERT_TEMPLATE;

      const updated: FeeDefaulterNotificationConfig = {
        ...current,
        schoolId,
        autoEnabled,
        tierScope,
        minPriorityScore,
        minPercentLeft,
        channel,
        cooldownDays,
        scheduleLabel,
        messageTemplate,
        updatedBy: req.user!.name,
        updatedAt: new Date().toISOString(),
      };

      const db = getDb();
      db.feeDefaulterAlertConfigs![schoolId] = updated;

      appendAuditLog({
        schoolId,
        actor: req.user!,
        action: 'UPDATED_DEFAULTER_ALERT_POLICY',
        entityType: 'FeeDefaulterNotificationConfig',
        entityId: schoolId,
        detail: `Updated automated defaulter alert policy: ${autoEnabled ? 'Enabled' : 'Paused'}, ${tierScope}, score >= ${minPriorityScore}, % left >= ${minPercentLeft}%, channel ${channel}, cooldown ${cooldownDays}d.`,
      });

      saveDb();
      res.json({
        config: updated,
        gatewayStatus: getNotificationGatewayStatus(),
      });
    },
  );

  // Dispatch automated batch alerts or single high-priority defaulter alert
  app.post(
    '/api/finance/defaulter-notifications/dispatch',
    requireAuth,
    requireRoles(['super_admin', 'school_admin', 'principal', 'accountant']),
    async (req: AuthedRequest, res: Response) => {
      const schoolId = req.activeSchoolId!;
      const db = getDb();
      const school = db.schools.find((s) => s.id === schoolId);
      const schoolName = school?.name || 'School Accounts Office';

      const body = (req.body || {}) as {
        mode?: 'batch' | 'single';
        accountId?: string;
        classScope?: string;
        channel?: DefaulterAlertChannel;
        customMessage?: string;
        maxRecipients?: number;
      };

      const mode = body.mode === 'single' ? 'single' : 'batch';
      const config = getOrCreateDefaulterAlertConfig(schoolId);
      const effectiveChannel: DefaulterAlertChannel =
        body.channel && VALID_CHANNELS.includes(body.channel) ? body.channel : config.channel;

      const todayIso = getTodayIso();
      const activeMonth =
        db.financialTargets?.[schoolId]?.monthKey ?? resolveCurrentAcademicFeeMonth(todayIso);

      const schoolAccounts = (db.feeAccounts || []).filter((a) => a.schoolId === schoolId);
      const schoolStudents = (db.students || []).filter((s) => s.schoolId === schoolId);
      const schoolUsers = (db.users || []).filter((u) => u.schoolId === schoolId);
      if (!Array.isArray(db.feeDefaulterAlertLogs)) {
        db.feeDefaulterAlertLogs = [];
      }

      const nowIso = new Date().toISOString();

      if (mode === 'single') {
        const targetId = typeof body.accountId === 'string' ? body.accountId.trim() : '';
        if (!targetId) {
          res.status(400).json({ error: 'Select a student fee account to notify.' });
          return;
        }
        const rawAccount = schoolAccounts.find((a) => a.id === targetId);
        if (!rawAccount) {
          res.status(404).json({ error: 'Student fee account not found in active school.' });
          return;
        }

        const dm = evaluateFeeDefaulterStatus(rawAccount, activeMonth);
        const rankedAccount = { ...rawAccount, defaulterMetrics: dm };
        const tl = buildStudentPaymentTimeline({ account: rawAccount, activeMonth });
        const { phone, email } = resolveParentContactsForAccount({
          account: rankedAccount,
          students: schoolStudents,
          users: schoolUsers,
        });

        const messageBody =
          typeof body.customMessage === 'string' && body.customMessage.trim().length > 0
            ? body.customMessage.trim().slice(0, 1000)
            : renderDefaulterAlertMessage(config.messageTemplate, {
                guardianName: rawAccount.fatherName,
                studentName: rawAccount.studentName,
                admissionNo: rawAccount.admissionNo,
                className: rawAccount.className,
                schoolName,
                activeMonth,
                overdueTillMonthInr: dm.overdueTillCurrentMonthInr,
                balanceDueInr: rawAccount.balanceFeesInr,
                percentLeft: dm.percentLeft,
                paymentNature: tl.paymentNature,
              });

        const deliveryChannels = await dispatchSingleDefaulterAlert({
          channel: effectiveChannel,
          phone,
          email,
          schoolName,
          studentName: rawAccount.studentName,
          activeMonth,
          messageBody,
        });

        const record: FeeDefaulterNotificationRecord = {
          id: `fda-${crypto.randomUUID().slice(0, 12)}`,
          schoolId,
          accountId: rawAccount.id,
          studentId: rawAccount.studentId,
          admissionNo: rawAccount.admissionNo,
          studentName: rawAccount.studentName,
          className: rawAccount.className,
          guardianName: rawAccount.fatherName,
          recipientPhone: phone || undefined,
          recipientEmail: email || undefined,
          channel: effectiveChannel,
          deliveryChannels,
          status: summarizeDeliveryStatus(deliveryChannels),
          triggerType: 'Manual Single',
          activeMonth,
          riskTier: dm.riskTier,
          defaulterPriorityScore: dm.defaulterPriorityScore,
          percentLeft: dm.percentLeft,
          overdueTillMonthInr: dm.overdueTillCurrentMonthInr,
          balanceDueInr: rawAccount.balanceFeesInr,
          paymentNature: tl.paymentNature,
          messageBody,
          triggeredBy: req.user!.name,
          sentAt: nowIso,
        };

        db.feeDefaulterAlertLogs.unshift(record);
        if (db.feeDefaulterAlertLogs.length > 2000) {
          db.feeDefaulterAlertLogs.length = 2000;
        }

        appendAuditLog({
          schoolId,
          actor: req.user!,
          action: 'SENT_DEFAULTER_PARENT_ALERT',
          entityType: 'FeeDefaulterNotification',
          entityId: record.id,
          detail: `Dispatched ${effectiveChannel} fee alert for ${rawAccount.studentName} (${rawAccount.admissionNo}, ${dm.percentLeft}% left, status: ${record.status}).`,
        });

        saveDb();
        res.status(201).json({
          dispatchedCount: 1,
          skippedCooldownCount: 0,
          records: [record],
          config,
          gatewayStatus: getNotificationGatewayStatus(),
        });
        return;
      }

      // Automated high-priority batch sweep
      const classScope =
        typeof body.classScope === 'string' && body.classScope.trim()
          ? body.classScope.trim()
          : 'ALL';
      const maxRecipients = Math.min(
        250,
        Math.max(1, Math.round(Number(body.maxRecipients) || 250)),
      );

      const { defaulters: rankedDefaulters } = rankSchoolFeeDefaulters(
        schoolAccounts,
        activeMonth,
      );

      const selection = selectEligibleDefaultersForAlert({
        rankedDefaulters,
        config,
        activeMonth,
        existingLogs: db.feeDefaulterAlertLogs,
        students: schoolStudents,
        users: schoolUsers,
        classScope,
        channelOverride: effectiveChannel,
      });

      const targets = selection.eligibleReady.slice(0, maxRecipients);
      const createdRecords: FeeDefaulterNotificationRecord[] = [];

      for (const candidate of targets) {
        const acc = candidate.account;
        const dm = acc.defaulterMetrics;
        const messageBody = renderDefaulterAlertMessage(config.messageTemplate, {
          guardianName: acc.fatherName,
          studentName: acc.studentName,
          admissionNo: acc.admissionNo,
          className: acc.className,
          schoolName,
          activeMonth,
          overdueTillMonthInr: dm.overdueTillCurrentMonthInr,
          balanceDueInr: acc.balanceFeesInr,
          percentLeft: dm.percentLeft,
          paymentNature: candidate.paymentNature,
        });

        const deliveryChannels = await dispatchSingleDefaulterAlert({
          channel: effectiveChannel,
          phone: candidate.phone,
          email: candidate.email,
          schoolName,
          studentName: acc.studentName,
          activeMonth,
          messageBody,
        });

        createdRecords.push({
          id: `fda-${crypto.randomUUID().slice(0, 12)}`,
          schoolId,
          accountId: acc.id,
          studentId: acc.studentId,
          admissionNo: acc.admissionNo,
          studentName: acc.studentName,
          className: acc.className,
          guardianName: acc.fatherName,
          recipientPhone: candidate.phone || undefined,
          recipientEmail: candidate.email || undefined,
          channel: effectiveChannel,
          deliveryChannels,
          status: summarizeDeliveryStatus(deliveryChannels),
          triggerType: 'Automated Batch',
          activeMonth,
          riskTier: dm.riskTier,
          defaulterPriorityScore: dm.defaulterPriorityScore,
          percentLeft: dm.percentLeft,
          overdueTillMonthInr: dm.overdueTillCurrentMonthInr,
          balanceDueInr: acc.balanceFeesInr,
          paymentNature: candidate.paymentNature,
          messageBody,
          triggeredBy: req.user!.name,
          sentAt: nowIso,
        });
      }

      if (createdRecords.length > 0) {
        db.feeDefaulterAlertLogs.unshift(...createdRecords);
        if (db.feeDefaulterAlertLogs.length > 2000) {
          db.feeDefaulterAlertLogs.length = 2000;
        }
      }

      config.lastAutoRunAt = nowIso;
      db.feeDefaulterAlertConfigs![schoolId] = config;

      appendAuditLog({
        schoolId,
        actor: req.user!,
        action: 'DISPATCHED_DEFAULTER_ALERT_BATCH',
        entityType: 'FeeDefaulterNotificationBatch',
        entityId: `${schoolId}-${activeMonth}`,
        detail: `Automated ${effectiveChannel} alert batch (${classScope}) dispatched to ${createdRecords.length} high-priority defaulters (${selection.skippedCooldown.length} skipped within ${config.cooldownDays}d cooldown).`,
      });

      saveDb();
      res.status(201).json({
        dispatchedCount: createdRecords.length,
        skippedCooldownCount: selection.skippedCooldown.length,
        records: createdRecords,
        config,
        gatewayStatus: getNotificationGatewayStatus(),
      });
    },
  );

  // Parent or finance staff acknowledges receipt of a fee defaulter alert
  app.patch(
    '/api/finance/defaulter-notifications/:id/acknowledge',
    requireAuth,
    requireRoles(['super_admin', 'school_admin', 'principal', 'accountant', 'parent']),
    (req: AuthedRequest, res: Response) => {
      const schoolId = req.activeSchoolId!;
      const { id } = req.params;
      const db = getDb();

      const record = (db.feeDefaulterAlertLogs || []).find(
        (n) => n.id === id && n.schoolId === schoolId,
      );
      if (!record) {
        res.status(404).json({ error: 'Notification record not found in active school.' });
        return;
      }

      if (req.user!.role === 'parent') {
        const linkedIds = new Set(req.user!.linkedStudentIds || []);
        if (!record.studentId || !linkedIds.has(record.studentId)) {
          res.status(403).json({ error: 'You can only acknowledge alerts for your linked child.' });
          return;
        }
      }

      record.status = 'Acknowledged';
      record.acknowledgedAt = new Date().toISOString();
      record.acknowledgedBy = req.user!.name;

      appendAuditLog({
        schoolId,
        actor: req.user!,
        action: 'ACKNOWLEDGED_DEFAULTER_ALERT',
        entityType: 'FeeDefaulterNotification',
        entityId: record.id,
        detail: `${req.user!.name} acknowledged fee alert for ${record.studentName} (${record.admissionNo}).`,
      });

      saveDb();
      res.json({ ok: true, record });
    },
  );
}
