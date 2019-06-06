namespace :mx do
  task :import_net_worth => :environment do
    today = Date.today
    positive = [:cash, :college_savings, :retirement_savings]
    puts "Net Worth Import: #{today}"
    MxUser.all.find_each(batch_size: 10) do |mx_user|

      begin
        m = Atrium::User.read(guid: mx_user.guid)
      rescue Atrium::Error => e
        puts "#{mx_user.user_id}: #{e.message} on getting accounts"
      end
      next if !m

      user = mx_user.user
      next if user.net_worth_infos.where(when: today).exists?

      v = 0

      begin
        mx_user.get_accounts_balances.each do |key, amount|
          v += amount * (positive.include?(key) ? 1 : -1)
        end

        puts "#{mx_user.user_id}: done"

        NetWorthInfo.create(user: user, when: today, amount: v)
      rescue Atrium::Error => e
        puts "#{mx_user.user_id}: #{e.message} on getting accounts"
      end

    end
  end
end
