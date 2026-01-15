import {
  IsString,
  IsNotEmpty,
  IsDate,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum AppointmentType {
  CONSULTATION = 'CONSULTATION', // Keeping for legacy compatibility if needed, or alias to INITIAL
  INITIAL = 'INITIAL',
  RETURN = 'RETURN',
  HOME_VISIT = 'HOME_VISIT',
  BOARDING = 'BOARDING',
}

export class CreateAppointmentDto {
  @IsString()
  @IsNotEmpty({ message: 'O ID do pet é obrigatório' })
  petId: string;

  @IsDate()
  @Type(() => Date)
  @IsNotEmpty({ message: 'A data é obrigatória' })
  date: Date;

  @IsEnum(AppointmentType, { message: 'Tipo de agendamento inválido' })
  type: AppointmentType;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsOptional()
  planId?: string;
 
  @IsString()
  @IsOptional()
  vetId?: string;
}
