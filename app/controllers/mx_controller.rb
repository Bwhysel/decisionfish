#require 'atrium'
class MxController < ApplicationController
  before_action :user_authorized
  before_action :set_mx_user
  before_action :set_mx_member, only: [:remove_connection, :get_connection]

  def widget
    data = {}
    if @mx_user
      conn = Atrium::Connect.create(user_guid: @mx_user.guid)
      data[:widget_url] = conn.connect_widget_url
    else
      data[:err] = "Can not connect to MX right now."
    end
    render json: data
  end

  def connections
    members = Atrium::Member.list(user_guid: @mx_user.guid)
    data = {}
    members.each do |member|
      data[member.guid] = {bank: member.name, status: member.status}
    end
    render json: data
  end

  def remove_connection
    @mx_member&.delete
    render json: {result: 'ok'}
  end

  def get_connection
    data = @mx_member ? {bank: @mx_member.name, status: @mx_member.status} : {}
    render json: data
  end

  def get_balances
    data = @mx_user&.get_accounts_balances || {}
    render json: data
  end

  def get_loans
    data = @mx_user&.get_loans || {}
    render json: data
  end

  def get_accounts_length
    data = {}
    if @mx_user
      data[:accounts] = Atrium::Account.list(user_guid: @mx_user.guid).total_entries
    end
    render json: data
  end

private

  def set_mx_user
    @mx_user = MxUser.for(current_user)
  end

  def set_mx_member
    @mx_member = @mx_user&.get_member(params[:id])
  end

end
