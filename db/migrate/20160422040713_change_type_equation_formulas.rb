class ChangeTypeEquationFormulas < ActiveRecord::Migration
  def up
    change_column :formulas, :equation, :text
  end

  def down
    change_column :formulas, :equation, :string
  end
end
