import { IsEnum } from 'class-validator';
import { RequestStatus } from '@prisma/client';

export class UpdateAppointmentRequestStatusDto {
  @IsEnum(RequestStatus)
  status: RequestStatus;
}
