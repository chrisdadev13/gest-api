import {
  IsNotEmpty,
  IsBoolean,
  IsEmail,
  IsDate,
  IsString,
  MaxLength,
  IsPhoneNumber,
  IsOptional,
  IsNumber,
} from 'class-validator';

export class CreateDTO {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  description: string;

  @IsOptional()
  @IsPhoneNumber('ES')
  phone: string;

  @IsOptional()
  @IsDate()
  birthday: Date;

  @IsOptional()
  @IsString()
  address: string;

  @IsBoolean()
  favorite: boolean;
}

export class UpdateDTO {
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  description: string;

  @IsOptional()
  @IsPhoneNumber('ES')
  phone: string;

  @IsOptional()
  @IsDate()
  birthday: Date;

  @IsOptional()
  @IsString()
  address: string;

  @IsOptional()
  @IsBoolean()
  favorite: boolean;
}

export class ParamDTO {
  @IsNotEmpty()
  @IsNumber()
  id: string;
}
