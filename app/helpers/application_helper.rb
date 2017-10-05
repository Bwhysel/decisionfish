module ApplicationHelper

  def ask_icon
    content_tag :span, '', class: 'icon ask-desi'
  end

  def admin_idea_back_path(idea)
    if idea.reported?
      reported_admin_ideas_path
    elsif !idea.approved?
      pending_admin_ideas_path
    else
      admin_ideas_path
    end
  end
end
