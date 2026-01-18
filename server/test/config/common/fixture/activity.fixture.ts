import { Activity } from '@activity/entity/activity.entity';

import { User } from '@user/entity/user.entity';

const DAY_MS = 24 * 60 * 60 * 1000;

export class ActivityFixture {
  private static createBaseActivity(index = 0) {
    return {
      activityDate: new Date(new Date('2024-01-01').getTime() + index * DAY_MS),
      viewCount: 1,
    };
  }

  static createActivityFixture(
    user: User,
    overwrites: Partial<Activity> = {},
    index = 0,
  ): Activity {
    const activity = new Activity();
    return Object.assign(
      activity,
      this.createBaseActivity(index),
      {
        user,
      },
      overwrites,
    );
  }

  static createActivitiesFixture(user: User, count = 1): Activity[] {
    return Array.from({ length: count }, (_, index) =>
      this.createActivityFixture(user, { viewCount: (index + 1) * 2 }, index),
    );
  }
}
