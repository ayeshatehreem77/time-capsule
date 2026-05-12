import { IsNotEmpty, IsString, IsOptional, IsDateString, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateCapsuleDto {

  @IsString()
  @IsNotEmpty()
  title!: string;  // <-- add this

  @IsString()
  @IsNotEmpty()
  message!: string;

  @IsOptional()
  @IsString()
  recipientEmail?: string;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === true || value === 'true')
  isSealed?: boolean;


  @IsDateString()
  unlockDate!: string;


  @IsOptional()
  @IsString()
  fileUrl?: string;

  @IsOptional()
  @IsString()
  passcode?: string;

  @IsOptional()
  @IsString()
  publicId?: string;
}
