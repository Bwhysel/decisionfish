class Admin::DesiSaysModalsController < Admin::BaseController
  before_action :set_desi_says_modal, only: [:show, :edit, :update]

  def index
    @desi_says_modals = DesiSaysModal.all
  end

  def show
  end

  def new
    @desi_says_modal = DesiSaysModal.new
  end

  def edit
  end

  def create
    @desi_says_modal = DesiSaysModal.new(desi_says_modal_params)

    respond_to do |format|
      if @desi_says_modal.save
        format.html { redirect_to [:admin, @desi_says_modal], notice: 'Bubble was successfully created.' }
        format.json { render :show, status: :created, location: @desi_says_modal }
      else
        format.html { render :new }
        format.json { render json: @desi_says_modal.errors, status: :unprocessable_entity }
      end
    end
  end

  def update
    respond_to do |format|
      if @desi_says_modal.update(desi_says_modal_params)
        format.html { redirect_to [:admin, @desi_says_modal], notice: 'Bubble was successfully updated.' }
        format.json { render :show, status: :ok, location: @desi_says_modal }
      else
        format.html { render :edit }
        format.json { render json: @desi_says_modal.errors, status: :unprocessable_entity }
      end
    end
  end

  private
    def set_desi_says_modal
      @desi_says_modal = DesiSaysModal.find(params[:id])
    end

    def desi_says_modal_params
      params.require(:desi_says_modal).permit(:module, :slug, :content)
    end
end
