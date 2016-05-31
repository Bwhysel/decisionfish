require "rails_helper"

feature "user " do

  background do
    @user = FactoryGirl.create(:user)
    login_as(@user, :scope => :user)
  end

  context "creating decision", pending: "feature is not supported" do

    before(:each) do
      visit "/admin/decisions"
      click_link "Add decision"
    end

    scenario "successful" do

      fill_in "Title", with: "My decision"
      fill_in "Description", with: "one of my decisions"

      click_button "Save"

      expect(page).to have_content("Add decision")
      expect(page).to have_content("My decision")
      expect(page).to have_content("one of my decisions")
    end

    scenario "with empty title" do
      fill_in "Description", with: "one of my decisions"

      click_button "Save"

      expect(page).to have_content("Please review the problems below:")
    end

    scenario "with empty description" do

      fill_in "Title", with: "My decision"

      click_button "Save"

      expect(page).to have_content("Please review the problems below:")
    end
  end

  scenario "editing decision" do
    @decision = FactoryGirl.create(:decision)

    visit "/admin/decisions"
    click_link "edit"

    fill_in "Title", with: "New title"
    fill_in "Description", with: "New description"

    click_button "Save"

    expect(page).to have_content("New title")
    expect(page).to have_content("New description")
  end
end

feature "deliting decision", js: true, pending: "feature is not supported" do

  background do
    login_admin

    @decision = FactoryGirl.create(:decision)
    visit "/admin/decisions"
  end

  it "with js (and accept)" do
    page.evaluate_script('window.confirm = function() { return true; }')
    click_link('delete')

    expect(page).to_not have_content(@decision.title)
    expect(page).to_not have_content(@decision.description)
  end

  it "with js (and reject)" do
    page.evaluate_script('window.confirm = function() { return false; }')
    click_link('delete')

    expect(page).to have_content(@decision.title)
    expect(page).to have_content(@decision.description)
  end
end
