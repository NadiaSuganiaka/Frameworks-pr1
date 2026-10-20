import { IsEnum, IsOptional, IsString, Length } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ProjectStatus } from '../entities/project.entity.js';

export class UpdateProjectDto {
  @ApiPropertyOptional({ example: 'StudyFlow', minLength: 3, maxLength: 100 })
  @IsOptional()
  @IsString()
  @Length(3, 100)
  name?: string;

  @ApiPropertyOptional({ example: 'Оновлений опис проєкту', maxLength: 500 })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  description?: string;

  @ApiPropertyOptional({ enum: ['draft', 'active', 'completed'], example: 'completed' })
  @IsOptional()
  @IsEnum(ProjectStatus)
  status?: ProjectStatus;
}
