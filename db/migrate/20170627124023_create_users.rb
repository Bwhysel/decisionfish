class CreateUsers < ActiveRecord::Migration[5.1]
  def change
    create_table :users do |t|
      t.string  :email
      t.string  :phone
      t.boolean :phone_verified

      t.string   :pin_code
      t.datetime :pin_code_generated_at

      t.integer  :pin_code_sms_attempts, default: 0
      t.datetime :pin_code_last_sent_at

      t.integer  :pin_code_fail_attempts, default: 0
      t.datetime :pin_code_last_fail_attempt_at

      t.string :persistence_token
      t.index  :persistence_token, unique: true
      t.string :perishable_token
      t.index  :perishable_token, unique: true

      t.string :last_request_at
      t.string :last_login_at

      t.timestamps
    end
  end
end
