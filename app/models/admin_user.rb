class AdminUser < ApplicationRecord
  WHITELIST = %w(brett@decisionfish.com noreen@decisionfish sm@re-mondes.com ilya@re-mondes.com bwhysel@gmail.com nwhysel@gmail.com)

  def password=(new_password)
    self.password_hash = BCrypt::Password.create(new_password).to_s
  end

  def password
    @password ||= BCrypt::Password.new(password_hash)
  end

  def self.get_by_omniauth(access_token)
    info = access_token.info
    raw_info = access_token.extra['raw_info']
    email = info['email']
    is_email_verified = raw_info['email_verified']
    unless is_email_verified
      Rails.logger.info
    end
    if (WHITELIST.include?(email) && is_email_verified)
      user = AdminUser.find_or_initialize_by(email: email)
      user.update_attribute(:name, info['name'])
      user
    end
  end

end
