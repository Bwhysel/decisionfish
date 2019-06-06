class AvailableEmail < ApplicationRecord

  scope :by_email, ->(email) {
    name, domain = email.split('@')
    self.where("email_pattern = ? OR email_pattern = ?", email, '*@'+domain)
  }

  def self.valid?(email)
    by_email(email).exists?
  end

  def self.get_for(email)
    by_email(email).last
  end

end
