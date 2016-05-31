class Admin::FormulasController < Admin::ApplicationController
  before_action :set_formula, only: [:destroy, :show, :edit, :update]
  before_action :set_decision, only: [:index, :new, :create, :edit, :update,
                                      :show]

  def index
    @formulas = @decision.formulas.order(created_at: :ASC)
  end

  def new
    @formula = Formula.new
  end

  def show
  end

  def edit
    session[:formula_title] = @formula.title
  end

  def create
    @formula = @decision.formulas.new(formula_params)
    if params[:preview]
      @result = preview(params[:sample], @formula.equation)
      render(:edit) && return
    end
    if @formula.save
      redirect_to admin_decision_formulas_path
    else
      render :edit
    end
  end

  def update
    if params[:preview]
      @result = preview(params[:sample], params[:formula][:equation])
      render(:edit) && return
    end
    if @formula.update(formula_params)
      redirect_to admin_decision_formulas_path
    else
      render :edit
    end
  end

  def destroy
    @formula.destroy
    redirect_to admin_decision_formulas_path
  end

  private

  def set_decision
    @decision = Decision.find(params[:decision_id])
  end

  def set_formula
    @formula = Formula.find(params[:id])
  end

  def formula_params
    params.require(:formula).permit(:title, :equation, :decision_id)
  end

  def preview(samples, equation)
    calculator = Dentaku::Calculator.new
    calculator.bind(samples)
    calculator.evaluate(equation)
  end
end
