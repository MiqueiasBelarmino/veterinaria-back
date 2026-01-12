import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePrescriptionItemDto {
  @IsString()
  @IsNotEmpty({ message: 'O medicamento é obrigatório' })
  medication: string;

  @IsString()
  @IsNotEmpty({ message: 'A dosagem é obrigatória' })
  dosage: string;

  @IsString()
  @IsOptional()
  frequency?: string;

  @IsString()
  @IsOptional()
  duration?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class CreatePrescriptionDto {
  @IsString()
  @IsNotEmpty({ message: 'O ID do pet é obrigatório' })
  petId: string;

  @IsString()
  @IsOptional()
  appointmentId?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePrescriptionItemDto)
  @IsNotEmpty({ message: 'A prescrição deve ter pelo menos um item' })
  items: CreatePrescriptionItemDto[];

  @IsString()
  @IsOptional()
  observations?: string;
}
