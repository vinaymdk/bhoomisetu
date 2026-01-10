import { IsUUID, IsOptional, IsEnum, IsString } from 'class-validator';
import { PaymentGateway } from '../entities/payment-method.entity';

export class CreatePaymentOrderDto {
  @IsUUID()
  planId: string;

  @IsOptional()
  @IsEnum(PaymentGateway)
  gateway?: PaymentGateway;

  @IsOptional()
  @IsUUID()
  paymentMethodId?: string;

  @IsOptional()
  @IsUUID()
  propertyId?: string; // For featured listing subscriptions
}

export class VerifyPaymentDto {
  @IsUUID()
  paymentId: string;

  @IsString()
  gatewayPaymentId: string;

  @IsOptional()
  @IsString()
  gatewaySignature?: string;

  @IsOptional()
  webhookPayload?: Record<string, any>;
}
