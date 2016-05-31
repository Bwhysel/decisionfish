module LoginHelper
  def login_admin
    @admin = FactoryGirl.create(:user)
    visit "/admin/sign_in"

    fill_in 'Email', :with => @admin.email
    fill_in 'Password', :with => @admin.password

    click_button 'Log in'
  end

  def login_out
    click_on 'Logout'
  end
end

RSpec.configure do |config|
  config.include LoginHelper, type: :feature
end
