import { Controller, Get } from '@nestjs/common';
import { ApiExcludeEndpoint } from '@nestjs/swagger';

import { ApiResponse } from '@common/response/common.response';

@Controller('health')
export class HealthController {
  @Get()
  @ApiExcludeEndpoint()
  check() {
    return ApiResponse.responseWithNoContent('OK');
  }
}
