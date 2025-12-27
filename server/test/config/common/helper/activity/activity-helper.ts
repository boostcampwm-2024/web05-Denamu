import { ActivityRepository } from '../../../../../src/activity/repository/activity.repository';
import { UserRepository } from '../../../../../src/user/repository/user.repository';
import { E2EHelper } from '../e2e-helper';

export class ActivityE2EHelper extends E2EHelper {
  public readonly userRepository: UserRepository;
  public readonly activityRepository: ActivityRepository;

  constructor() {
    super();
    this.activityRepository = this.app.get(ActivityRepository);
    this.userRepository = this.app.get(UserRepository);
  }
}
