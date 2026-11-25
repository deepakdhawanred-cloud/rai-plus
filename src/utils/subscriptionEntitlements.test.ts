import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  countCustomOverridesForSchool,
  getAllowedAttendanceModesForSchool,
  getEffectivePlanPriceInr,
  getEnabledFeaturesForSchool,
  getPlanDefaultFeatures,
  hasGoogleMapsAccess,
  isAttendanceModeEnabledForSchool,
  isFeatureEnabledForSchool,
  isRaiPlusCoo,
  isWorkspaceTabEnabledForSchool,
  resolveSubscriptionPlans,
  sanitizeFeatureOverrides,
} from './subscriptionEntitlements.ts';

describe('Subscription Plan & Custom Feature Entitlements', () => {
  it('assigns progressively richer feature sets from Starter ERP up to Enterprise 360°', () => {
    const starter = getPlanDefaultFeatures('Starter ERP');
    const growth = getPlanDefaultFeatures('Growth ERP');
    const premium = getPlanDefaultFeatures('Premium Campus');
    const enterprise = getPlanDefaultFeatures('Enterprise 360°');

    assert.ok(starter.length < growth.length);
    assert.ok(growth.length < premium.length);
    assert.ok(premium.length < enterprise.length);
    assert.equal(starter.includes('google_maps_gps'), false);
    assert.equal(growth.includes('google_maps_gps'), false);
    assert.equal(premium.includes('google_maps_gps'), true);
    assert.equal(enterprise.includes('clinical_remedial_care'), true);
  });

  it('applies Super Admin custom feature overrides on top of paid plans', () => {
    const growthWithMapsAddon = {
      subscriptionPlan: 'Growth ERP',
      customFeatureOverrides: {
        google_maps_gps: true,
        interactive_learning_lab: true,
        events_calendar: false,
      },
    };

    assert.equal(hasGoogleMapsAccess(growthWithMapsAddon), true);
    assert.equal(isFeatureEnabledForSchool(growthWithMapsAddon, 'interactive_learning_lab'), true);
    assert.equal(isFeatureEnabledForSchool(growthWithMapsAddon, 'events_calendar'), false);
    assert.equal(isWorkspaceTabEnabledForSchool(growthWithMapsAddon, 'interactive_learning'), true);
    assert.equal(isWorkspaceTabEnabledForSchool(growthWithMapsAddon, 'events'), false);

    const overrideCounts = countCustomOverridesForSchool(growthWithMapsAddon);
    assert.deepEqual(overrideCounts, { added: 2, removed: 1, total: 3 });
  });

  it('strips invalid or redundant feature keys during override sanitization', () => {
    const defaults = getPlanDefaultFeatures('Growth ERP');
    const sanitized = sanitizeFeatureOverrides(
      {
        google_maps_gps: true, // valid add-on
        events_calendar: true, // already in Growth ERP -> redundant, should be stripped
        __proto__: true,
        unknown_hacker_flag: true,
        interactive_learning_lab: 'yes' as unknown as boolean,
      },
      defaults,
    );

    assert.deepEqual(sanitized, { google_maps_gps: true });
  });

  it('allows locking Google Maps on a Premium Campus school via Super Admin override', () => {
    const premiumMapsDisabled = {
      subscriptionPlan: 'Premium Campus',
      customFeatureOverrides: { google_maps_gps: false },
    };

    assert.equal(hasGoogleMapsAccess(premiumMapsDisabled), false);
    assert.equal(
      getEnabledFeaturesForSchool(premiumMapsDisabled).includes('google_maps_gps'),
      false,
    );
  });

  it('enforces plan-default attendance marking modes (Manual, RFID, Biometric) and custom overrides', () => {
    const starterSchool = { subscriptionPlan: 'Starter ERP' };
    const growthSchool = { subscriptionPlan: 'Growth ERP' };
    const premiumSchool = { subscriptionPlan: 'Premium Campus' };
    const enterpriseSchool = { subscriptionPlan: 'Enterprise 360°' };

    assert.deepEqual(getAllowedAttendanceModesForSchool(starterSchool), ['manual']);
    assert.deepEqual(getAllowedAttendanceModesForSchool(growthSchool), ['manual', 'rfid']);
    assert.deepEqual(getAllowedAttendanceModesForSchool(premiumSchool), [
      'manual',
      'rfid',
      'biometric',
    ]);
    assert.deepEqual(getAllowedAttendanceModesForSchool(enterpriseSchool), [
      'manual',
      'rfid',
      'biometric',
    ]);

    assert.equal(isAttendanceModeEnabledForSchool(starterSchool, 'manual'), true);
    assert.equal(isAttendanceModeEnabledForSchool(starterSchool, 'rfid'), false);
    assert.equal(isAttendanceModeEnabledForSchool(starterSchool, 'biometric'), false);

    const starterWithBiometricAddon = {
      subscriptionPlan: 'Starter ERP',
      customFeatureOverrides: { attendance_biometric: true },
    };
    assert.deepEqual(getAllowedAttendanceModesForSchool(starterWithBiometricAddon), [
      'manual',
      'biometric',
    ]);
    assert.equal(isAttendanceModeEnabledForSchool(starterWithBiometricAddon, 'biometric'), true);
    assert.equal(isAttendanceModeEnabledForSchool(starterWithBiometricAddon, 'rfid'), false);

    const premiumWithoutRfid = {
      subscriptionPlan: 'Premium Campus',
      customFeatureOverrides: { attendance_rfid: false },
    };
    assert.deepEqual(getAllowedAttendanceModesForSchool(premiumWithoutRfid), [
      'manual',
      'biometric',
    ]);
    assert.equal(isAttendanceModeEnabledForSchool(premiumWithoutRfid, 'rfid'), false);
  });

  it('authorizes only the COO of Rai Plus for plan pricing governance and resolves custom prices', () => {
    assert.equal(
      isRaiPlusCoo({
        role: 'super_admin',
        designation: 'Chief Operating Officer (COO) · Rai Plus',
        isPlatformCoo: true,
      }),
      true,
    );
    assert.equal(
      isRaiPlusCoo({
        role: 'super_admin',
        designation: 'Platform Super Admin',
        isPlatformCoo: false,
      }),
      false,
    );
    assert.equal(
      isRaiPlusCoo({
        role: 'school_admin',
        designation: 'Chief Operating Officer (COO) · Rai Plus',
        isPlatformCoo: true,
      }),
      false,
    );

    const catalog = {
      'Starter ERP': {
        priceMonthlyInr: 14500,
        annualDiscountPct: 12,
        note: 'Launch discount for new rural campuses',
        updatedBy: 'COO — Rai Plus',
        updatedAt: '2026-11-24T12:00:00.000Z',
      },
      'Premium Campus': {
        priceMonthlyInr: 49900,
        annualDiscountPct: 75, // should clamp to 50
        updatedBy: 'COO — Rai Plus',
        updatedAt: '2026-11-24T12:00:00.000Z',
      },
    };

    const resolved = resolveSubscriptionPlans(catalog);
    const starterPlan = resolved.find((p) => p.id === 'Starter ERP');
    const growthPlan = resolved.find((p) => p.id === 'Growth ERP');
    const premiumPlan = resolved.find((p) => p.id === 'Premium Campus');

    assert.equal(starterPlan?.priceMonthlyInr, 14500);
    assert.equal(starterPlan?.annualDiscountPct, 12);
    assert.equal(starterPlan?.priceCustomized, true);
    assert.equal(starterPlan?.priceNote, 'Launch discount for new rural campuses');
    assert.deepEqual(starterPlan?.defaultAttendanceModes, ['manual']);

    assert.equal(growthPlan?.priceMonthlyInr, growthPlan?.defaultPriceMonthlyInr);
    assert.equal(growthPlan?.priceCustomized, false);
    assert.deepEqual(growthPlan?.defaultAttendanceModes, ['manual', 'rfid']);

    assert.equal(premiumPlan?.priceMonthlyInr, 49900);
    assert.equal(premiumPlan?.annualDiscountPct, 50);
    assert.deepEqual(premiumPlan?.defaultAttendanceModes, ['manual', 'rfid', 'biometric']);

    assert.equal(getEffectivePlanPriceInr('Starter ERP', catalog), 14500);
    assert.equal(getEffectivePlanPriceInr('Growth ERP', catalog), growthPlan?.defaultPriceMonthlyInr);
    assert.equal(getEffectivePlanPriceInr('Premium Campus', catalog), 49900);
  });
});

