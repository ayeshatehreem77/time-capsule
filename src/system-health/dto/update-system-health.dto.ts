import { PartialType } from '@nestjs/mapped-types';
import { CreateSystemHealthDto } from './create-system-health.dto';

export class UpdateSystemHealthDto extends PartialType(CreateSystemHealthDto) {}
