class CreateIdeaLikes < ActiveRecord::Migration[5.1]
  def change
    create_table :idea_likes do |t|
      t.integer :user_id
      t.integer :idea_id

      t.timestamps
    end

    add_index :idea_likes, :user_id
    add_index :idea_likes, :idea_id
  end
end
