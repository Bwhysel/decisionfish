Atrium.configure do |config|
  config.mx_api_key = Rails.application.secrets.mx[:api_key]
  config.mx_client_id = Rails.application.secrets.mx[:client_id]
  #config.base_url = "https://atrium.mx.com" # base_url is set to "https://vestibule.mx.com" by default
end