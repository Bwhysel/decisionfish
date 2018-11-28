class CreateNetWorthInfos < ActiveRecord::Migration[5.1]
  def change
    create_table :net_worth_infos do |t|
      t.references :user, foreign_key: true
      t.decimal :amount
      t.date :when

      t.timestamps
    end
  end
end
