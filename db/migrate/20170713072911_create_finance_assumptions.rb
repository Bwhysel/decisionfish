class CreateFinanceAssumptions < ActiveRecord::Migration[5.1]
  def change
    create_table :finance_assumptions do |t|
      t.integer :user_id
      t.decimal :longevity_risk
      t.decimal :inflation
      t.integer :college_age
      t.decimal :years_in_college
      t.decimal :college_inflation
      t.integer :college_type
      t.decimal :income_growth
      t.decimal :income_growth2
      t.integer :until_age
      t.decimal :yearly_pension_benefit1
      t.integer :yearly_pension_benefit_begins_at_age1
      t.decimal :yearly_pension_benefit2
      t.integer :yearly_pension_benefit_begins_at_age2
      t.integer :retirement_expence_change
      t.decimal :rt_avg
      t.decimal :rt_re
      t.decimal :rt_loan
      t.decimal :ss_benefit_cut
      t.integer :soc_sec_min_age
      t.decimal :mortgage_rate
      t.integer :original_term
      t.integer :mortgage_age

      t.timestamps
    end

    add_index :finance_assumptions, :user_id
  end
end
