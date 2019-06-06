# Explicit Delayed::Job task because of we have to remove old task.
ReminderJob = Struct.new(:user_id) do
  def perform
    if u = User.find_by_id(user_id)
      UserMailer.remind_me_return(u).deliver_now
    end
  end

  def queue_name
    'reminders'
  end
end