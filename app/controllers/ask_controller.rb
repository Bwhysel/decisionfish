class AskController < ApplicationController
  def desi
    option = params[:ask_theme].to_i
    text = params[:text]
    email = params[:email]

    UserMailer.ask_desi(text, email, option).deliver_later

    respond_to do |f|
      f.html { redirect_to root_url }
      f.js
    end
  end
end
