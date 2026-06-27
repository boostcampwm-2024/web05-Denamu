import { Controller, Get } from '@nestjs/common';

import { ApiResponse } from '@common/response/common.response';

@Controller('health')
export class HealthController {
  @Get()
  check() {
    return ApiResponse.responseWithNoContent('OK');
  }
}
