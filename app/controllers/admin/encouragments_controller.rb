class Admin::EncouragmentsController < Admin::BaseController
  before_action :set_encouragment, only: [:show, :edit, :update, :destroy]

  # GET /encouragments
  # GET /encouragments.json
  def index
    @encouragments = Encouragment.all
  end

  # GET /encouragments/1
  # GET /encouragments/1.json
  def show
  end

  # GET /encouragments/new
  def new
    @encouragment = Encouragment.new
  end

  # GET /encouragments/1/edit
  def edit
  end

  # POST /encouragments
  # POST /encouragments.json
  def create
    @encouragment = Encouragment.new(encouragment_params)

    respond_to do |format|
      if @encouragment.save
        format.html { redirect_to [:admin, @encouragment], notice: 'Encouragment was successfully created.' }
        format.json { render :show, status: :created, location: @encouragment }
      else
        format.html { render :new }
        format.json { render json: @encouragment.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /encouragments/1
  # PATCH/PUT /encouragments/1.json
  def update
    respond_to do |format|
      if @encouragment.update(encouragment_params)
        format.html { redirect_to [:admin, @encouragment], notice: 'Encouragment was successfully updated.' }
        format.json { render :show, status: :ok, location: @encouragment }
      else
        format.html { render :edit }
        format.json { render json: @encouragment.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /encouragments/1
  # DELETE /encouragments/1.json
  def destroy
    @encouragment.destroy
    respond_to do |format|
      format.html { redirect_to admin_encouragments_url, notice: 'Encouragment was successfully destroyed.' }
      format.json { head :no_content }
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_encouragment
      @encouragment = Encouragment.find_by_id(params[:id])
      unless @encouragment
        redirect_to admin_encouragments_path, notice: "Encouragment ##{params[:id]} is not existed."
      end
    end

    # Never trust parameters from the scary internet, only allow the white list through.
    def encouragment_params
      params.require(:encouragment).permit(:content)
    end
end
