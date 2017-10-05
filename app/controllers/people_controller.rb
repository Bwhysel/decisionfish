class PeopleController < ApplicationController
  before_action :user_authorized

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

private

  def permitted(white_list)
    p = {}
    white_list.each {|f| p[f] = params[f] if !params[f].nil? }
    p
  end

  def person_attrs
    permitted(%w(name age sex age income))
  end

  def finance_details_attrs
    permitted(%w(cash college_savings retirement_savings credit_cards
      student_loans other_debts home_value mortgage))
  end

  def budget_need_attrs
    permitted(%w(basics_met love_met respect_met control_met expert_met helping_met fun_met
       basics_value love_value respect_value control_value expert_value helping_value
       fun_value none_value))
  end

  def budget_category_attrs
    permitted(%w(housing transportation health_care insurance groceries dining_out
      personal_care clothing entertaining fitness education charity vacation
      fun everything credit_card savings fun_mx_category))
  end

  def loans_attrs
    permitted(%w(credit_cards student_loans other_debts credit_cards_names
      sudent_loans_names other_debts_names credit_cards_rates sudent_loans_rates other_debts_rates))
  end

  def tracking_attrs
    permitted(%w(other_email notify_period))
  end
end
