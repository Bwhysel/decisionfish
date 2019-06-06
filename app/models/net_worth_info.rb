class NetWorthInfo < ApplicationRecord
  belongs_to :user

  scope :ordered, -> { order(when: :asc) }

end
