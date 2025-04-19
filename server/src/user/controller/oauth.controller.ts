import { Controller, Get, Req, Res } from '@nestjs/common';
import { OAuthService } from '../service/oauth.service';
import { ApiTags } from '@nestjs/swagger';
import { Response, Request } from 'express';
import { ApiGoogleOAuth } from '../api-docs/googleOAuth.api-docs';
import { ApiOAuthCallback } from '../api-docs/oauthCallback.api-docs';

@ApiTags('OAuth')
@Controller('oauth')
export class OAuthController {
  constructor(private readonly oauthService: OAuthService) {}

  @Get('google')
  @ApiGoogleOAuth()
  async signupGoogle(@Res() res: Response) {
    return res.redirect(this.oauthService.getGoogleAuthUrl());
  }

  @Get('callback')
  @ApiOAuthCallback()
  async callback(@Req() req: Request, @Res() res: Response) {
    return res.redirect(await this.oauthService.callback(req));
  }
}
