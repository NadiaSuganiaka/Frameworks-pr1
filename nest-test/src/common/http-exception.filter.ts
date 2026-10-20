import {
  ArgumentsHost,
  Catch,
  ConflictException,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse();
    const request = host.switchToHttp().getRequest();
    const status = exception instanceof HttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;
    const exceptionResponse = exception instanceof HttpException ? exception.getResponse() : undefined;
    const message = typeof exceptionResponse === 'object' && exceptionResponse !== null && 'message' in exceptionResponse
      ? exceptionResponse.message
      : exception instanceof Error ? exception.message : 'Internal server error';

    response.status(status).json({
      statusCode: status,
      errorCode: this.errorCode(status, exception),
      message,
      path: request.url,
      timestamp: new Date().toISOString(),
      traceId: request.headers['x-trace-id'] ?? randomUUID(),
    });
  }

  private errorCode(status: number, exception: unknown): string {
    if (status === HttpStatus.NOT_FOUND) return 'PROJECT_NOT_FOUND';
    if (exception instanceof ConflictException) return 'PROJECT_NAME_CONFLICT';
    if (status === HttpStatus.BAD_REQUEST) return 'VALIDATION_ERROR';
    return 'INTERNAL_SERVER_ERROR';
  }
}
