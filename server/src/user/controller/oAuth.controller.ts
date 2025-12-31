import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Query,
  Res,
} from '@nestjs/common';
import { OAuthService } from '../service/oAuth.service';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { ApiOAuth } from '../api-docs/oAuth.api-docs';
import { ApiOAuthCallback } from '../api-docs/oAuthCallback.api-docs';
import { OAuthTypeRequestDto } from '../dto/request/oAuthType.dto';
import { OAUTH_URL_PATH } from '../constant/oauth.constant';
import { OAuthCallbackRequestDto } from '../dto/request/oAuthCallbackDto';

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
}
