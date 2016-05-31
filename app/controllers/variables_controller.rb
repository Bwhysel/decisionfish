class VariablesController < ApplicationController
  before_action :set_decision

  def index
    @pro_variables = @decision.variables.where(order: 7..20)
  end

  def show
    if params[:back_to_default]
      if session[:'warden.user.user.key']
        devise = session[:'warden.user.user.key']
        session.clear
        session[:'warden.user.user.key'] = devise
        session[:user_way] = 'free'
      else
        session.clear
        session[:user_way] = 'free'
      end
    end

    @variable = Variable.find(params[:id])
    if session[@variable.name.to_sym]
      @variable_value = session[@variable.name.to_sym].to_i
    else
      @variable_value = Variable.find(params[:id]).default.to_i
    end

    @previous_variable = Variable.find_by order: @variable.order - 1
    @next_variable = Variable.find_by order: @variable.order + 1

    if @variable.order != 1 && params[:variable_value] && params[:variable_value][:value].to_i < 0
      flash[:notice] = "Please, enter valid value."
      redirect_to decision_variable_path(decision_id: @decision.id,
                                         id: @previous_variable.id, direction: "back")
    elsif @variable.order != 1 && params[:variable_value] && params[:variable_value][:value] == ""
      flash[:notice] = "Please, enter valid value."
      redirect_to decision_variable_path(decision_id: @decision.id,
                                         id: @previous_variable.id, direction: "back")
    elsif @variable.order != 1 && params[:variable_value] && params[:variable_value][:value].to_i > 10000000
      flash[:notice] = "Max. is $10,000,000"
      redirect_to decision_variable_path(decision_id: @decision.id,
                                         id: @previous_variable.id, direction: "back")
    end

    if @previous_variable && params[:direction] !=  "back"
      session[@previous_variable.name.to_sym] = params[:variable_value][:value]
    end
  end

  def free_result_table
    @variables = @decision.variables.order(order: :asc)

    if params[:direction] == "back"
      @variable = Variable.find(5)
    else
      @variable = Variable.find(params[:variable_value][:variable_id])

      if @variable.order != 1 && params[:variable_value] && params[:variable_value][:value] == "" || params[:variable_value][:value].to_i < 0
        flash[:notice] = "Please, enter valid value."
        redirect_to decision_variable_path(decision_id: @decision.id,
                                           id: @variable.id, direction: "back")
      elsif @variable.order != 1 && params[:variable_value] && params[:variable_value][:value].to_i > 10000000
        flash[:notice] = "Max. is $10,000,000"
        redirect_to decision_variable_path(decision_id: @decision.id,
                                           id: @variable.id, direction: "back")
      elsif @variable.order != 1 && params[:variable_value] && params[:variable_value][:value].to_i < @variables.find_by(name: 'closing_cost').default.to_i
        flash[:notice] = "Not enough cash. Please try again."
        redirect_to decision_variable_path(decision_id: @decision.id,
                                           id: @variable.id, direction: "back")
      end
    end



    @previous_variable = Variable.find_by order: @variable.order - 1

    if params[:direction] != "back"
      session[@variable.name.to_sym] = params[:variable_value][:value]
    end

    @variables.where(pro: true).each do |var|
      session.delete(var.name.to_sym)
    end

    session[:mort_rate] = @variables.find_by(name: "mort_rate").default
    session[:term] = @variables.find_by(name: "term").default
  end

  private

  def set_decision
    @decision = Decision.find(params[:decision_id])
  end
end
