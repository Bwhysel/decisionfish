class BudgetTrackingEntity < ApplicationRecord
  belongs_to :user

  before_create :generate_unsubscribe_hash
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
    # It runs at 1:00, so transactions should be checked on the previous date.
    to_date = Date.today - 1.day

    # to_date.day == 2 means that we calculated spending for the 1st day.
    # so we don't need to check changes in SpendingTooFast catgories.
    # to_date.day == 1 means that we checked last day of month and we need to check last two days of month
    not_a_first_day = to_date.day != 1

    today_notifiable(to_date).find_each(batch_size: 1) do |tracking_entity|
      do_not_send = false
      user = tracking_entity.user
      next unless user.mx_user # && !disabled mx

      check_prev = tracking_entity.over_spending? && not_a_first_day
      totals, totals2 = MxTransaction.grouped_by_categories(user, to_date, check_prev)

      too_fast, too_slow = MxTransaction.dynamic_stats(user, to_date, totals)
      if check_prev
        too_fast2, too_slow2 = MxTransaction.dynamic_stats(user, to_date - 1.day, totals2)
        do_not_send = (too_fast.keys - too_fast2.keys).blank?
      end

      unless do_not_send
        UserMailer.tracking(user, tracking_entity.other_email, too_fast, too_slow).deliver_now
      end
    end
  end

private

  def generate_unsubscribe_hash
    self.unsubscribe_hash = SecureRandom.hex(24)
  end
end
