import { IsString, IsOptional, IsUUID, IsObject } from 'class-validator';

export class CreateNotificationDto {
  @IsUUID()
  userId!: string;

  @IsOptional()
  @IsUUID()
  appointmentId?: string;

  @IsString()
  type!: string;

  @IsOptional()
  @IsObject()
  data?: Record<string, unknown>;
}

