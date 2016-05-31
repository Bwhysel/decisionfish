# Preview all emails at http://localhost:3000/rails/mailers/results_mailer
class ResultsMailerPreview < ActionMailer::Preview
  def send_results_preview
    ResultsMailer.send_results('example@world.net', 290000, 250000, 260000)
  end
end
