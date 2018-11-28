class MxUser < ApplicationRecord
  belongs_to :user
  enum notify_period: { daily: 0, weekly: 1, monthly: 2, over_spending: 3 }

  ACCOUNT_TYPES = {
    cash: %w(CHECKING SAVINGS SAVINGS::MONEY_MARKET SAVINGS::CERTIFICATE_OF_DEPOSIT
    INVESTMENT INVESTMENT::TAXABLE INVESTMENT::NON-TAXABLE INVESTMENT::BROKERAGE INVESTMENT::TRUST
    INVESTMENT::UNIFORM_GIFTS_TO_MINORS_ACT INVESTMENT::PLAN_457 INVESTMENT::EMPLOYEE_STOCK_OWNERSHIP_PLAN
    PROPERTY CASH INSURANCE PREPAID),
    college_savings: %w(INVESTMENT::PLAN_529),
    retirement_savings: %w(INVESTMENT::PLAN_401_K INVESTMENT::PLAN_403_B INVESTMENT::IRA INVESTMENT::ROLLOVER_IRA INVESTMENT::ROTH_IRA INVESTMENT::PENSION INVESTMENT::SIMPLIFIED_EMPLOYEE_PENSION INVESTMENT::SIMPLE_IRA),
    credit_cards: %w(CREDIT_CARD),
    student_loans: %w(LOAN::STUDENT),
    other_debts: %w(LINE_OF_CREDIT LOAN LOAN::AUTO LOAN::SMALL_BUSINESS LOAN::PERSONAL LOAN::PERSONAL_WITH_COLLATERAL LOAN::BOAT LOAN::HOME_EQUITY LOAN::POWERSPORTS LOAN::RV),
    morgage: %w(MORTGAGE)
  }

  def self.for(our_user)
    mx_user = our_user.mx_user
    if mx_user
      begin
        atrium_user = Atrium::User.read(guid: mx_user.guid)
      rescue Atrium::Error => e
        if !e.message.include?("404:")
          Rails.logger.info "MX_ERROR: #{e.message}"
        end
        mx_user.destroy
        mx_user = nil
      end
    end

    return mx_user if mx_user.present?

    atrium_user = generate_atrium_user(
      "#{Rails.env[0..2]}_#{our_user.id}",
      our_user.persons.collect(&:name).join(" & ")
    )

    if atrium_user
      mx_user = our_user.build_mx_user(guid: atrium_user.guid, is_disabled: false)
      mx_user.save!
      mx_user
    end
  end

  def self.generate_atrium_user(identifier, names)
    begin
      atrium_user = Atrium::User.create(
        identifier: identifier,
        is_disabled: false,
        metadata: { name: names }.to_json
      )
    rescue Atrium::Error => e
      if e.message.include?("409:") # An object with the given attributes already exists."
        existed_user = Atrium::User.list.find{|u| u.identifier == identifier }
        if existed_user
          existed_user.delete
          MxUser.find_by_guid(existed_user.guid)&.destroy
          additional_call = true
          result = generate_atrium_user(identifier, names)
        end
      end
      result || !additional_call && Rails.logger.info("MX_ERROR: #{e.message}") && nil
    end
  end

  def get_member(member_guid)
    begin
      Atrium::Member.read(user_guid: guid, member_guid: member_guid)
    rescue Atrium::Error => e
      Rails.logger.info e.message
      nil
    end
  end

  def get_accounts
    pData = Hash.new{|k,v| k[v] = []}
    Atrium::User.read(guid: guid).accounts.each do |acc|
      type = acc.type
      type += "::"+acc.subtype if acc.subtype && acc.subtype != 'NONE'
      pData[type].push(acc)
    end

    acc_types = pData.keys

    data = {}

    ACCOUNT_TYPES.each do |key, types|
      data[key] = []
      next if acc_types.blank?
      intersect = acc_types & types
      acc_types -= intersect
      intersect.each do |type|
        data[key] += pData[type]
      end
    end

    data
  end

  def get_accounts_balances
    data = {}
    get_accounts.each do |key, arr|
      s = 0
      arr.each do |acc|
        s += acc.available_balance || acc.balance
      end
      data[key] = s.round
    end
    data
  end

  def get_loans
    data = {}
    acc_data = get_accounts
    [:credit_cards, :student_loans, :other_debts].each do |kind|
      data[kind] ||= []
      data["#{kind}_names".to_sym] ||= []
      data["#{kind}_rates".to_sym] ||= []
      acc_data[kind].each do |acc|
        data[kind].push((acc.available_balance || acc.balance).round)
        data["#{kind}_names".to_sym].push(acc.name)
        data["#{kind}_rates".to_sym].push(acc.apr || acc.interest_rate || 0)
      end
    end
    #if acc = acc_data[:mortgage]
    #  data[:mortgage] =
    #end
    data
  end

  def month_credit_charges
    MxTransaction.month_credit_charges(self)
  end

end
