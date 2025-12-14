<<<<<<<< HEAD:server/test/config/common/fixture/activity.fixture.ts
import { Activity } from '../../../../src/activity/entity/activity.entity';
import { User } from '../../../../src/user/entity/user.entity';
========
import { Activity } from '../../../src/activity/entity/activity.entity';
import { User } from '../../../src/user/entity/user.entity';
>>>>>>>> 69c12e59 (♻️ refactor: test/fixture -\> test/config/fixture):server/test/config/fixture/activity.fixture.ts

export class ActivityFixture {
  static readonly DEFAULT_ACTIVITY = {
    activityDate: new Date('2024-01-01'),
    viewCount: 1,
  };

  static createActivityFixture(
    user: User,
    overwrites: Partial<Activity> = {},
    index = 1,
  ): Activity {
    const activity = new Activity();
    Object.assign(activity, {
      activityDate: new Date(
        this.DEFAULT_ACTIVITY.activityDate.getTime() +
          index * 24 * 60 * 60 * 1000,
      ),
      viewCount: this.DEFAULT_ACTIVITY.viewCount,
    });
    Object.assign(activity, overwrites);
    activity.user = user;
    return activity;
  }
}
