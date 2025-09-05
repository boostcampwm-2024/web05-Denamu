// src/common/filters/all-exceptions.filter.ts

import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiResponse } from '../response/common.response';
import { WinstonLoggerService } from '../logger/logger.service';

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
