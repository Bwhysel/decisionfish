class Formula < ActiveRecord::Base
  validates :title, :equation, presence: true

  belongs_to :decision
end
