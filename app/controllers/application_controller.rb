class ApplicationController < ActionController::Base
  protect_from_forgery with: :exception
  helper_method :current_user_session, :current_user, :authorized?
  before_action :set_raven_context
  layout 'home'


  def user_logged_in
    if !current_user
      respond_to do |f|
        f.json { render json: {result: 'error', msg: 'Login is required'}}
        f.html { redirected_to root_url }
      end
      return
    end
  end

  def user_authorized
    unless authorized?
      respond_to do |f|
        f.json { render json: {result: 'error', msg: 'Approved account is required'}}
        f.html { redirected_to root_url }
      end
    end
  end

private

  def set_raven_context
    Raven.user_context(id: current_user&.id, env: Rails.env.to_s) # or anything else in session
  end

  def current_user_session
    return @current_user_session if defined?(@current_user_session)
    @current_user_session = UserSession.find
  end

  def current_user
    return @current_user if defined?(@current_user)
    @current_user = current_user_session && current_user_session.user
  end

  def authorized?
    current_user.present? && session[:phone_verified]
  end

end
