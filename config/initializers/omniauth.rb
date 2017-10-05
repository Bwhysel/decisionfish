Rails.application.config.middleware.use OmniAuth::Builder do
  provider :google_oauth2, Rails.application.secrets.google[:client_id], Rails.application.secrets.google[:client_secret]
end
OmniAuth.config.logger = Rails.logger