import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Query,
  Res,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { Response } from 'express';

import { ApiOAuth } from '@user/api-docs/oAuth.api-docs';
import { ApiOAuthCallback } from '@user/api-docs/oAuthCallback.api-docs';
import { OAUTH_URL_PATH, OAuthType } from '@user/constant/oauth.constant';
import { OAuthCallbackRequestDto } from '@user/dto/request/oAuthCallbackDto';
import { OAuthTypeRequestDto } from '@user/dto/request/oAuthType.dto';
import { OAuthService } from '@user/service/oAuth.service';

@ApiTags('OAuth')
@Controller('oauth')
export class OAuthController {
  constructor(private readonly oauthService: OAuthService) {}

  @Get()
  @ApiOAuth()
  @HttpCode(HttpStatus.FOUND)
  getProvider(@Query() provider: OAuthTypeRequestDto, @Res() res: Response) {
    return res.redirect(this.oauthService.getAuthUrl(provider.type));
  }

  @Get('callback')
  @ApiOAuthCallback()
  @HttpCode(HttpStatus.FOUND)
  async callback(
    @Query() callbackDto: OAuthCallbackRequestDto,
    @Res() res: Response,
  ) {
    await this.oauthService.callback(callbackDto, res);
    return res.redirect(`${OAUTH_URL_PATH.BASE_URL}/oauth-success`);
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
