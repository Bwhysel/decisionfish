Atrium.configure do |config|
  config.mx_api_key = Rails.application.secrets.mx[:api_key]
  config.mx_client_id = Rails.application.secrets.mx[:client_id]
  config.base_url = Rails.env.production? ? "https://atrium.mx.com" : "https://vestibule.mx.com"
end