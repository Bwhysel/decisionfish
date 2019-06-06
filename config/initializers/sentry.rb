Raven.configure do |config|
  config.dsn = Rails.env.development? ? '' : 'https://634c584367ba4d848a1849612a1c66b7:905159af117f471cba2dbccd785b0381@sentry.io/1255504'
  config.sanitize_fields = Rails.application.config.filter_parameters.map(&:to_s)
end