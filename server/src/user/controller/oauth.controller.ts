import { Controller, Get, Query, Req, Res } from '@nestjs/common';
import { OAuthService } from '../service/oauth.service';
import { ApiTags } from '@nestjs/swagger';
import { Response, Request } from 'express';
import { ApiOAuth } from '../api-docs/oAuth.api-docs';
import { ApiOAuthCallback } from '../api-docs/oauthCallback.api-docs';
import { OAuthTypeDto } from '../dto/request/oauth-type.dto';
import { OAUTH_URL_PATH } from '../constant/oauth.constant';

@ApiTags('OAuth')
@Controller('oauth')
export class OAuthController {
  constructor(private readonly oauthService: OAuthService) {}

  @Get()
  @ApiOAuth()
  async getProvider(@Query() provider: OAuthTypeDto, @Res() res: Response) {
    return res.redirect(this.oauthService.getAuthUrl(provider.type));
  }

  @Get('callback')
  @ApiOAuthCallback()
  async callback(@Req() req: Request, @Res() res: Response) {
    const accessToken = await this.oauthService.callback(req, res);

    return res.redirect(
      `${OAUTH_URL_PATH.BASE_URL}/oauth-success?token=${accessToken}`,
    );
  }
}
