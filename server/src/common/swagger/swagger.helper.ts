import { applyDecorators, Type } from '@nestjs/common';
import {
  ApiBadGatewayResponse,
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiExtraModels,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiUnauthorizedResponse,
  getSchemaPath,
} from '@nestjs/swagger';

import { ApiResponse } from '@common/response/common.response';
import { ErrorResponseDto } from '@common/swagger/error-response.dto';

export function ApiDataResponse<T>(dataType: Type<T>, isArray = false, description?: string) {
  return applyDecorators(
    ApiExtraModels(ApiResponse, dataType),
    ApiOkResponse({
      description,
      schema: {
        allOf: [
          { $ref: getSchemaPath(ApiResponse) },
          {
            properties: {
              data: isArray
                ? { type: 'array', items: { $ref: getSchemaPath(dataType) } }
                : { $ref: getSchemaPath(dataType) },
            },
          },
        ],
      },
    }),
  );
}

export function ApiCreatedDataResponse<T>(dataType: Type<T>, isArray = false, description?: string) {
  return applyDecorators(
    ApiExtraModels(ApiResponse, dataType),
    ApiCreatedResponse({
      description,
      schema: {
        allOf: [
          { $ref: getSchemaPath(ApiResponse) },
          {
            properties: {
              data: isArray
                ? { type: 'array', items: { $ref: getSchemaPath(dataType) } }
                : { $ref: getSchemaPath(dataType) },
            },
          },
        ],
      },
    }),
  );
}

export function ApiMessageResponse(description?: string) {
  return applyDecorators(
    ApiOkResponse({
      description,
      schema: {
        type: 'object',
        properties: {
          message: {
            type: 'string',
            description: '응답 메시지',
            example: '요청이 성공적으로 처리되었습니다.',
          },
        },
        required: ['message'],
      },
    }),
  );
}

export function ApiCreatedDoc(description?: string) {
  return applyDecorators(
    ApiCreatedResponse({
      description,
      schema: {
        type: 'object',
        properties: {
          message: {
            type: 'string',
            description: '응답 메시지',
            example: '요청이 성공적으로 처리되었습니다.',
          },
        },
        required: ['message'],
      },
    }),
  );
}

export function ApiBadRequestDoc(description: string) {
  return applyDecorators(
    ApiExtraModels(ErrorResponseDto),
    ApiBadRequestResponse({
      description,
      schema: { $ref: getSchemaPath(ErrorResponseDto) },
    }),
  );
}

export function ApiNotFoundDoc(description: string) {
  return applyDecorators(
    ApiExtraModels(ErrorResponseDto),
    ApiNotFoundResponse({
      description,
      schema: { $ref: getSchemaPath(ErrorResponseDto) },
    }),
  );
}

export function ApiForbiddenDoc(description: string) {
  return applyDecorators(
    ApiExtraModels(ErrorResponseDto),
    ApiForbiddenResponse({
      description,
      schema: { $ref: getSchemaPath(ErrorResponseDto) },
    }),
  );
}

export function ApiUnauthorizedDoc(description: string) {
  return applyDecorators(
    ApiExtraModels(ErrorResponseDto),
    ApiUnauthorizedResponse({
      description,
      schema: { $ref: getSchemaPath(ErrorResponseDto) },
    }),
  );
}

export function ApiConflictDoc(description: string) {
  return applyDecorators(
    ApiExtraModels(ErrorResponseDto),
    ApiConflictResponse({
      description,
      schema: { $ref: getSchemaPath(ErrorResponseDto) },
    }),
  );
}

export function ApiBadGatewayDoc(description: string) {
  return applyDecorators(
    ApiExtraModels(ErrorResponseDto),
    ApiBadGatewayResponse({
      description,
      schema: { $ref: getSchemaPath(ErrorResponseDto) },
    }),
  );
}
