import { Controller, Get, Req, Res } from '@nestjs/common';
import { OAuthService } from '../service/oauth.service';
import { ApiTags } from '@nestjs/swagger';
import { Response, Request } from 'express';
import { ApiGoogleOAuth } from '../api-docs/googleOAuth.api-docs';
import { ApiOAuthCallback } from '../api-docs/oauthCallback.api-docs';
import { OAUTH_CONSTANT } from '../constant/oauth.constant';

@ApiTags('OAuth')
@Controller('oauth')
export class OAuthController {
  constructor(private readonly oauthService: OAuthService) {}

  @Get('google')
  @ApiGoogleOAuth()
  async signupGoogle(@Res() res: Response) {
    return res.redirect(
      this.oauthService.getAuthUrl(OAUTH_CONSTANT.PROVIDER_TYPE.GOOGLE),
    );
  }

  @Get('callback')
  @ApiOAuthCallback()
  async callback(@Req() req: Request, @Res() res: Response) {
    return res.redirect(await this.oauthService.callback(req));
  }
}
