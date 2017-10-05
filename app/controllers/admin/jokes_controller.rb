class Admin::JokesController < Admin::BaseController
  before_action :set_joke, only: [:show, :edit, :update, :destroy]
  layout 'staff'

  def index
    @jokes = Joke.all
  end

  def show
  end

  def new
    @joke = Joke.new
  end

  def edit
  end

  def create
    @joke = Joke.new(joke_params)

    respond_to do |format|
      if @joke.save
        format.html { redirect_to [:admin, @joke], notice: 'Joke was successfully created.' }
        format.json { render :show, status: :created, location: @joke }
      else
        format.html { render :new }
        format.json { render json: @joke.errors, status: :unprocessable_entity }
      end
    end
  end

  def update
    respond_to do |format|
      if @joke.update(joke_params)
        format.html { redirect_to [:admin, @joke], notice: 'Joke was successfully updated.' }
        format.json { render :show, status: :ok, location: @joke }
      else
        format.html { render :edit }
        format.json { render json: @joke.errors, status: :unprocessable_entity }
      end
    end
  end

  def destroy
    @joke.destroy
    respond_to do |format|
      format.html { redirect_to admin_jokes_url, notice: 'Joke was successfully destroyed.' }
      format.json { head :no_content }
    end
  end

  private
    def set_joke
      @joke = Joke.find_by_id(params[:id])
      unless @joke
        redirect_to admin_jokes_path, notice: "Joke ##{params[:id]} is not existed."
      end
    end

    def joke_params
      params.require(:joke).permit(:content)
    end
end
