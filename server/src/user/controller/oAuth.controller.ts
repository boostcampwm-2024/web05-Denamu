import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  ParseEnumPipe,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { Request, Response } from 'express';

import { CurrentUser } from '@common/decorator';
import { JwtGuard, Payload } from '@common/guard/jwt.guard';
import { ApiResponse } from '@common/response/common.response';

import { ApiOAuth } from '@user/api-docs/oAuth.api-docs';
import { ApiOAuthCallback } from '@user/api-docs/oAuthCallback.api-docs';
import {
  ApiOAuthLinkInitiate,
  ApiOAuthLinks,
  ApiOAuthUnlink,
} from '@user/api-docs/oAuthLink.api-docs';
import { ApiOAuthRegistration } from '@user/api-docs/oAuthRegistration.api-docs';
import { OAUTH_URL_PATH, OAuthType } from '@user/constant/oauth.constant';
import { OAuthCallbackRequestDto } from '@user/dto/request/oAuthCallbackDto';
import { OAuthLinkRequestDto } from '@user/dto/request/oAuthLink.dto';
import { OAuthRegistrationRequestDto } from '@user/dto/request/oAuthRegistration.dto';
import { OAuthTypeRequestDto } from '@user/dto/request/oAuthType.dto';
import { OAuthService } from '@user/service/oAuth.service';

@ApiTags('OAuth')
@Controller('oauth')
export class OAuthController {
  constructor(private readonly oauthService: OAuthService) {}

  @Get()
  @ApiOAuth()
  @HttpCode(HttpStatus.FOUND)
  async getProvider(
    @Query() provider: OAuthTypeRequestDto,
    @Res() res: Response,
  ) {
    return res.redirect(await this.oauthService.getAuthUrl(provider.type, res));
  }

  @Get('callback')
  @ApiOAuthCallback()
  @HttpCode(HttpStatus.FOUND)
  async callback(
    @Query() callbackDto: OAuthCallbackRequestDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    return res.redirect(
      await this.oauthService.callback(callbackDto, res, req),
    );
  }

  @ApiOAuthRegistration()
  @Post('registrations')
  @HttpCode(HttpStatus.CREATED)
  async completeRegistration(
    @Body() registrationDto: OAuthRegistrationRequestDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.oauthService.completeOAuthRegistration(
      registrationDto.userName,
      req,
      res,
    );
    return ApiResponse.responseWithNoContent(
      '회원가입이 완료되어 로그인 처리되었습니다.',
    );
  }

  @ApiOAuthLinkInitiate()
  @Post('links')
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.CREATED)
  async initiateLink(
    @CurrentUser() user: Payload,
    @Body() linkDto: OAuthLinkRequestDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const authUrl = await this.oauthService.initiateLink(
      user.id,
      linkDto.provider,
      res,
    );
    return ApiResponse.responseWithData('연결용 인증 URL이 발급되었습니다.', {
      authUrl,
    });
  }

  @ApiOAuthLinks()
  @Get('links')
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.OK)
  async getLinkedProviders(@CurrentUser() user: Payload) {
    const result = await this.oauthService.getLinkedProviders(user.id);
    return ApiResponse.responseWithData(
      '연결된 제공자 목록을 조회했습니다.',
      result,
    );
  }

  @ApiOAuthUnlink()
  @Delete('links/:provider')
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.OK)
  async unlinkProvider(
    @CurrentUser() user: Payload,
    @Param('provider', new ParseEnumPipe(OAuthType)) provider: OAuthType,
  ) {
    await this.oauthService.unlinkProvider(user.id, provider);
    return ApiResponse.responseWithNoContent('OAuth 연결이 해제되었습니다.');
  }

  @Get('e2e/callback')
  @HttpCode(HttpStatus.FOUND)
  async e2eCallback(
    @Query('provider') provider: OAuthType = OAuthType.Google,
    @Res() res: Response,
  ) {
    if (!['LOCAL', 'TEST'].includes(process.env.NODE_ENV ?? '')) {
      throw new NotFoundException();
    }

    await this.oauthService.e2eCallback(provider, res);
    return res.redirect(`${OAUTH_URL_PATH.BASE_URL}/oauth-success`);
  }
}
