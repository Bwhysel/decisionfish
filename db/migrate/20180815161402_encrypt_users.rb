class EncryptUsers < ActiveRecord::Migration[5.1]
  def change
    {
      User => %w(
        phone pin_code pin_code_generated_at pin_code_sms_attempts pin_code_last_sent_at
        pin_code_fail_attempts pin_code_last_fail_attempt_at
        last_request_at last_login_at
        children last_position_at email2 login_ip
      ),
      Person => %w(name age income sex)
    }.each do |klass, fields|
      enc_fields = encrypted_fields(fields)
      change_table klass.table_name do |t|
        t.string *enc_fields
      end
    end
  end

  def encrypted_fields(fields)
    fields.map{|x| ["zzz_#{x}".to_sym, "zzz_#{x}_iv".to_sym] }.flatten
  end
end
