# config valid only for current version of Capistrano
lock "3.8.1"

set :application, "df"
set :repo_url, "git@github.com:re-mondes/df.git"

# Default branch is :master
set :branch, `git rev-parse --abbrev-ref HEAD`.chomp

# Default deploy_to directory is /var/www/my_app_name
# set :deploy_to, "/var/www/my_app_name"

# Default value for :format is :airbrussh.
# set :format, :airbrussh

# You can configure the Airbrussh format using :format_options.
# These are the defaults.
# set :format_options, command_output: true, log_file: "log/capistrano.log", color: :auto, truncate: :auto

# Default value for :pty is false
set :pty, true

set :linked_files, %w{config/database.yml config/secrets.yml}
set :linked_dirs, %w{log tmp/pids tmp/cache tmp/sockets vendor/bundle public/system public/uploads}


# Default value for default_env is {}
# set :default_env, { path: "/opt/ruby/bin:$PATH" }

# Default value for keep_releases is 5
set :keep_releases, 3

set :rvm_type, :user
set :rvm_ruby_version, '2.4.1'

set :puma_rackup, -> { File.join(current_path, 'config.ru') }
set :puma_state, "#{shared_path}/tmp/pids/puma.state"
set :puma_pid, "#{shared_path}/tmp/pids/puma.pid"
set :puma_bind, "unix://#{shared_path}/tmp/sockets/puma.sock"    #accept array for multi-bind
set :puma_conf, "#{shared_path}/puma.rb"
set :puma_access_log, "#{shared_path}/log/puma_error.log"
set :puma_error_log, "#{shared_path}/log/puma_access.log"
set :puma_role, :app
set :puma_env, fetch(:rack_env, fetch(:rails_env, 'production'))
set :puma_threads, [0, 8]
set :puma_workers, 0
set :puma_worker_timeout, nil
set :puma_init_active_record, true
set :puma_preload_app, false

set :whenever_identifier, ->{ "#{fetch(:application)}_#{fetch(:stage)}" }

#after "deploy:stop",    "delayed_job:stop"
#after "deploy:start",   "delayed_job:start"

after 'deploy:publishing', 'deploy:restart'
namespace :deploy do
  task :restart do
    invoke 'delayed_job:restart'
  end

  task :stop do
    invoke 'puma:stop'
    invoke 'delayed_job:stop'
  end

  task :start do
    invoke 'puma:start'
    invoke 'delayed_job:start'
  end
end


