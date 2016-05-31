class PagesController < ApplicationController
  def show
    if valid_page?
      render template: "pages/#{params[:page]}"
    else
      render file: "public/404.html", status: :not_found
    end

    if params[:back_to_default]
      if session[:'warden.user.user.key']
        devise = session[:'warden.user.user.key']
        session.clear
        session[:'warden.user.user.key'] = devise
      else
        session.clear
      end
    end
  end

  private

  def valid_page?
    File.exist?(Pathname.new(Rails.root + "app/views/pages/#{params[:page]}.html.erb"))
  end
end
