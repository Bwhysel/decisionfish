require 'test_helper'

class DesiSaysModalsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @desi_says_modal = desi_says_modals(:one)
  end

  test "should get index" do
    get desi_says_modals_url
    assert_response :success
  end

  test "should get new" do
    get new_desi_says_modal_url
    assert_response :success
  end

  test "should create desi_says_modal" do
    assert_difference('DesiSaysModal.count') do
      post desi_says_modals_url, params: { desi_says_modal: { content: @desi_says_modal.content, module: @desi_says_modal.module, slug: @desi_says_modal.slug } }
    end

    assert_redirected_to desi_says_modal_url(DesiSaysModal.last)
  end

  test "should show desi_says_modal" do
    get desi_says_modal_url(@desi_says_modal)
    assert_response :success
  end

  test "should get edit" do
    get edit_desi_says_modal_url(@desi_says_modal)
    assert_response :success
  end

  test "should update desi_says_modal" do
    patch desi_says_modal_url(@desi_says_modal), params: { desi_says_modal: { content: @desi_says_modal.content, module: @desi_says_modal.module, slug: @desi_says_modal.slug } }
    assert_redirected_to desi_says_modal_url(@desi_says_modal)
  end

  test "should destroy desi_says_modal" do
    assert_difference('DesiSaysModal.count', -1) do
      delete desi_says_modal_url(@desi_says_modal)
    end

    assert_redirected_to desi_says_modals_url
  end
end
