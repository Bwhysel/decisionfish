class BudgetNeed < ApplicationRecord
  belongs_to :user

  def as_json
    ignore = %w(created_at updated_at user_id)
    self.attributes.reject{|f,v| f.in?(ignore) }
  end
end
