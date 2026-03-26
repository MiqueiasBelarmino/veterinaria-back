import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
  ValidateIf,
} from 'class-validator';

export class CreateClientDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @ValidateIf((o) => o.createAccount === true)
  @IsNotEmpty({ message: 'E-mail é obrigatório para criar conta' })
  @IsEmail({}, { message: 'E-mail inválido' })
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  cpf?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsOptional()
  createAccount?: boolean;

  @ValidateIf((o) => o.createAccount === true)
  @IsNotEmpty({ message: 'Senha é obrigatória para criar conta' })
  @IsString()
  @MinLength(6, { message: 'Senha deve ter pelo menos 6 caracteres' })
  @IsOptional()
  password?: string;
}
