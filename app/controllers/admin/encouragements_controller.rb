class Admin::EncouragementsController < Admin::BaseController
  before_action :set_encouragement, only: [:show, :edit, :update, :destroy]

  # GET /encouragements
  # GET /encouragements.json
  def index
    @encouragements = Encouragement.all
  end

  # GET /encouragements/1
  # GET /encouragements/1.json
  def show
  end

  # GET /encouragements/new
  def new
    @encouragement = Encouragement.new
  end

  # GET /encouragements/1/edit
  def edit
  end

  # POST /encouragements
  # POST /encouragements.json
  def create
    @encouragement = Encouragement.new(encouragement_params)

    respond_to do |format|
      if @encouragement.save
        format.html { redirect_to admin_encouragements_path, notice: 'Encouragement was successfully created.' }
        format.json { render :show, status: :created, location: @encouragement }
      else
        format.html { render :new }
        format.json { render json: @encouragement.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /encouragements/1
  # PATCH/PUT /encouragements/1.json
  def update
    respond_to do |format|
      if @encouragement.update(encouragement_params)
        format.html { redirect_to admin_encouragements_path, notice: 'Encouragement was successfully updated.' }
        format.json { render :show, status: :ok, location: @encouragement }
      else
        format.html { render :edit }
        format.json { render json: @encouragement.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /encouragements/1
  # DELETE /encouragements/1.json
  def destroy
    @encouragement.destroy
    respond_to do |format|
      format.html { redirect_to admin_encouragements_url, notice: 'Encouragement was successfully destroyed.' }
      format.json { head :no_content }
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_encouragement
      @encouragement = Encouragement.find_by_id(params[:id])
      unless @encouragement
        redirect_to admin_encouragements_path, notice: "Encouragement ##{params[:id]} is not existed."
      end
    end

    # Never trust parameters from the scary internet, only allow the white list through.
    def encouragement_params
      ps = params.require(:encouragement).permit(:content)
      ps[:content] =  ActionController::Base.helpers.sanitize(ps[:content])
      ps
    end
end
