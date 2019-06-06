class PeopleController < ApplicationController
  before_action :user_authorized, except: [:cancel_tracking]

  def create
    person = Person.mine(current_user).new(person_attrs)
    unless person.save
      err = person.errors.full_messages.join('. ')
    end

    render json: { result: (err.blank? ? 'ok' : 'error'), id: person.id, msg: err }
  end

  def update
    person = Person.mine(current_user).find_by_id(params[:id])

    if !person
      err = 'person not found'
    elsif !person.update_attributes(person_attrs)
      err = person.errors.full_messages.join('. ')
    end

    render json: { result: (err.blank? ? 'ok' : 'error'), msg: err }
  end

  def destroy
    person = Person.mine(current_user).find_by_id(params[:id])
    if person
      person.destroy!
    else
      err = 'person not found'
    end

    render json: { result: (err.blank? ? 'ok' : 'error'), msg: err }
  end

  def update_children
    years = params[:years] || []
    current_user.update_attribute(:children, years.map{|x| x.blank? ? nil : x.to_i }.compact)

    render json: {result: 'ok'}
  end

  def update_details
    details = current_user.finance_details || current_user.build_finance_details
    details.update_attributes(finance_details_attrs)

    render json: {result: 'ok'}
  end

  def update_investments
    investment = current_user.investment || current_user.build_investment
    investment.update_attributes(investment_attrs)
    render json: {result: 'ok'}
  end

  def update_budget_needs
    need = current_user.budget_need || current_user.build_budget_need
    need.update_attributes(budget_need_attrs)
    render json: {result: 'ok'}
  end

  def update_budget_categories
    categories = current_user.budget_category || current_user.build_budget_category
    categories.update_attributes(budget_category_attrs)
    render json: {result: 'ok'}
  end

  def update_loans
    loans = current_user.loans || current_user.build_loans
    loans.update_attributes(loans_attrs)
    render json: {result: 'ok'}
  end

  def update_tracking_info
    tracking = current_user.budget_tracking_entity || current_user.build_budget_tracking_entity
    ps = tracking_attrs
    if x = ps["notify_period"]
      ps["notify_period"] = x.to_i
    end
    if (x = ps["other_email"]) && x.blank?
      ps["other_email"] = nil
    end
    tracking.update_attributes(ps)
    render json: {result: 'ok'}
  end

  def cancel_tracking
    entity = BudgetTrackingEntity.find_by_unsubscribe_hash(params[:unsubscribe_hash])
    if entity
      entity.update_attribute(:notify_period, "unset")
    end
    render 'user/cancel_tracking', layout: "mailer"
  end

private

  def person_attrs
    params.permit(:name, :age, :sex, :age, :income)
  end

  def finance_details_attrs
    params.permit(:cash, :college_savings, :retirement_savings,
      :credit_cards, :student_loans, :other_debts, :home_value, :mortgage)
  end

  def budget_need_attrs
    params.permit(:basics_met, :love_met, :respect_met, :control_met,
      :expert_met, :helping_met, :fun_met, :basics_value, :love_value,
      :respect_value, :control_value, :expert_value, :helping_value, :fun_value, :none_value)
  end

  def investment_attrs
    white_regexp = /\A(student_loans|other_debts|credit_cards)#\d*\z/
    valid_keys = []
    [:your_amounts, :new_charges].each do |field|
      if (x = params[field]) && x.present?
        valid_keys = x.keys.select{|k| k.match(white_regexp)}
      end
    end
    valid_keys += [:ira_roth, :plan_529, :match401k, :bank_savings, :unmatched401k,
      :ira_traditional, :taxable_investments]
    params.permit(:p401_percent_income_1, :p401_percent_income_2, :p401_percent_match_1,
      :p401_percent_match_2, :efund_months, :efund_current, your_amounts: valid_keys, new_charges: valid_keys)
  end

  def budget_category_attrs
    arr = %w(housing transportation health_care insurance groceries dining_out
      personal_care clothing entertaining fitness education charity vacation
      fun everything credit_card savings fun_mx_category fun_need fun_caption )
    white_keys = []
    arr.each do |k|
      white_keys.push(k)
      white_keys.push("#{k}_spend")
      white_keys.push("#{k}_diff")
    end
    params.permit(white_keys)
  end

  def loans_attrs
    ps = params.permit(credit_cards: [], student_loans: [], other_debts: [],
      credit_cards_names: [], student_loans_names: [], other_debts_names: [],
      credit_cards_rates: [], student_loans_rates: [], other_debts_rates: [])
    ps.keys.each do |x|
      v = ps[x]
      ps[x] = [] if v == [""]
    end
    ps
  end

  def tracking_attrs
    params.permit(:other_email, :notify_period)
  end
end
