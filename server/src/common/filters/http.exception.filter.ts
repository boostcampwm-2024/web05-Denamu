// src/common/filters/all-exceptions.filter.ts
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';

import { Response } from 'express';

import { ApiResponse } from '@common/response/common.response';

@Catch(HttpException)
export class HttpExceptionsFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();

    const statusCode = exception.getStatus();
    const exceptionResponse = exception.getResponse();
    const res = exceptionResponse['message'];
    const message = Array.isArray(res) ? res[0] : res;
    const data = exceptionResponse['data'];

    const apiResponse =
      data === undefined
        ? ApiResponse.responseWithNoContent(message)
        : ApiResponse.responseWithData(message, data);
    response.status(statusCode).json(apiResponse);
  }
}
