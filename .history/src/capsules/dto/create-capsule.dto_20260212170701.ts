import { IsNotEmpty, IsString, IsOptional, IsDateString } from 'class-validator';

export class CreateCapsuleDto {

  @IsString()
  @IsNotEmpty()
  message: string;

  @IsDateString()
  unlockDate: string;

  @IsOptional()
  @IsString()
  passcode?: string;

}
