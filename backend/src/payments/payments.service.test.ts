import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { PaymentsService } from './payments.service';
import { PaymentGateway } from './entities/payment-method.entity';
import { PaymentStatus, PaymentPurpose } from './entities/payment.entity';
import { SubscriptionStatus } from '../subscriptions/entities/subscription.entity';

type RepoEntity = { id?: string };

class MockRepository<T extends RepoEntity> {
  data: T[] = [];

  create(input: Partial<T>): T {
    return { ...(input as T) };
  }

  async save(entity: T): Promise<T> {
    if (!entity.id) {
      entity.id = randomUUID();
    }
    const now = new Date();
    if (!('createdAt' in entity)) {
      (entity as any).createdAt = now;
    }
    if (!('updatedAt' in entity)) {
      (entity as any).updatedAt = now;
    }
    const index = this.data.findIndex((item) => item.id === entity.id);
    if (index >= 0) {
      this.data[index] = entity;
    } else {
      this.data.push(entity);
    }
    return entity;
  }

  async findOne(options: any): Promise<T | null> {
    if (!options?.where) return null;
    const entries = Object.entries(options.where);
    return (
      this.data.find((item) => entries.every(([key, value]) => (item as any)[key] === value)) || null
    );
  }

  async findAndCount(): Promise<[T[], number]> {
    return [this.data, this.data.length];
  }
}

test('stores webhook and flags failed payment', async () => {
  const paymentRepository = new MockRepository<any>();
  const paymentWebhookRepository = new MockRepository<any>();
  const payment = {
    id: randomUUID(),
    userId: randomUUID(),
    gateway: PaymentGateway.RAZORPAY,
    gatewayOrderId: 'order_1',
    status: PaymentStatus.PENDING,
    purpose: PaymentPurpose.SUBSCRIPTION,
    metadata: { planId: 'plan_1' },
  };
  await paymentRepository.save(payment);

  const service = new PaymentsService(
    paymentRepository as any,
    new MockRepository<any>() as any,
    new MockRepository<any>() as any,
    new MockRepository<any>() as any,
    paymentWebhookRepository as any,
    new MockRepository<any>() as any,
    new MockRepository<any>() as any,
    new MockRepository<any>() as any,
    { scoreFraudRisk: async () => ({ riskScore: 10 }) } as any,
    { sendNotification: async () => undefined, notifyActionAlert: async () => undefined } as any,
  );

  await service.processWebhook(
    PaymentGateway.RAZORPAY,
    'payment.failed',
    'evt_1',
    { order_id: 'order_1', payment_id: 'pay_1', error: { message: 'Failed' } },
  );

  assert.equal(paymentWebhookRepository.data.length, 1);
  assert.equal(paymentWebhookRepository.data[0].processed, true);
  assert.equal(payment.status, PaymentStatus.FAILED);
});

test('processes webhook success with stub verification record', async () => {
  const paymentRepository = new MockRepository<any>();
  const paymentWebhookRepository = new MockRepository<any>();
  const subscriptionPlanRepository = new MockRepository<any>();
  const subscriptionRepository = new MockRepository<any>();
  const subscriptionTransactionRepository = new MockRepository<any>();

  const payment = {
    id: randomUUID(),
    userId: randomUUID(),
    gateway: PaymentGateway.RAZORPAY,
    gatewayOrderId: 'order_2',
    status: PaymentStatus.PENDING,
    purpose: PaymentPurpose.SUBSCRIPTION,
    metadata: { planId: 'plan_2', planType: 'premium_seller' },
    user: { id: randomUUID(), primaryEmail: 'test@example.com', primaryPhone: '9999999999' },
    paymentMethod: null,
  };
  await paymentRepository.save(payment);

  await subscriptionPlanRepository.save({
    id: 'plan_2',
    displayName: 'Premium Seller',
    planType: 'premium_seller',
    billingPeriod: 'monthly',
    durationDays: 30,
    price: 1999,
    currency: 'INR',
  });

  const service = new PaymentsService(
    paymentRepository as any,
    new MockRepository<any>() as any,
    subscriptionPlanRepository as any,
    subscriptionTransactionRepository as any,
    paymentWebhookRepository as any,
    subscriptionRepository as any,
    new MockRepository<any>() as any,
    new MockRepository<any>() as any,
    { scoreFraudRisk: async () => ({ riskScore: 10 }) } as any,
    { sendNotification: async () => undefined, notifyActionAlert: async () => undefined } as any,
  );

  await service.processWebhook(
    PaymentGateway.RAZORPAY,
    'payment.captured',
    'evt_2',
    { order_id: 'order_2', payment_id: 'pay_2' },
  );

  assert.equal(paymentWebhookRepository.data.length, 1);
  assert.equal(paymentWebhookRepository.data[0].processed, true);
  assert.equal(payment.status, PaymentStatus.COMPLETED);
  assert.equal(payment.metadata?.verification?.skipped, true);
  assert.equal(payment.metadata?.verification?.isValid, true);
  assert.equal(payment.metadata?.verification?.gateway, PaymentGateway.RAZORPAY);
  assert.equal(subscriptionRepository.data[0].status, SubscriptionStatus.ACTIVE);
});
