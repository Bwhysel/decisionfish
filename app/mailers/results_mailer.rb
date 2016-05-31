class ResultsMailer < ApplicationMailer
  def send_results(email, banks_decision, decision_fish_decision, my_decision)
    @banks_decision = banks_decision
    @decision_fish_decision = decision_fish_decision
    @my_decision = my_decision

    mail to: email, subject: "I made a decision with Decision Fish!"
  end
end
