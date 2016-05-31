require "rails_helper"

feature "user " do

  background do
    @user = FactoryGirl.create(:user)
    login_as(@user, :scope => :user)
    @decision = FactoryGirl.create(:decision)
  end

  context "creating formula" do

    before(:each) do
      visit "/admin/decisions/#{@decision.id}/formulas"
      click_link "Add formula"
    end

    scenario "successful" do

      fill_in "Formula title", with: "My formula"
      fill_in "Equation", with: "x + 3"

      click_button "Save"

      expect(page).to have_content("Add formula")
      expect(page).to have_content("My formula")
      expect(page).to have_content("x + 3")
    end

    scenario "with empty title" do
      fill_in "Equation", with: "x + 3"

      click_button "Save"

      expect(page).to have_content("Please review the problems below:")
    end

    scenario "with empty equation" do

      fill_in "Formula title", with: "My formula"

      click_button "Save"

      expect(page).to have_content("Please review the problems below:")
    end
  end

  scenario "editing formula" do
    @formula = FactoryGirl.create(:formula, decision_id: @decision.id)
    visit "/admin/decisions/#{@decision.id}/formulas"
    click_link "edit"

    fill_in "Formula title", with: "updated formula"
    fill_in "Equation", with: "updated equation"

    click_button "Save"

    expect(page).to have_content("Add formula")
    expect(page).to have_content("updated formula")
    expect(page).to have_content("updated equation")
  end
end

feature "deliting formula", js: true do

  background do
    login_admin

    @decision = FactoryGirl.create(:decision)
    @formula = FactoryGirl.create(:formula, decision_id: @decision.id)
    visit "/admin/decisions/#{@decision.id}/formulas"
  end

  it "with js (and accept)" do
    page.evaluate_script('window.confirm = function() { return true; }')
    click_link('delete')

    expect(page).to_not have_content(@formula.title)
    expect(page).to_not have_content(@formula.equation)
  end

  it "with js (and reject)" do
    page.evaluate_script('window.confirm = function() { return false; }')
    click_link('delete')

    expect(page).to have_content(@formula.title)
    expect(page).to have_content(@formula.equation)
  end
end
