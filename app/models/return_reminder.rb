class ReturnReminder < ApplicationRecord
  belongs_to :user

  def as_json
    {
      is_new: new_record?,
      next_time: next_time ? next_time.to_i : nil
    }
  end

  def self.delay_for(user, next_time)
    rr = user.return_reminder || user.build_return_reminder
    rr.next_time = next_time
    if rr.next_time_changed?
      Delayed::Job.find_by_id(rr.job_id)&.delete if rr.job_id.present?
      rr.job_id = next_time ? Delayed::Job.enqueue(ReminderJob.new(user.id), run_at: next_time).id : nil
    end
    rr.save
  end

end
