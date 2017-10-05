class Person < ApplicationRecord
  belongs_to :user
  scope :mine, -> (user) { where(user_id: user.id) }

  def as_json
    {
      id: id,
      age: age,
      income: income,
      sex: sex,
      name: name
    }
  end
end
