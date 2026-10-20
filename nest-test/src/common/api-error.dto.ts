import { ApiProperty } from '@nestjs/swagger';

export class ApiErrorDto {
  @ApiProperty({ example: 404 })
  statusCode!: number;

  @ApiProperty({ example: 'PROJECT_NOT_FOUND' })
  errorCode!: string;

  @ApiProperty({ type: String, example: 'Project with id 10 was not found' })
  message!: string | string[];

  @ApiProperty({ example: '/projects/10' })
  path!: string;

  @ApiProperty({ example: '2026-09-23T10:00:00.000Z', format: 'date-time' })
  timestamp!: string;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  traceId!: string;
}
