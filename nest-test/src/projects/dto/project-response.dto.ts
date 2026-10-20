import { ProjectStatus } from '../entities/project.entity.js';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ProjectResponseDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'StudyFlow' })
  name!: string;

  @ApiPropertyOptional({ example: 'Система керування навчальними проєктами' })
  description?: string;

  @ApiProperty({ enum: ['draft', 'active', 'completed'], example: 'active' })
  status!: ProjectStatus;

  @ApiProperty({ example: '2026-09-23T10:00:00.000Z', format: 'date-time' })
  createdAt!: string;
}
