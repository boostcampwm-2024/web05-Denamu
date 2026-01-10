// src/common/filters/all-exceptions.filter.ts
import { WinstonLoggerService } from '@common/logger/logger.service';
import { ApiResponse } from '@common/response/common.response';

import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class InternalExceptionsFilter implements ExceptionFilter {
  constructor(private readonly logger: WinstonLoggerService) {}
  catch(exception: Error, host: ArgumentsHost) {
    this.logger.error(exception.stack);
    const response = host.switchToHttp().getResponse<Response>();

    const statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    const message = '알 수 없는 서버 예외 발생';

    const apiResponse = ApiResponse.responseWithNoContent(message);
    response.status(statusCode).json(apiResponse);
  }
}
