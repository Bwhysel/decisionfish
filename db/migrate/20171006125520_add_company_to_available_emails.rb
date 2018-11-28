class AddCompanyToAvailableEmails < ActiveRecord::Migration[5.1]
  def change
    add_column :available_emails, :company, :string
  end
end
