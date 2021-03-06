# Use this file to easily define all of your cron jobs.
#
# It's helpful, but not entirely necessary to understand cron before proceeding.
# http://en.wikipedia.org/wiki/Cron

# Example:
#
# set :output, "/path/to/my/cron_log.log"
#
# every 2.hours do
#   command "/usr/bin/some_great_command"
#   runner "MyModel.some_method"
#   rake "some:great:rake:task"
# end
#
set :bundle_command, 'rvm 2.4.2@df_rails5 do bundle exec'
set :output, "/var/www/df/shared/log/cron.log"

every 1.day, at: '01:00' do
  runner "BudgetTrackingEntity.task"
end

every :tuesday, at: '00:30' do
  rake "mx:import_net_worth"
end
