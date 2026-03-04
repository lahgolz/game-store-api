import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Logger,
} from '@nestjs/common';
import type { Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const request = context.getRequest<Request>();

    let status: number;
    let message: string | string[];
    let error: string;

    if (exception instanceof HttpException) {
      const body = exception.getResponse();

      status = exception.getStatus();
      message =
        typeof body === 'string'
          ? body
          : ((body as Error).message ?? exception.message);
      error = this.statusToError(status);
    } else {
      status = 500;
      error = 'Internal Server Error';
      message = 'An unexpected error occurred. Please contact support.';

      this.logger.error(
        'Unhandled exception',
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    response.status(status).json({
      statusCode: status,
      error,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }

  private statusToError(status: number): string {
    if (status >= 400 && status < 500) {
      return 'Bad Request';
    }

    if (status >= 500 && status < 600) {
      return 'Internal Server Error';
    }

    return 'Error';
  }
}
