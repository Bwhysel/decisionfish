class HomeController < ApplicationController
  def index
    if params[:auto_login].present? && Rails.env.development?
      sess = UserSession.new(User.first)
      sess.save
      session[:phone_verified] = true
    end
  end

  def additional_content
    render json: {
      jokes: Joke.all.map{|x| x.as_json },
      encouragments: Encouragment.all.map{|x| x.as_json },
      bubbles: DesiSaysModal.all.map{|x| x.as_json }
    }
  end

end
