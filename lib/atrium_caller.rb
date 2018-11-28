module AtriumCaller
  MAX_ATTEMPTS = 10

  def self.handle(user_guid, location, &block)
    attempt = 0
    while (attempt < MAX_ATTEMPTS)
      begin
        attempt += 1
        result = yield
        attempt = MAX_ATTEMPTS
      rescue Atrium::Error => e
        Rails.logger.info "#{Time.now.to_i}: #{location}. MX Error (attempt #{attempt}) on User ##{user_guid}. Err: #{e.message}"
        raise e if !e.message.include?('500')
      end
    end
    result
  end

end