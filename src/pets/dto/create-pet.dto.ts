import {
  IsString,
  IsOptional,
  IsNumber,
  IsDate,
  IsNotEmpty,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePetDto {
  @IsString()
  @IsNotEmpty({ message: 'O nome é obrigatório' })
  name: string;

  @IsString()
  @IsNotEmpty({ message: 'A espécie é obrigatória' })
  species: string;

  @IsString()
  @IsOptional()
  breed?: string;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  birthDate?: Date;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  weight?: number;

  @IsString()
  @IsOptional()
  sex?: string;

  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  isNeutered?: boolean;

  @IsString()
  @IsOptional()
  clinicalNotes?: string;

  @IsString()
  @IsOptional()
  observations?: string;

  @IsString()
  @IsOptional()
  clientId?: string;
}
