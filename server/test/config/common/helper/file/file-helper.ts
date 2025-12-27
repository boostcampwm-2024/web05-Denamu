import { FileRepository } from '../../../../../src/file/repository/file.repository';
import { UserRepository } from '../../../../../src/user/repository/user.repository';
import { E2EHelper } from '../e2e-helper';

export class FileE2EHelper extends E2EHelper {
  public readonly fileRepository: FileRepository;
  public readonly userRepository: UserRepository;

  constructor() {
    super();
    this.fileRepository = this.app.get(FileRepository);
    this.userRepository = this.app.get(UserRepository);
  }
}
