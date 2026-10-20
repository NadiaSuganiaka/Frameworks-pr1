import { IsEnum, IsOptional, IsString, Length } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProjectStatus } from '../entities/project.entity.js';

export class CreateProjectDto {
  @ApiProperty({ example: 'StudyFlow', minLength: 3, maxLength: 100 })
  @IsString()
  @Length(3, 100)
  name!: string;

  @ApiPropertyOptional({ example: 'Система керування навчальними проєктами', maxLength: 500 })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  description?: string;

  @ApiProperty({ enum: ['draft', 'active', 'completed'], example: 'active' })
  @IsEnum(ProjectStatus)
  status!: ProjectStatus;
}
