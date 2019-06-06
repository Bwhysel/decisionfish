class Idea < ApplicationRecord
  before_save :sanitize_content
  scope :approved, -> { where(approved: true) }
  scope :pending, -> { where(approved: false) }
  scope :reported, -> { where(reported: true) }
  scope :with_likes, -> { includes(:likes) }
  has_many :likes, class_name: 'IdeaLike'

  TITLES = {
    basics:  'Basics',
    love:    'Love & Friendship',
    respect: 'Respect & Pride',
    expert:  'Being Good at Something',
    control: 'In Control of Your Life',
    helping: 'Helping Others',
    fun:     'Leisure & Fun',
    none:    'Other'
  }

  SAVES_MONEY = {
    0 => 'Costs nothing',
    1 => 'Save money',
    2 => 'Make money'
  }

  def need_s
    TITLES[need.to_sym]
  end

  def saves_money_s
    SAVES_MONEY[saves_money]
  end

  def as_short_json
    {
      id: id,
      saves_money: saves_money,
      content: content,
      user: our? ? user_name : 'Anonymous'
    }
  end

  def report!
    unless our?
      self.reported = true
      self.save
    end
  end

  def like!(user)
    if approved? && !likes.by(user).exists?
      like = likes.build(user_id: user.id)
      like.save!
    end
  end

  def our?
    user_id == 0
  end

private

  include ActionView::Helpers
  def sanitize_content
    unless our?
      self.content = sanitize(content, tags: ['br'])
    end
    self.content.gsub!("\n", "<br/>")
  end

end
