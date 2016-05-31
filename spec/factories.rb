FactoryGirl.define do
  factory :user do
    email                  "some@mail.com"
    password               "password"
    password_confirmation  "password"
  end

  factory :decision do
    title       "Some decision"
    description "Decision description"
  end

  factory :formula do
    title       "formula title"
    equation    "formula equation"
  end

  factory :variable do
    title       "variable title"
    description "variable description"
    name        "variable_name"
    type        "FloatVariable"
    default     50.0
    pro         true
    order       2
  end
end
