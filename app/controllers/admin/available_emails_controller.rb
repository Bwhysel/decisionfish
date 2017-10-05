class Admin::AvailableEmailsController < Admin::BaseController
  before_action :set_available_email, only: [:show, :edit, :update, :destroy]

  # GET /available_emails
  # GET /available_emails.json
  def index
    @available_emails = AvailableEmail.all
  end

  # GET /available_emails/1
  # GET /available_emails/1.json
  def show
  end

  # GET /available_emails/new
  def new
    @available_email = AvailableEmail.new
  end

  # GET /available_emails/1/edit
  def edit
  end

  # POST /available_emails
  # POST /available_emails.json
  def create
    @available_email = AvailableEmail.new(available_email_params)

    respond_to do |format|
      if @available_email.save
        format.html { redirect_to admin_available_emails_path, notice: 'Available email was successfully created.' }
        format.json { render :show, status: :created, location: @available_email }
      else
        format.html { render :new }
        format.json { render json: @available_email.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /available_emails/1
  # PATCH/PUT /available_emails/1.json
  def update
    respond_to do |format|
      if @available_email.update(available_email_params)
        format.html { redirect_to admin_available_emails_path, notice: 'Available email was successfully updated.' }
        format.json { render :show, status: :ok, location: @available_email }
      else
        format.html { render :edit }
        format.json { render json: @available_email.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /available_emails/1
  # DELETE /available_emails/1.json
  def destroy
    @available_email.destroy
    respond_to do |format|
      format.html { redirect_to admin_available_emails_url, notice: 'Available email was successfully destroyed.' }
      format.json { head :no_content }
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_available_email
      @available_email = AvailableEmail.find(params[:id])
    end

    # Never trust parameters from the scary internet, only allow the white list through.
    def available_email_params
      params.require(:available_email).permit(:email_pattern, :used_count)
    end
end
