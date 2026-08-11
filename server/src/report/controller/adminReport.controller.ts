import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { CurrentAdmin } from '@common/decorator/current-admin.decorator';
import { AdminAuthGuard } from '@common/guard/session.guard';
import { ApiResponse } from '@common/response/common.response';

import { ApiApproveReport } from '@report/api-docs/approveReport.api-docs';
import { ApiGetReports } from '@report/api-docs/getReports.api-docs';
import { ApiRejectReport } from '@report/api-docs/rejectReport.api-docs';
import { ApproveReportRequestDto } from '@report/dto/request/approveReport.dto';
import { GetReportsRequestDto } from '@report/dto/request/getReports.dto';
import { ReportIdParamRequestDto } from '@report/dto/request/reportIdParam.dto';
import { ReportService } from '@report/service/report.service';

@ApiTags('Admin')
@Controller('admins/reports')
@UseGuards(AdminAuthGuard)
export class AdminReportController {
  constructor(private readonly reportService: ReportService) {}

  @ApiGetReports()
  @Get()
  @HttpCode(HttpStatus.OK)
  async getReports(@Query() queryDto: GetReportsRequestDto) {
    return ApiResponse.responseWithData(
      '신고 목록 조회를 성공했습니다.',
      await this.reportService.getReports(queryDto),
    );
  }

  @ApiApproveReport()
  @Post(':id/suspensions')
  @HttpCode(HttpStatus.CREATED)
  async approveReport(
    @Param() paramDto: ReportIdParamRequestDto,
    @Body() approveDto: ApproveReportRequestDto,
    @CurrentAdmin() email: string,
  ) {
    await this.reportService.approveReport(paramDto.id, email, approveDto);
    return ApiResponse.responseWithNoContent(
      '신고 승인 및 정지 처리가 완료되었습니다.',
    );
  }

  @ApiRejectReport()
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async rejectReport(@Param() paramDto: ReportIdParamRequestDto) {
    await this.reportService.rejectReport(paramDto.id);
    return ApiResponse.responseWithNoContent('신고를 거절했습니다.');
  }
}
