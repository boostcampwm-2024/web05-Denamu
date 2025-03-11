import { UserRepository } from '../repository/user.repository';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async signupUser(signupDto: SignupDto) {
    // do sign up
    // check is user exist
    // check is user confirmed
  }
}
