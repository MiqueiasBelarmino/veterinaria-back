import { IsString, IsOptional } from 'class-validator';

export class CreateClinicDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  phone?: string;
}

