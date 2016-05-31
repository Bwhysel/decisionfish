class Variable < ActiveRecord::Base
  validates :title, :description, :name, :type, :decision_id, presence: true
  validates :name, format: { with: /\A((?!_)[a-zA-z]){1}[\w]*\z/,
                             message: "only allows letters, digits"\
                                      " and underscore, should start with letter" }

  belongs_to :decision
end
