class DesiSaysModal < ApplicationRecord
  include ChangeableContent

  def as_json
    temp = super
    temp[:path] = self.slug
    temp
  end

end
