import {
  IsString,
  IsNotEmpty,
  IsDate,
  IsNumber,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateClinicalRecordDto {
  @IsString()
  @IsNotEmpty()
  petId: string;

  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  date: Date;

  @IsNumber()
  @IsOptional()
  weight?: number;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsOptional()
  diagnosis?: string;

  @IsString()
  @IsOptional()
  treatment?: string;

  @IsString()
  @IsOptional()
  prescriptionNotes?: string;

  @IsString()
  @IsOptional()
  appointmentId?: string;

}
