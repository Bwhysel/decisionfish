require 'atrium_caller'
class MxController < ApplicationController
  before_action :user_authorized
  before_action :set_mx_user
  before_action :set_mx_member, only: [:remove_connection, :get_connection, :on_create_connection]

  def widget
    data = {}
    if @mx_user
      conn = Atrium::Connect.create(user_guid: @mx_user.guid, options: {is_mobile_webview: true})
      data[:widget_url] = conn.connect_widget_url
    else
      data[:err] = "Cannot connect to financial institutions right now."
    end
    render json: data
  end

  def connections
    data = {}
    if @mx_user
      members = Atrium::Member.list(user_guid: @mx_user.guid)
      members.each do |member|
        data[member.guid] = {bank: member.name, status: member.status}
      end
    end
    render json: data
  end

  def remove_connection
    @mx_member&.delete
    render json: {result: 'ok'}
  end

  def on_create_connection
    RecalcNetWorthJob.perform_later current_user.id
    data = @mx_member ? {bank: @mx_member.name, status: @mx_member.status} : {}
    render json: data
  end

  def get_connection
    data = @mx_member ? {bank: @mx_member.name, status: @mx_member.status} : {}
    render json: data
  end

  def get_balances
    begin
      data = @mx_user&.get_accounts_balances
    rescue Atrium::Error => e
      Rails.logger.info "Atrium Error: e.message"
      if r = e.message.match(/\{.*\}/)
        data = { error: JSON.parse(r[0])['error']['message'] }
      end
    end
    render json: data || {}
  end

  def get_loans
    data = @mx_user&.get_loans || {}
    render json: data
  end

  def get_credit_charges
    data = @mx_user&.month_credit_charges || {}
    render json: data
  end

  def get_accounts_length
    data = {}
    if @mx_user
      data[:accounts] = Atrium::Account.list(user_guid: @mx_user.guid).total_entries
    end
    render json: data
  end

  def get_dashboard_data
    data = {}
    if @mx_user
      attempt = 0
      max_attempts = 10
      d = AtriumCaller.handle(@mx_user.guid, :dashboard_data) { MxTransaction.month_to_date_data(@mx_user.user) }
      balances = AtriumCaller.handle(@mx_user.guid, :accounts) { @mx_user.get_accounts_balances }

      nw = current_user.net_worth_infos.ordered.map{|nw| [ nw.when, nw.amount.round(2) ] }

      data[:income] = d[0]
      data[:expenses] = d[1]
      data[:needs] = d[2]

      data[:cash] = balances[:cash]
      data[:net_worth] = nw
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
