# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 20180822195505) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "admin_users", force: :cascade do |t|
    t.string "name"
    t.string "password_hash"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "email"
  end

  create_table "available_emails", force: :cascade do |t|
    t.string "email_pattern"
    t.integer "used_count", default: 0
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "company"
  end

  create_table "big_decisions", force: :cascade do |t|
    t.integer "user_id"
    t.integer "monthly_savings"
    t.integer "retire_age"
    t.decimal "parent_contribute"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id"], name: "index_big_decisions_on_user_id"
  end

  create_table "budget_categories", force: :cascade do |t|
    t.integer "user_id"
    t.integer "housing"
    t.integer "transportation"
    t.integer "health_care"
    t.integer "insurance"
    t.integer "groceries"
    t.integer "dining_out"
    t.integer "personal_care"
    t.integer "clothing"
    t.integer "entertaining"
    t.integer "fitness"
    t.integer "education"
    t.integer "charity"
    t.integer "vacation"
    t.integer "fun"
    t.integer "everything"
    t.integer "credit_card"
    t.integer "savings"
    t.string "fun_need"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.boolean "housing_spend"
    t.boolean "transportation_spend"
    t.boolean "health_care_spend"
    t.boolean "insurance_spend"
    t.boolean "groceries_spend"
    t.boolean "dining_out_spend"
    t.boolean "personal_care_spend"
    t.boolean "clothing_spend"
    t.boolean "entertaining_spend"
    t.boolean "fitness_spend"
    t.boolean "education_spend"
    t.boolean "charity_spend"
    t.boolean "vacation_spend"
    t.boolean "fun_spend"
    t.boolean "credit_card_spend"
    t.boolean "savings_spend"
    t.string "fun_caption"
    t.integer "housing_diff", default: 0
    t.integer "transportation_diff", default: 0
    t.integer "health_care_diff", default: 0
    t.integer "insurance_diff", default: 0
    t.integer "groceries_diff", default: 0
    t.integer "dining_out_diff", default: 0
    t.integer "personal_care_diff", default: 0
    t.integer "clothing_diff", default: 0
    t.integer "entertaining_diff", default: 0
    t.integer "fitness_diff", default: 0
    t.integer "education_diff", default: 0
    t.integer "charity_diff", default: 0
    t.integer "vacation_diff", default: 0
    t.integer "fun_diff", default: 0
    t.integer "everything_diff", default: 0
    t.integer "credit_card_diff", default: 0
    t.integer "savings_diff", default: 0
    t.string "fun_mx_category"
    t.index ["user_id"], name: "index_budget_categories_on_user_id"
  end

  create_table "budget_needs", force: :cascade do |t|
    t.integer "user_id"
    t.boolean "basics_met"
    t.boolean "love_met"
    t.boolean "respect_met"
    t.boolean "control_met"
    t.boolean "expert_met"
    t.boolean "helping_met"
    t.boolean "fun_met"
    t.integer "basics_value"
    t.integer "love_value"
    t.integer "respect_value"
    t.integer "control_value"
    t.integer "expert_value"
    t.integer "helping_value"
    t.integer "fun_value"
    t.integer "none_value"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id"], name: "index_budget_needs_on_user_id"
  end

  create_table "budget_tracking_entities", force: :cascade do |t|
    t.integer "user_id"
    t.integer "mx_user_id"
    t.string "other_email"
    t.integer "notify_period"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "unsubscribe_hash"
  end

  create_table "delayed_jobs", force: :cascade do |t|
    t.integer "priority", default: 0, null: false
    t.integer "attempts", default: 0, null: false
    t.text "handler", null: false
    t.text "last_error"
    t.datetime "run_at"
    t.datetime "locked_at"
    t.datetime "failed_at"
    t.string "locked_by"
    t.string "queue"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.index ["priority", "run_at"], name: "delayed_jobs_priority"
  end

  create_table "desi_says_modals", force: :cascade do |t|
    t.string "module"
    t.string "slug"
    t.text "content"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "encouragments", force: :cascade do |t|
    t.text "content"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "finance_assumptions", force: :cascade do |t|
    t.integer "user_id"
    t.decimal "longevity_risk"
    t.decimal "inflation"
    t.integer "college_age"
    t.decimal "years_in_college"
    t.decimal "college_inflation"
    t.integer "college_type"
    t.decimal "income_growth"
    t.decimal "income_growth2"
    t.integer "until_age"
    t.decimal "yearly_pension_benefit1"
    t.integer "yearly_pension_benefit_begins_at_age1"
    t.decimal "yearly_pension_benefit2"
    t.integer "yearly_pension_benefit_begins_at_age2"
    t.decimal "retirement_expence_change"
    t.decimal "rt_avg"
    t.decimal "rt_re"
    t.decimal "rt_loan"
    t.decimal "ss_benefit_cut"
    t.integer "soc_sec_min_age"
    t.decimal "mortgage_rate"
    t.integer "original_term"
    t.integer "mortgage_age"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "value_of_housework"
    t.decimal "income_replacement"
    t.decimal "rt_cash"
    t.decimal "rt_fi"
    t.decimal "rt_eq"
    t.decimal "rt_cash_alloc"
    t.decimal "rt_fi_alloc"
    t.decimal "rt_eq_alloc"
    t.integer "net_college_cost"
    t.integer "soc_sec1"
    t.integer "soc_sec2"
    t.index ["user_id"], name: "index_finance_assumptions_on_user_id"
  end

  create_table "finance_details", force: :cascade do |t|
    t.integer "cash", default: 0
    t.integer "college_savings", default: 0
    t.integer "retirement_savings", default: 0
    t.integer "credit_cards", default: 0
    t.integer "student_loans", default: 0
    t.integer "other_debts", default: 0
    t.integer "home_value", default: 0
    t.integer "mortgage", default: 0
    t.integer "user_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id"], name: "index_finance_details_on_user_id"
  end

  create_table "idea_likes", force: :cascade do |t|
    t.integer "user_id"
    t.integer "idea_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["idea_id"], name: "index_idea_likes_on_idea_id"
    t.index ["user_id"], name: "index_idea_likes_on_user_id"
  end

  create_table "ideas", force: :cascade do |t|
    t.integer "user_id"
    t.string "need"
    t.string "user_name"
    t.string "user_email"
    t.text "content"
    t.integer "saves_money", default: 0
    t.boolean "reported", default: false
    t.boolean "approved", default: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id"], name: "index_ideas_on_user_id"
  end

  create_table "investments", force: :cascade do |t|
    t.integer "user_id"
    t.integer "efund_months", default: 6
    t.integer "efund_current", default: 0
    t.decimal "p401_percent_income_1", default: "3.0"
    t.decimal "p401_percent_income_2", default: "3.0"
    t.decimal "p401_percent_match_1", default: "50.0"
    t.decimal "p401_percent_match_2", default: "50.0"
    t.jsonb "your_amounts", default: {}
    t.jsonb "new_charges", default: {}
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id"], name: "index_investments_on_user_id"
  end

  create_table "jokes", force: :cascade do |t|
    t.text "content"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "loans", force: :cascade do |t|
    t.integer "user_id"
    t.integer "credit_cards", default: [], array: true
    t.integer "student_loans", default: [], array: true
    t.integer "other_debts", default: [], array: true
    t.string "credit_cards_names", default: [], array: true
    t.string "student_loans_names", default: [], array: true
    t.string "other_debts_names", default: [], array: true
    t.decimal "credit_cards_rates", default: [], array: true
    t.decimal "student_loans_rates", default: [], array: true
    t.decimal "other_debts_rates", default: [], array: true
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "mx_users", force: :cascade do |t|
    t.integer "user_id"
    t.string "guid"
    t.boolean "is_disabled"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "notify_period"
    t.index ["user_id"], name: "index_mx_users_on_user_id"
  end

  create_table "net_worth_infos", force: :cascade do |t|
    t.bigint "user_id"
    t.decimal "amount"
    t.date "when"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id"], name: "index_net_worth_infos_on_user_id"
  end

  create_table "people", force: :cascade do |t|
    t.integer "user_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "zzz_name"
    t.string "zzz_name_iv"
    t.string "zzz_age"
    t.string "zzz_age_iv"
    t.string "zzz_income"
    t.string "zzz_income_iv"
    t.string "zzz_sex"
    t.string "zzz_sex_iv"
    t.index ["user_id"], name: "index_people_on_user_id"
  end

  create_table "return_reminders", force: :cascade do |t|
    t.bigint "user_id"
    t.integer "notify_period", default: 1
    t.datetime "next_time"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.bigint "job_id"
    t.index ["user_id"], name: "index_return_reminders_on_user_id"
  end

  create_table "users", force: :cascade do |t|
    t.string "email"
    t.string "persistence_token"
    t.string "perishable_token"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.boolean "phone_verified", default: false
    t.string "zzz_phone"
    t.string "zzz_phone_iv"
    t.string "zzz_pin_code"
    t.string "zzz_pin_code_iv"
    t.string "zzz_pin_code_generated_at"
    t.string "zzz_pin_code_generated_at_iv"
    t.string "zzz_pin_code_sms_attempts"
    t.string "zzz_pin_code_sms_attempts_iv"
    t.string "zzz_pin_code_last_sent_at"
    t.string "zzz_pin_code_last_sent_at_iv"
    t.string "zzz_pin_code_fail_attempts"
    t.string "zzz_pin_code_fail_attempts_iv"
    t.string "zzz_pin_code_last_fail_attempt_at"
    t.string "zzz_pin_code_last_fail_attempt_at_iv"
    t.string "zzz_last_request_at"
    t.string "zzz_last_request_at_iv"
    t.string "zzz_last_login_at"
    t.string "zzz_last_login_at_iv"
    t.string "zzz_children"
    t.string "zzz_children_iv"
    t.string "zzz_last_position_at"
    t.string "zzz_last_position_at_iv"
    t.string "zzz_email2"
    t.string "zzz_email2_iv"
    t.string "zzz_login_ip"
    t.string "zzz_login_ip_iv"
    t.index ["perishable_token"], name: "index_users_on_perishable_token", unique: true
    t.index ["persistence_token"], name: "index_users_on_persistence_token", unique: true
  end

  add_foreign_key "net_worth_infos", "users"
  add_foreign_key "return_reminders", "users"
end
