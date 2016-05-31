class Admin::VariablesController < Admin::ApplicationController
  before_action :set_variable, only: [:destroy, :show, :edit, :update]
  before_action :set_decision, only: [:index, :new, :create, :edit, :update,
                                      :show]

  def index
    @variables = @decision.variables.order(created_at: :ASC)
  end

  def new
    @variable = Variable.new
  end

  def show
  end

  def edit
    session[:variable_name] = @variable.name
  end

  def create
    @variable = @decision.variables.new(variable_params)
    if @variable.save
        redirect_to admin_decision_variables_path
    else
      render :edit
    end
  end

  def update
    if @variable.update(variable_params)
      redirect_to admin_decision_variables_path
    else
      render :edit
    end
  end

  def destroy
    @variable.destroy
    redirect_to admin_decision_variables_path
  end

  private

  def set_decision
    @decision = Decision.find(params[:decision_id])
  end

  def set_variable
    @variable = Variable.find(params[:id])
  end

  def variable_params
    params.require(:variable).permit(:title, :description, :name, :value, :pro,
                                     :order, :default, :type, :decision_id)
  end
end
