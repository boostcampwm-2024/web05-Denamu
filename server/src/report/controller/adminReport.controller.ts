import { Controller, Get, HttpCode, HttpStatus, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AdminAuthGuard } from '@common/guard/session.guard';
import { ApiResponse } from '@common/response/common.response';

import { ApiGetReports } from '@report/api-docs/getReports.api-docs';
import { GetReportsRequestDto } from '@report/dto/request/getReports.dto';
import { ReportService } from '@report/service/report.service';

@ApiTags('Admin')
@Controller('admins/reports')
export class AdminReportController {
  constructor(private readonly reportService: ReportService) {}

  @ApiGetReports()
  @Get()
  @UseGuards(AdminAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getReports(@Query() queryDto: GetReportsRequestDto) {
    return ApiResponse.responseWithData(
      '신고 목록 조회를 성공했습니다.',
      await this.reportService.getReports(queryDto),
    );
  }
}
