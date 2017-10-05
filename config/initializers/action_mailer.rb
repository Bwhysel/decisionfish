Rails.application.config.action_mailer.delivery_method = :smtp
Rails.application.config.action_mailer.smtp_settings = {
  :address => "email-smtp.us-west-2.amazonaws.com",
  :port => 587,
  :user_name => Rails.application.secrets.aws_ses_smtp_username,
  :password => Rails.application.secrets.aws_ses_smtp_password,
  :authentication => :login,
  :enable_starttls_auto => true
}