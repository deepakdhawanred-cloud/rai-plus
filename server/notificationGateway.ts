import type {
  DefaulterAlertChannelResult,
  NotificationGatewayStatus,
} from '../src/types';

function readEnv(key: string): string {
  return String(process.env[key] || '').trim();
}

/**
 * Returns non-secret capability flags for Email (Resend) and WhatsApp
 * (Meta WhatsApp Business Cloud API or Twilio WhatsApp) gateways.
 * Credentials are read strictly from server-side process.env and never sent to clients.
 */
export function getNotificationGatewayStatus(): NotificationGatewayStatus {
  const emailConfigured = Boolean(readEnv('RESEND_API_KEY') && readEnv('ALERT_FROM_EMAIL'));
  const metaWhatsappConfigured = Boolean(
    readEnv('WHATSAPP_ACCESS_TOKEN') && readEnv('WHATSAPP_PHONE_NUMBER_ID'),
  );
  const twilioWhatsappConfigured = Boolean(
    readEnv('TWILIO_ACCOUNT_SID') &&
      readEnv('TWILIO_AUTH_TOKEN') &&
      readEnv('TWILIO_WHATSAPP_FROM'),
  );
  const whatsappConfigured = metaWhatsappConfigured || twilioWhatsappConfigured;

  return {
    emailConfigured,
    whatsappConfigured,
    emailProvider: emailConfigured ? 'Resend Email API (Live)' : 'Parent Portal + Dispatch Queue',
    whatsappProvider: metaWhatsappConfigured
      ? 'WhatsApp Business Cloud API (Live)'
      : twilioWhatsappConfigured
        ? 'Twilio WhatsApp API (Live)'
        : 'Parent Portal + WhatsApp Queue',
  };
}

/**
 * Dispatches a parent fee reminder email via Resend API when configured in server env,
 * or records it as cleanly queued in the school dispatch ledger & Parent Portal.
 */
export async function sendParentEmailViaGateway(params: {
  to: string;
  subject: string;
  text: string;
}): Promise<DefaulterAlertChannelResult> {
  const apiKey = readEnv('RESEND_API_KEY');
  const from = readEnv('ALERT_FROM_EMAIL');

  if (!apiKey || !from) {
    return {
      channel: 'Email',
      recipient: params.to,
      status: 'Queued (Gateway Unconfigured)',
      detail:
        'Logged in dispatch ledger & Parent Portal. Add RESEND_API_KEY and ALERT_FROM_EMAIL in server secrets for live email delivery.',
    };
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [params.to],
        subject: params.subject,
        text: params.text,
      }),
      signal: AbortSignal.timeout(8000),
    });

    const data = (await response.json().catch(() => ({}))) as {
      id?: string;
      message?: string;
    };

    if (!response.ok) {
      return {
        channel: 'Email',
        recipient: params.to,
        status: 'Failed',
        detail: data.message || `Email provider returned HTTP ${response.status}`,
      };
    }

    return {
      channel: 'Email',
      recipient: params.to,
      status: 'Sent',
      providerRef: data.id || 'resend-ok',
      detail: 'Delivered via Resend Email API',
    };
  } catch (err) {
    return {
      channel: 'Email',
      recipient: params.to,
      status: 'Failed',
      detail: err instanceof Error ? err.message : 'Email gateway network error',
    };
  }
}

/**
 * Dispatches a parent fee reminder WhatsApp message via Meta WhatsApp Business Cloud API
 * (preferred) or Twilio WhatsApp Business API when configured in server env,
 * or records it cleanly as queued in the school dispatch ledger & Parent Portal.
 */
export async function sendParentWhatsAppViaGateway(params: {
  to: string;
  body: string;
}): Promise<DefaulterAlertChannelResult> {
  const waAccessToken = readEnv('WHATSAPP_ACCESS_TOKEN');
  const waPhoneNumberId = readEnv('WHATSAPP_PHONE_NUMBER_ID');

  // 1. Meta WhatsApp Business Cloud API
  if (waAccessToken && waPhoneNumberId) {
    const waDigits = params.to.replace(/\D/g, '');
    try {
      const endpoint = `https://graph.facebook.com/v20.0/${encodeURIComponent(
        waPhoneNumberId,
      )}/messages`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${waAccessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: waDigits,
          type: 'text',
          text: {
            preview_url: false,
            body: params.body,
          },
        }),
        signal: AbortSignal.timeout(8000),
      });

      const data = (await response.json().catch(() => ({}))) as {
        messages?: Array<{ id?: string }>;
        error?: { message?: string };
      };

      if (!response.ok) {
        return {
          channel: 'WhatsApp',
          recipient: params.to,
          status: 'Failed',
          detail: data.error?.message || `WhatsApp Cloud API returned HTTP ${response.status}`,
        };
      }

      return {
        channel: 'WhatsApp',
        recipient: params.to,
        status: 'Sent',
        providerRef: data.messages?.[0]?.id || 'wa-cloud-ok',
        detail: 'Delivered via WhatsApp Business Cloud API',
      };
    } catch (err) {
      return {
        channel: 'WhatsApp',
        recipient: params.to,
        status: 'Failed',
        detail: err instanceof Error ? err.message : 'WhatsApp Cloud API network error',
      };
    }
  }

  // 2. Twilio WhatsApp Business API fallback
  const accountSid = readEnv('TWILIO_ACCOUNT_SID');
  const authToken = readEnv('TWILIO_AUTH_TOKEN');
  const waFrom = readEnv('TWILIO_WHATSAPP_FROM');
  if (accountSid && authToken && waFrom) {
    try {
      const endpoint = `https://api.twilio.com/2010-04-01/Accounts/${encodeURIComponent(
        accountSid,
      )}/Messages.json`;
      const basicAuth = Buffer.from(`${accountSid}:${authToken}`, 'utf-8').toString('base64');
      const normalizedFrom = waFrom.startsWith('whatsapp:') ? waFrom : `whatsapp:${waFrom}`;
      const normalizedTo = params.to.startsWith('whatsapp:') ? params.to : `whatsapp:${params.to}`;
      const form = new URLSearchParams({
        From: normalizedFrom,
        To: normalizedTo,
        Body: params.body,
      });

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${basicAuth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: form.toString(),
        signal: AbortSignal.timeout(8000),
      });

      const data = (await response.json().catch(() => ({}))) as {
        sid?: string;
        message?: string;
      };

      if (!response.ok) {
        return {
          channel: 'WhatsApp',
          recipient: params.to,
          status: 'Failed',
          detail: data.message || `Twilio WhatsApp returned HTTP ${response.status}`,
        };
      }

      return {
        channel: 'WhatsApp',
        recipient: params.to,
        status: 'Sent',
        providerRef: data.sid || 'twilio-wa-ok',
        detail: 'Delivered via Twilio WhatsApp API',
      };
    } catch (err) {
      return {
        channel: 'WhatsApp',
        recipient: params.to,
        status: 'Failed',
        detail: err instanceof Error ? err.message : 'Twilio WhatsApp network error',
      };
    }
  }

  return {
    channel: 'WhatsApp',
    recipient: params.to,
    status: 'Queued (Gateway Unconfigured)',
    detail:
      'Logged in dispatch ledger & Parent Portal. Add WHATSAPP_ACCESS_TOKEN and WHATSAPP_PHONE_NUMBER_ID in server secrets for live WhatsApp Business delivery.',
  };
}
