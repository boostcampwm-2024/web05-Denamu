import { ProviderRepository } from '../../../../../src/user/repository/provider.repository';
import { OAuthService } from '../../../../../src/user/service/oauth.service';
import { E2EHelper } from '../e2e-helper';

export class OAuthE2EHelper extends E2EHelper {
  public readonly providerRepository: ProviderRepository;
  public readonly oauthService: OAuthService;

  constructor() {
    super();
    this.providerRepository = this.app.get(ProviderRepository);
    this.oauthService = this.app.get(OAuthService);
  }
}
