import {
  IsString,
  IsOptional,
  IsNumber,
  IsDate,
  IsNotEmpty,
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
  observations?: string;

  @IsString()
  @IsNotEmpty({ message: 'O ID do cliente é obrigatório' })
  clientId: string;
}
