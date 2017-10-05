class IdeaLike < ApplicationRecord
  belongs_to :user
  belongs_to :idea

  scope :by, ->(user){ where(user_id: user.id) }
end
