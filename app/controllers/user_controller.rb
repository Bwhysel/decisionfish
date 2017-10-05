class UserController < ApplicationController
  SEND_LINK_MSG = "Welcome to Decision Fish.<br/>I've sent you a confirmation email. Click on the link in the email to get started."
  SEND_LINK_MSG_FROM_LOGIN = "Please click on the link that I've emailed you so that I make or find your information."
  ALREADY_REGISTERED = "May I resend you an email confirmation link so that I can save your work securely so it doesn't get lost?"
  before_action :user_logged_in, only: [:verify_pin, :resend_pin]
  before_action :user_authorized, only: [:profile,:reset, :save_position]

  def create
    email = params[:email]
    phone = params[:phone]

    prev_user = User.find_by_email(email)
    if prev_user
      render json: {
        result: 'ok',
        already_registered: true,
        msg: ALREADY_REGISTERED
      }
    else
      @user = User.new(create_params)
      if @user.save
        @user.deliver_email_verify_instructions!
        render json: {
          result: 'ok',
          msg: SEND_LINK_MSG
        }
      else
        render json: {
          result: 'error',
          msg: @user.errors.full_messages.join("\n\n")
        }
      end
    end
  end

  def login
    email = params[:email].downcase
    @user = User.find_by_email(params[:email])
    if @user
      @user.reset_perishable_token!
      @user.deliver_email_verify_instructions!
      sleep 1
      render json: {
        result: 'ok',
        msg: (params[:from_signup].present? ? SEND_LINK_MSG : SEND_LINK_MSG_FROM_LOGIN)
      }
    else
      render json: {
        result: 'error',
        msg: "Please email desi@decisionfish.com for more information or ask your HR department to get you Decision Fish!"
      }
    end
  end

  def logout
    remove_session
    render json: { result: 'ok' }
  end

  def reset
    current_user.cleanup_data
    remove_session
    render json: { result: 'ok' }
  end

  def save_position
    current_user.update_column(:last_position_at, params[:pos])
    render json: { result: 'ok' }
  end

  # Form with PIN input
  def verify
    @user = User.find_using_perishable_token(params[:id]) if params[:id]
    if @user
      @session = UserSession.new(@user)
      @session.save
    elsif params[:id]
      redirect_to verify_path and return
    else
      @user = current_user
    end

    if @user
      @masked_phone = @user.masked_phone

      if Rails.env.development?
        resp = {
          'status' => 0,
          'duration' => 1000
        }
      else
        resp = @user.send_phone_verification_code!
      end

      @send_msg = resp['error-text']
      @status = resp['status'].to_i
      if @status > 0
        @error = 'Some problem with sending PIN code:<br/>'
        @error += @send_msg
      end
      @next_resend_after = resp['duration']
      @next_submit_after = @user.next_pin_submit_after

    else
      redirect_to root_url
    end
  end

  def resend_pin
    sms_response = current_user.send_phone_verification_code!
    if sms_response['status'] > '0'
      @error = 'Some problem with sending PIN code.<br/>'
      @error += sms_response['error-text']
      @duration = sms_response['duration']
    end
  end

  def verify_pin
    resp = current_user.verify_pin!(params[:pin])
    if resp[:result] == 'error'
      redirect_to verify_path
    else
      session[:phone_verified] = true
      redirect_to '/family'
    end
  end

  def update_phone
    if current_user && params[:phone] != current_user.phone && !current_user.phone_verified?
      current_user.update_attribute(:phone, params[:phone])
      render json: {result: 'ok', msg: "Try to <a href='/verify'>verify</a> your phone number again."}
    else
      render json: {result: 'error', msg: 'Not enough data to update phone'}
    end
  end

  def profile
    persons = Person.mine(current_user).collect(&:as_json)
    data = {}
    if persons.present?
      persons[0].merge!({email: current_user.email, phone: current_user.phone})
      data[:storage] = {
        people:   persons,
        children: current_user.children,
        finances: current_user.finance_details&.as_json,
        big_decision: current_user.big_decision&.as_json,
        retirement_funding: current_user.big_decision&.calc!,
        budget_needs: current_user.budget_need&.as_json,
        budget_categories: current_user.budget_category&.as_json,
        budget_tracking: current_user.budget_tracking_entity&.as_json,
        loans:  current_user.loans&.as_json,
      }
      data[:result] = 'ok'
    else
      data[:result] = 'empty_account'
    end

    render json: data
  end

  def get_position
    render json: {pos: current_user.last_position_at}
  end

  def get_idea
    scoped = Idea.approved
    #scoped = scoped.where.not(user_email: params[:email]) if params[:email] != 'desi@decisionfish.com'

    allowed_needs = Idea::TITLES.keys
    need = params['need']
    need = allowed_needs.first unless allowed_needs.include?(need)
    scoped = scoped.where(need: [need, 'all'])

    allowed_saves_money = Idea::SAVES_MONEY.keys
    saves_money = params['saves_money'].to_i
    saves_money = allowed_saves_money.first unless allowed_saves_money.include?(saves_money)

    ideas = scoped.where(saves_money: saves_money).to_a
    idea = ideas[(ideas.length * rand).floor]

    if idea
      render json: {idea: idea.as_short_json}
    else
      render json: {error: "I'm sorry, I don't have any ideas right now. Please contribute your own."}
    end
  end

  def report_idea
    idea = Idea.approved.find_by_id(params[:id])
    idea.report!
    render json: {result: 'ok'}
  end

  def give_idea
    idea_params = params.require(:idea).permit(:need, :content, :saves_money, :user_name, :user_email)
    idea_params[:approved] = false
    idea_params[:user_id] = current_user&.id
    Idea.create!(idea_params)
    render json: {result: 'ok'}
  end

  def like_idea
    idea = Idea.approved.find_by_id(params[:id])
    idea.like!(current_user) if authorized? && idea
    render json: {result: 'ok'}
  end

private

  def remove_session
    if user_session = UserSession.find
      user_session.destroy
      session[:phone_verified] = false
    end
  end
  def create_params
    { email: params[:email], phone: params[:phone] }
  end

end
