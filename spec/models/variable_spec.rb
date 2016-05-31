require 'rails_helper'

RSpec.describe Variable, type: :model do
  it { should validate_presence_of(:description) }
  it { should validate_presence_of(:name) }
  it { should allow_value("some_variable_3").for(:name) }
  it { should_not allow_value("_3_some_variable").for(:name) }
  it { should_not allow_value("3_some_variable").for(:name) }
end
