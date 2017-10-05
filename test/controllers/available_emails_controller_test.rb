require 'test_helper'

class AvailableEmailsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @available_email = available_emails(:one)
  end

  test "should get index" do
    get available_emails_url
    assert_response :success
  end

  test "should get new" do
    get new_available_email_url
    assert_response :success
  end

  test "should create available_email" do
    assert_difference('AvailableEmail.count') do
      post available_emails_url, params: { available_email: { email_pattern: @available_email.email_pattern, used_count: @available_email.used_count } }
    end

    assert_redirected_to available_email_url(AvailableEmail.last)
  end

  test "should show available_email" do
    get available_email_url(@available_email)
    assert_response :success
  end

  test "should get edit" do
    get edit_available_email_url(@available_email)
    assert_response :success
  end

  test "should update available_email" do
    patch available_email_url(@available_email), params: { available_email: { email_pattern: @available_email.email_pattern, used_count: @available_email.used_count } }
    assert_redirected_to available_email_url(@available_email)
  end

  test "should destroy available_email" do
    assert_difference('AvailableEmail.count', -1) do
      delete available_email_url(@available_email)
    end

    assert_redirected_to available_emails_url
  end
end
