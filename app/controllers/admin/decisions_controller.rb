class Admin::DecisionsController < Admin::ApplicationController
  before_action :set_decision, only: [:destroy, :show, :edit, :update]

  def index
    @decisions = Decision.order(created_at: :ASC)
  end

  def new
    @decision = Decision.new
  end

  def show
  end

  def edit
  end

  def create
    @decision = Decision.new(decision_params)
    if @decision.save
        redirect_to admin_decisions_path
    else
      render :edit
    end
  end

  def update
    if @decision.update(decision_params)
      redirect_to admin_decisions_path
    else
      render :edit
    end
  end

  def destroy
    @decision.destroy
    redirect_to admin_decisions_path
  end

  def set_decision
    @decision = Decision.find(params[:id])
  end

  def decision_params
    params.require(:decision).permit(:title, :description,
                                     variables_attributes: [:id, :title,
                                     :description, :name, :_destroy])
  end
end
