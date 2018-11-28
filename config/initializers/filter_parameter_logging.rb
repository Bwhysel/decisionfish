# Be sure to restart your server when you modify this file.

# Configure sensitive parameters which will be filtered from the log file.
Rails.application.config.filter_parameters += [:password, :email, :name, :age, :sex, :income,
  :phone, :pin_code, :pin_code_generated_at, :pin_code_sms_attempts, :pin_code_last_sent_at,
  :pin_code_fail_attempts, :pin_code_last_fail_attempt_at, :last_request_at, :last_login_at,
  :children, :last_position_at, :email2, :login_ip]
