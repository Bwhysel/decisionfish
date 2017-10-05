class User < ApplicationRecord
  has_one :finance_assumption
  has_one :finance_details, class_name: 'FinanceDetail'
  has_many :persons
  has_one :big_decision
  has_one :budget_need
  has_one :budget_category
  has_one :budget_tracking_entity
  has_one :loans, class_name: 'Loan'
  has_one :mx_user
  has_many :liked_ideas, class_name: 'IdeaLike'

  PIN_LIVE_TIME = 20.minutes

  PIN_SEND_TIMEOUT = 2.minutes
  MAX_SEND_COUNT = 3

  FAILED_TIMEOUT = 1.hour
  MAX_FAILED_COUNT = 3

  validate :email_in_whitelist

  acts_as_authentic

  def name
    persons.first&.name
  end

  def deliver_email_verify_instructions!
    UserMailer.verify_email(self).deliver_later
  end

  def send_phone_verification_code!
    blocked_by_timeout = false
    if pin_code_last_sent_at
      resend_after_timeout = (pin_code_last_sent_at - PIN_SEND_TIMEOUT.ago).round
      blocked_by_timeout = resend_after_timeout > 0

      if !blocked_by_timeout && pin_code_sms_attempts >= MAX_SEND_COUNT
        resend_after_block = (pin_code_last_sent_at - FAILED_TIMEOUT.ago).round
        blocked_by_attempts = resend_after_block > 0
        update_send_stats(pin_code_last_sent_at, 0) if !blocked_by_attempts
      end
    end

    msg = if blocked_by_timeout
      {
        'status' => '0',
        'duration' => resend_after_timeout
      }
    elsif blocked_by_attempts
      {
        'status' => '0',
        'error-text' => 'Max resend count exceeds.',
        'duration' => resend_after_block
      }
    else
      reset_pin_code! unless pin_code_alive?
      response = send_message!
      result = response['messages'][0]

      result
    end
    Rails.logger.info "[NEXMO] #{msg}"
    msg
  end

  def pin_code_alive?
    pin_code_generated_at.present? && pin_code_generated_at > PIN_LIVE_TIME.ago
  end

  def numbered_phone
    p = phone.gsub(/\s|\+|\(|\)|\-/, '')
    p = '1' + p if phone[0] != '+'
    '+' + p
  end

  def verify_pin!(pin)
    duration = next_pin_submit_after
    blocked_by_attempts = duration && duration > 0

    if blocked_by_attempts
      { result: 'error', msg: 'Max attempts exceeds.', duration: duration}
    elsif (pin == pin_code) && pin_code_alive?
      update_column(:phone_verified, true)
      reset_pin_code!
      update_pin_check_stats(pin_code_last_fail_attempt_at, 0)
      { result: 'ok', msg: 'Your phone is verified' }
    else
      update_pin_check_stats(Time.now, pin_code_fail_attempts + 1)
      { result: 'error', msg: 'PIN is not valid' }
    end
  end

  def next_pin_submit_after
    if pin_code_fail_attempts >= MAX_FAILED_COUNT
      duration = (pin_code_last_fail_attempt_at - FAILED_TIMEOUT.ago).round
    end
    duration
  end

  def masked_phone
    cleared_phone = phone.gsub('-','')
    clength = cleared_phone.length

    mask_length = (clength * 0.7).floor
    diff = clength - mask_length
    length1 = (diff / 2.5).floor
    length2 = diff - length1
    cleared_phone[0,length1] + ('*' * mask_length) + cleared_phone[clength-length2 - 1, length2 + 1]
  end

  def finance_assumption_opts
    if finance_assumption.present?
      h = finance_assumption.as_json
      h.delete('id')
      h.delete('userid')
      h.delete('created_at')
      h.delete('updated_at')
      h2 = {}
      h.map do |k,v|
        h.delete(k)
        h2[k.to_sym] = v
      end
      h2
    else
      FinanceAssumption::DEFAULTS.clone
    end
  end

  def cleanup_data
    finance_assumption&.destroy
    finance_details&.destroy
    persons.destroy_all
    big_decision&.destroy
    budget_need&.destroy
    budget_category&.destroy
    budget_tracking_entity&.destroy
    loans&.destroy
    if mx_user
      mx_user.transactions.destroy_all
      mx_user.destroy
    end
    update_column(:children, [])
  end

  def email_in_whitelist
    unless AvailableEmail.valid?(email)
      errors.add(:base, "I'd love to have you jump right it in. But first, you need to get access. Please email desi@decisionfish.com for more information.")
    end
  end

private

  def reset_pin_code!
    self.pin_code = '%04d' % rand(10**4)
    self.pin_code_fail_attempts = 0
    self.pin_code_last_fail_attempt_at = nil
    self.pin_code_generated_at = Time.now
    self.pin_code_last_sent_at = nil
    self.pin_code_sms_attempts = 0
    self.save!
  end

  def send_message!
    text = "Your verification code: #{pin_code}"

    nexmo_opts = Rails.application.secrets.nexmo

    uri = URI('https://rest.nexmo.com/sms/json')
    message = Net::HTTP::Post.new(uri.request_uri)
    message.form_data = {
      api_key:    nexmo_opts[:api_key],
      api_secret: nexmo_opts[:api_secret],
      from:       nexmo_opts[:phone],
      to:         numbered_phone,
      text:       text
    }

    http = Net::HTTP.new(uri.host, Net::HTTP.https_default_port)
    http.use_ssl = true

    message['User-Agent'] = 'DF ruby/#{RUBY_VERSION}"'

    begin
      http_response = http.request(message)

      result = case http_response
      when Net::HTTPNoContent
        :no_content
      when Net::HTTPOK
        if http_response['Content-Type'].split(';').first == 'application/json'
          json = JSON.parse(http_response.body)
          Rails.logger.info "[NEXMO] response: #{json}"
          json
        else
          http_response.body
        end
      when Net::HTTPUnauthorized
        raise AuthenticationError, "#{http_response.code} response from #{uri.host}"
      when Net::HTTPClientError
        raise ClientError, "#{http_response.code} response from #{uri.host}"
      when Net::HTTPServerError
        raise ServerError, "#{http_response.code} response from #{uri.host}"
      else
        raise Error, "#{http_response.code} response from #{uri.host}"
      end
    rescue SocketError
      result = {'messages' => [ {
          'status' => 0,
          'error-text' => 'Network disconnected',
        }
      ]}
    end

    if result['messages'][0]['status'] == '0'
      # successful sent message
      update_send_stats(Time.now, pin_code_sms_attempts + 1)
      result['messages'][0]['duration'] == 2.minutes.to_i
    end

    result
  end

  def update_send_stats(time, attempts)
    update_columns(
      pin_code_last_sent_at: time,
      pin_code_sms_attempts: attempts
    )
  end

  def update_pin_check_stats(time, attempts)
    update_columns(
      pin_code_last_fail_attempt_at: time,
      pin_code_fail_attempts: attempts
    )
  end
end
