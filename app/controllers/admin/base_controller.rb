class Admin::BaseController < ApplicationController
  layout 'staff'
  helper_method :current_admin_user, :admin_authorized?
  before_action :check_auth
  skip_before_action :check_auth, only: [:login, :sign_in]

  def login
    if admin_authorized?
      redirect_to admin_jokes_path
    else
      render 'admin/login'
    end
  end

  def sign_in
    #Rails.logger.info "SIGN IN: #{request.env['omniauth.auth']}"
    @user = AdminUser.get_by_omniauth(request.env['omniauth.auth'])
    #@user = AdminUser.first
    #if @user.password == params[:password]
    if @user
      Rails.logger.info "SIGN IN: #{@user.id}"
      session[:admin_user_id] = @user.id
      redirect_to admin_jokes_path
    else
      flash[:alert] = "Failed login. Please, try again."
      redirect_to admin_login_path
    end
    #  render 'new'
    #end
  end

  def logout
    session[:admin_user_id] = nil
    @current_admin_user = nil
    redirect_to admin_login_path
  end

private

  def check_auth
    unless admin_authorized?
      redirect_to admin_login_path
    end
  end

  def admin_authorized?
    current_admin_user.present?
  end

  def current_admin_user
    if session[:admin_user_id]
      Rails.logger.info "SESSION: #{session[:admin_user_id]}"
      @current_admin_user ||= AdminUser.find_by_id(session[:admin_user_id])
    else
      Rails.logger.info "SESSION IS NULL"
      nil
    end
  end


end
