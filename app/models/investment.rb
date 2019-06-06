class Investment < ApplicationRecord
  belongs_to :user

  def as_json
    ignore = %w(id created_at updated_at user_id)
    attrs = self.attributes.reject{|f,v| f.in?(ignore) }
    your_amounts.each{|k,v| attrs['your_amounts'][k] = v.to_i }
    new_charges.each{|k,v| attrs['new_charges'][k] = v.to_i }
    attrs
  end
end
