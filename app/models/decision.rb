class Decision < ActiveRecord::Base
  validates :title, :description, presence: true

  has_many :formulas

  has_many :variables
end
