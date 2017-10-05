class CreateDesiSaysModals < ActiveRecord::Migration[5.1]
  def change
    create_table :desi_says_modals do |t|
      t.string :module
      t.string :slug
      t.text :content

      t.timestamps
    end
  end
end
