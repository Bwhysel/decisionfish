class RenameStudentRatesInLoans < ActiveRecord::Migration[5.1]
  def change
    rename_column :loans, :sudent_loans_names, :student_loans_names
    rename_column :loans, :sudent_loans_rates, :student_loans_rates
  end
end
