module ChangeableContent
  extend ActiveSupport::Concern

  def as_json
    {
      content: self.content.gsub('"','&quot;')
    }
  end

end