class Person < ApplicationRecord
  belongs_to :user
  scope :mine, -> (user) { where(user_id: user.id) }

   %w(name age sex income).each do |field_name|
    attr_encrypted field_name.to_sym, key: ->(person) { person.encryption_key(field_name.to_sym) }, prefix: 'zzz_'
  end

  def as_json
    {
      id: id,
      age: age,
      income: income,
      sex: sex,
      name: name
    }
  end

  def encryption_key(field_name)
    [Rails.application.secrets.enc_keys[:people][field_name]].pack("H*")
  end

end
