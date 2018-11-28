class UserSession < Authlogic::Session::Base
  remember_me_for 30.minutes
  httponly true
end