class Encouragement < ApplicationRecord
  include ChangeableContent

  self.table_name = 'encouragments'
end