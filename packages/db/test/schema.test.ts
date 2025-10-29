import { describe, expect, it } from 'vitest';

import { Subscription } from '@prisma/client';

describe('prisma schema placeholder', () => {
  it('exposes Subscription model type', () => {
    const subscription: Subscription = {
      id: 'test',
      tenantId: 'tenant',
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      plan: 'free',
      status: 'active',
      seats: 5,
      currency: 'USD',
      renewsAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    expect(subscription.plan).toBe('free');
  });
});
