import { IsNotEmpty, IsString, IsOptional, IsDateString } from 'class-validator';

export class CreateCapsuleDto {

  @IsString()
  @IsNotEmpty()
  title: string;  // <-- add this

  @IsString()
  @IsNotEmpty()
  message: string;

  @IsDateString()
  unlockDate: string;

  @IsOptional()
  @IsString()
  passcode?: string;

  @IsOptional()
  @IsString()
  publicId?: string;
}
