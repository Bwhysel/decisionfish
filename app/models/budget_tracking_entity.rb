class BudgetTrackingEntity < ApplicationRecord
  belongs_to :user

  enum notify_period: {unset: 0, daily: 1, weekly: 2, monthly: 3, over_spending: 4 }

  def as_json
    {
      other_email: other_email,
      notify_period: self.class.notify_periods[notify_period]
    }
  end

  def self.today_notifiable(to_date)
    # The middle of a period
    period_ids = [:daily, :over_spending] # daily users & over_spending
    period_ids.push(:weekly) if to_date.wday == 5 # weekly - on Friday
    period_ids.push(:monthly) if to_date.day == 15

    self.all.includes(user: [:persons, :budget_category, :mx_user]).where(notify_period: period_ids)
  end

  def self.task
    to_date = Date.today

    # to_date.day == 2 means that we calculated spending for the 1st day.
    # so we don't need to check changes in SpendingTooFast catgories.
    # to_date.day == 1 means that we checked last day of month and we need to check last two days of moth

    not_a_first_day = to_date.day != 1
    today_notifiable(to_date).find_each(batch_size: 10) do |tracking_entity|
      user = tracking_entity.user
      next unless user.mx_user # && !disabled mx
      send_msg = true
      too_fast, too_slow = MxTransaction.group_by_date(user, to_date)
      if tracking_entity.over_spending? && not_a_first_day
        too_fast2, too_slow2 = MxTransaction.group_by_date(user, to_date)
        send_msg = !(too_fast.keys - too_fast2.keys).blank?
      end
      if send_msg
        UserMailer.tracking(user, tracking_entity.other_email, too_fast, too_slow).deliver_now
      end
    end
  end

end
