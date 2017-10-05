Recaptcha.configure do |config|
  config.site_key  = Rails.application.secrets.recaptcha[:key],
  config.secret_key = Rails.application.secrets.recaptcha[:secret]
end