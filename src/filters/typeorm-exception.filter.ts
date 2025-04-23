import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common';
import { QueryFailedError } from 'typeorm';
import { Response } from 'express';

type PostgresError = Error & {
  code: string;
  detail?: string;
};

@Catch(QueryFailedError)
export class TypeOrmExceptionFilter implements ExceptionFilter {
  catch(exception: QueryFailedError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const driverError = exception.driverError as PostgresError;

    if (driverError.code === '23505') {
      // 23505 = unique_violation no PostgreSQL
      return response.status(409).json({
        statusCode: 409,
        message: 'Este valor já está em uso.',
        error: 'Conflict',
        detail: driverError.detail,
      });
    }

    // Default fallback
    return response.status(500).json({
      statusCode: 500,
      message: 'Erro interno no servidor',
      error: 'Internal Server Error',
    });
  }
}
