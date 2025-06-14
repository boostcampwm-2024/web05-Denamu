import { Activity } from '../../src/activity/entity/activity.entity';
import { User } from '../../src/user/entity/user.entity';

export class ActivityFixture {
  static readonly DEFAULT_ACTIVITY = {
    activityDate: new Date('2024-01-01'),
    viewCount: 1,
  };

  static createActivityFixture(
    user: User,
    overwrites: Partial<Activity> = {},
  ): Activity {
    const activity = new Activity();
    Object.assign(activity, this.DEFAULT_ACTIVITY);
    Object.assign(activity, overwrites);
    activity.user = user;
    return activity;
  }

  static createMultipleActivitiesFixture(
    user: User,
    activitiesData: Array<{ activityDate: Date; viewCount: number }>,
  ): Activity[] {
    return activitiesData.map((data) => this.createActivityFixture(user, data));
  }

  static createActivityWithDateFixture(
    user: User,
    activityDate: Date,
    viewCount: number = 1,
  ): Activity {
    return this.createActivityFixture(user, { activityDate, viewCount });
  }
}
