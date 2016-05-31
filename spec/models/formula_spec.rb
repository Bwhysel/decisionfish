require 'rails_helper'

RSpec.describe Formula, type: :model do
  it { should validate_presence_of(:title) }
  it { should validate_presence_of(:equation) }
end
