class RecalcNetWorthJob < ApplicationJob
  queue_as :default

  def perform(user_id)
    MxTransaction.fill_balances_history(User.find(user_id), true)
  end
end