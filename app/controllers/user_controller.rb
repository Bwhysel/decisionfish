class UserController < ApplicationController
  SEND_LINK_MSG = "Welcome to Decision Fish.<br/>I've emailed a link to <u>$EMAIL</u>. Click on that link to get started!"
  SEND_LINK_MSG_FROM_LOGIN = "Please click on the link that I've emailed you so that I can find your saved information or create a new account."
  ALREADY_REGISTERED = "I already have work saved for this email. Click SEND to get a link by email so you can log in."
  before_action :user_logged_in, only: [:verify_pin, :resend_pin]
  before_action :user_authorized, only: [:profile,:reset, :save_position, :get_position]

  def create
    email = params[:email].downcase
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
      @user.login_ip = request.remote_ip
      if @user.save
        @user.deliver_email_verify_instructions!
        p1_params = params.require(:person1).permit(:name, :age, :sex, :age, :income)
        @user.persons.create(p1_params) if p1_params.present?
        if params['person2'].present?
          p2_params = params.require(:person2).permit(:name, :age, :sex, :age, :income)
          @user.persons.create(p2_params) if p2_params.present?
        end
        render json: {
          result: 'ok',
          msg: send_link_msg(email)
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
    @user = User.find_by_email(email)
    session[:user_return_to] = params[:return_to]
    if @user
      @user.login_ip = request.remote_ip
      @user.reset_perishable_token!
      @user.deliver_email_verify_instructions!
      sleep 1
      render json: {
        result: 'ok',
        msg: (params[:from_signup].present? ? send_link_msg(email) : SEND_LINK_MSG_FROM_LOGIN)
      }
    elsif AvailableEmail.valid?(email)
      render json: {result: 'whitelist'}
    else
      render json: {
        result: 'error',
        msg: "Please email desi@decisionfish.com for more information or ask your HR department to get you Decision Fish!"
      }
    end
  end

  def logout
    current_user&.update_attribute(:last_position_at, params[:pos])
    remove_session
    render json: { result: 'ok' }
  end

  def reset
    current_user.cleanup_data
    remove_session
    render json: { result: 'ok' }
  end

  def save_position
    current_user.update_attribute(:last_position_at, params[:pos])
    render json: { result: 'ok' }
  end

  # Form with PIN input
  def verify
    @user = User.find_using_perishable_token(params[:id]) if params[:id]
    # Do not verify user in case of different IP.
    # The reason: some email providers check links from mail before user opened it.
    # Case: https://trello.com/c/Fr34PEOn/187-check-on-email-verification#action-5a82e54b45fd328a5a2296bf
    @user = nil if @user && @user.login_ip != request.remote_ip

    if @user
      @session = UserSession.new(@user, true)
      if @session.save
        @current_user = @user
      else
        Rails.logger.info "SES_DEBUG: #{@user.id}: session: #{@session}; Errors: #{@session.errors.full_messages}"
        @user = nil
      end
    elsif params[:id]
      redirect_to verify_path and return
    else
      @user = current_user
    end

    if @user
      @masked_phone = @user.masked_phone

      if @masked_phone.blank?
        resp = {
          'status' => 404,
          'error-text' => 'Please, fill the phone number',
        }
      elsif Rails.env.development?
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
        @error = @send_msg
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
      @error = sms_response['error-text']
      @duration = sms_response['duration']
    end
  end

  def verify_pin
    resp = current_user.verify_pin!(params[:pin])
    if resp[:result] == 'error'
      redirect_to verify_path
    else
      session[:phone_verified] = true
      return_to_path = session[:user_return_to] || '/family'
      session[:user_return_to] = nil
      redirect_to return_to_path
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
    persons = current_user.ordered_persons.collect(&:as_json)
    data = {}
    if persons.present?
      persons[0].merge!(email: current_user.email, phone: current_user.phone)
      persons[1].merge!(email: current_user.email2) if persons[1]
      funding, income_stats = current_user.big_decision&.calc!
      data[:storage] = {
        people:   persons,
        children: current_user.get_children,
        finances: current_user.finance_details&.as_json,
        finance_assumptions: current_user.finance_assumption_opts.as_json,
        big_decision: current_user.big_decision&.as_json,
        retirement_funding: funding,
        income_stats: income_stats,
        budget_needs: current_user.budget_need&.as_json,
        budget_categories: current_user.budget_category&.as_json,
        budget_tracking: current_user.budget_tracking_entity&.as_json,
        loans:  current_user.loans&.as_json,
        investments: current_user.investment&.as_json
      }
      data[:result] = 'ok'
    else
      data[:result] = 'empty_account'
    end

    render json: data
  end

  def get_position
    last_pos = current_user.last_position_at
    last_pos = '/hello' if last_pos.present? && last_pos.include?('/verify')
    last_pos = '/welcome_back' if current_user.return_reminder.present?
    render json: {pos: last_pos}
  end

  def get_idea
    allowed_needs = Idea::TITLES.keys.map{|x| x.to_s }
    need = params['need']
    need = allowed_needs.first unless allowed_needs.include?(need)

    ideas = Idea.approved.where(need: [need, 'all']).to_a
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
    idea_params[:content] =  ActionController::Base.helpers.sanitize(idea_params[:content])
    Idea.create!(idea_params)
    render json: {result: 'ok'}
  end

  def like_idea
    idea = Idea.approved.find_by_id(params[:id])
    idea.like!(current_user) if authorized? && idea
    render json: {result: 'ok'}
  end

  def remind_me
    next_time = if authorized?
      current_user.remind_me_return!(params[:next_time].to_i)
      current_user.get_reminder.as_json[:next_time]
    else
      nil
    end
    render json: {next: next_time}
  end

private

  def remove_session
    if user_session = UserSession.find
      user_session.destroy
      session[:phone_verified] = false
    end
  end

  def create_params
    {
      email: params[:email].downcase,
      email2: params[:secondary_email]&.downcase,
      phone: params[:phone],
      children: params[:years] || []
    }
  end

  def send_link_msg(email)
    SEND_LINK_MSG.gsub('$EMAIL', email)
  end

end
