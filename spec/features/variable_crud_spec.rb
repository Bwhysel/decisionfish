require "rails_helper"

feature "user " do

  background do
    @user = FactoryGirl.create(:user)
    login_as(@user, :scope => :user)
    @decision = FactoryGirl.create(:decision)
  end

  context "creating variable" do

    before(:each) do
      visit "/admin/decisions/#{@decision.id}/variables"
      click_link "Add variable"
    end

    scenario "successful" do

      fill_in "Name", with: "some_name"
      fill_in "Description", with: "some description"
      select 'FloatVariable', :from => 'variable_type'
      fill_in "Order", with: 2
      check 'Pro'
      fill_in "Default", with: 20.0

      click_button "Save"

      expect(page).to have_content("some description")
    end

    scenario "with empty title" do
      fill_in "Name", with: "some_name"
      fill_in "Description", with: "some_description"
      select 'FloatVariable', :from => 'variable_type'
      fill_in "Order", with: 2
      check 'Pro'
      fill_in "Default", with: 20.0

      click_button "Save"

      expect(page).to have_content("Please review the problems below:")
    end

    scenario "with empty name" do
      fill_in "Title", with: "some title"
      fill_in "Name", with: ""
      fill_in "Description", with: "some description"
      select 'FloatVariable', :from => 'variable_type'
      fill_in "Order", with: 2
      check 'Pro'
      fill_in "Default", with: 20.0

      click_button "Save"

      expect(page).to have_content("Please review the problems below:")
    end

    scenario "with empty description" do
      fill_in "Title", with: "some title"
      fill_in "Name", with: "some_name"
      fill_in "Description", with: ""
      select 'FloatVariable', :from => 'variable_type'
      fill_in "Order", with: 2
      check 'Pro'
      fill_in "Default", with: 20.0

      click_button "Save"

      expect(page).to have_content("Please review the problems below:")
    end
  end

  scenario "editing variable" do
    @variable = FactoryGirl.create(:variable, decision_id: @decision.id)

    visit "/admin/decisions/#{@decision.id}/variables"
    click_link "edit"

    fill_in "Title", with: "updated title"
    fill_in "Name", with: "updated_name"
    fill_in "Description", with: "updated description"
    fill_in "Order", with: 2
    check 'Pro'
    fill_in "Default", with: 20.0

    click_button "Save"

    expect(page).to have_content("updated description")
  end

  scenario "editing variable don`t have type field" do
    @variable = FactoryGirl.create(:variable, decision_id: @decision.id)

    visit "/admin/decisions/#{@decision.id}/variables"
    click_link "edit"

    expect(page.has_no_field?("variable_type")).to eq(true)
  end
end

feature "deliting variable", js: true do

  background do
    login_admin

    @decision = FactoryGirl.create(:decision)
    @variable = FactoryGirl.create(:variable, decision_id: @decision.id)
    visit "/admin/decisions/#{@decision.id}/variables"
  end

  it "with js (and accept)" do
    page.evaluate_script('window.confirm = function() { return true; }')
    click_link('delete')

    expect(page).to_not have_content(@variable.description)
  end

  it "with js (and reject)" do
    page.evaluate_script('window.confirm = function() { return false; }')
    click_link('delete')

    expect(page).to have_content(@variable.description)
  end
end
