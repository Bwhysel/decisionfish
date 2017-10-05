class AvailableEmail < ApplicationRecord

  def self.valid?(email)
    name, domain = email.split('@')
    self.where("email_pattern = ? OR email_pattern = ?", email, '*@'+domain).exists?
  end

end
