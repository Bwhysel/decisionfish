class RemoveAgeColumn < ActiveRecord::Migration[5.1]
  def change
    remove_column :users, :phone, :string
    remove_column :users, :pin_code, :string
    remove_column :users, :pin_code_generated_at, :datetime
    remove_column :users, :pin_code_sms_attempts, :string
    remove_column :users, :pin_code_last_sent_at, :datetime
    remove_column :users, :pin_code_fail_attempts, :string
    remove_column :users, :pin_code_last_fail_attempt_at, :datetime
    remove_column :users, :last_request_at, :string
    remove_column :users, :last_login_at, :string
    remove_column :users, :children, :integer, array: true, default: []
    remove_column :users, :last_position_at, :string
    remove_column :users, :email2, :string
    remove_column :users, :login_ip, :string

    remove_column :people, :name, :string
    remove_column :people, :sex, :string
    remove_column :people, :income, :integer
    remove_column :people, :age, :integer
  end
end
