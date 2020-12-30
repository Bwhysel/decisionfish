source 'https://rubygems.org'

git_source(:github) do |repo_name|
  repo_name = "#{repo_name}/#{repo_name}" unless repo_name.include?("/")
  "https://github.com/#{repo_name}.git"
end

gem 'rails', '~> 5.1.1'
gem 'pg'
gem 'puma', '~> 3.7'

gem 'sass-rails', '~> 5.0'
# Use Uglifier as compressor for JavaScript assets
gem 'uglifier', '4.0.2'
# See https://github.com/rails/execjs#readme for more supported runtimes
# gem 'therubyracer', platforms: :ruby

# Use Redis adapter to run Action Cable in production
# gem 'redis', '~> 3.0'
# Use ActiveModel has_secure_password
gem 'bcrypt', '~> 3.1.7'

gem 'ejs' # JST assets pipelining

gem "authlogic", "~> 3.6"
gem 'omniauth-google-oauth2', '~> 0.6'
gem 'omniauth'

gem 'attr_encrypted'

gem 'nexmo'
gem 'atrium-ruby', '~> 1.3' # MX

#gem "foreman"
#gem "react_on_rails", "~> 7"

gem 'daemons'
gem 'delayed_job_active_record'
gem 'whenever', :require => false

gem "sentry-raven"
gem 'newrelic_rpm'

# Use Capistrano for deployment
# gem 'capistrano-rails', group: :development

group :development, :test do
  # Call 'byebug' anywhere in the code to stop execution and get a debugger console
  gem 'byebug', platforms: [:mri, :mingw, :x64_mingw]
  # Adds support for Capybara system testing and selenium driver
  gem 'nokogiri', '~> 1.10.10'
  gem 'capybara', '~> 2.13'
end


group :development do
  gem 'capistrano'
  gem 'capistrano3-puma'
  gem 'capistrano-rails', require: false
  gem 'capistrano-bundler', require: false
  gem 'capistrano-rvm'
  # Access an IRB console on exception pages or by using <%= console %> anywhere in the code.
  #gem 'web-console', '>= 3.3.0'
  gem 'listen', '>= 3.0.5', '< 3.2'
  # Spring speeds up development by keeping your application running in the background. Read more: https://github.com/rails/spring
  gem 'spring'
  gem 'spring-watcher-listen', '~> 2.0.0'
end
gem 'mini_racer', platforms: :ruby
