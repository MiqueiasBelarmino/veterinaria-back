import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsOptional,
  IsDate,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class CreateAppointmentRequestDto {
  @IsString()
  @IsNotEmpty({ message: 'O nome do tutor é obrigatório' })
  ownerName: string;

  @IsString()
  @IsNotEmpty({ message: 'O telefone é obrigatório' })
  ownerPhone: string;

  @IsEmail({}, { message: 'E-mail inválido' })
  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  ownerEmail?: string;

  @IsString()
  @IsNotEmpty({ message: 'O CPF é obrigatório' })
  ownerCpf: string;

  @IsString()
  @IsNotEmpty({ message: 'O nome do pet é obrigatório' })
  petName: string;

  @IsString()
  @IsNotEmpty({ message: 'A espécie do pet é obrigatória' })
  petSpecies: string;

  @IsDate({ message: 'Data inválida' })
  @Type(() => Date)
  @IsNotEmpty({ message: 'A data preferencial é obrigatória' })
  preferredDate: Date;

  @IsString()
  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  notes?: string;
}
