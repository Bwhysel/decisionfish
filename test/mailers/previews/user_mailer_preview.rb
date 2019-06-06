# Preview all emails at http://localhost:3000/rails/mailers/user_mailer
class UserMailerPreview < ActionMailer::Preview

  def ask_desi
    UserMailer.ask_desi('Some question')
  end
end
