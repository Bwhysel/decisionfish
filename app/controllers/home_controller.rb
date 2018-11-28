class HomeController < ApplicationController
  def index
    i = params[:auto_login]
    if i.present? && !Rails.env.production? && i.to_i.in?([1,2])
      user = User.find_by_id(i)
      if user
        sess = UserSession.new(user, true)
        sess.save
        session[:phone_verified] = true
        @current_user = user
      end
    end
    @reminder = current_user&.get_reminder&.as_json
  end

  def additional_content
    render json: {
      jokes: Joke.all.map{|x| x.as_json },
      encouragments: Encouragement.all.map{|x| x.as_json },
      bubbles: DesiSaysModal.all.map{|x| x.as_json }
    }
  end

end
