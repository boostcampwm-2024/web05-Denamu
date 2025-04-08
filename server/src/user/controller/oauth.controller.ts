import { Controller, Get, Req, Res } from '@nestjs/common';
import { OAuthService } from '../service/oauth.service';
import { ApiTags } from '@nestjs/swagger';
import { Response, Request } from 'express';

@ApiTags('OAuth')
@Controller('oauth')
export class OAuthController {
  constructor(private readonly oauthService: OAuthService) {}

  @Get('google')
  async signupGoogle(@Res() res: Response) {
    return res.redirect(this.oauthService.getGoogleAuthUrl());
  }

  @Get('callback')
  async callback(@Req() req: Request, @Res() res: Response) {
    return res.redirect(await this.oauthService.callback(req));
  }
}
