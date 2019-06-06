require 'test_helper'

class EncouragmentsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @encouragment = encouragments(:one)
  end

  test "should get index" do
    get encouragments_url
    assert_response :success
  end

  test "should get new" do
    get new_encouragment_url
    assert_response :success
  end

  test "should create encouragment" do
    assert_difference('Encouragment.count') do
      post encouragments_url, params: { encouragment: { content: @encouragment.content } }
    end

    assert_redirected_to encouragment_url(Encouragment.last)
  end

  test "should show encouragment" do
    get encouragment_url(@encouragment)
    assert_response :success
  end

  test "should get edit" do
    get edit_encouragment_url(@encouragment)
    assert_response :success
  end

  test "should update encouragment" do
    patch encouragment_url(@encouragment), params: { encouragment: { content: @encouragment.content } }
    assert_redirected_to encouragment_url(@encouragment)
  end

  test "should destroy encouragment" do
    assert_difference('Encouragment.count', -1) do
      delete encouragment_url(@encouragment)
    end

    assert_redirected_to encouragments_url
  end
end
