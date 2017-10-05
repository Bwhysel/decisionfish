Rails.application.routes.draw do



  namespace :admin do
    resources :jokes
    resources :encouragments
    resources :desi_says_modals
    resources :ideas do
      get 'pending', on: :collection
      get 'reported', on: :collection
    end
    resources :available_emails

    get 'login' => 'base#login'
    post 'sign_in' => 'base#sign_in'
    get 'logout' => 'base#logout'
  end

  get '/auth/:provider/callback', to: 'admin/base#sign_in'


  root to: 'home#index'

  get '/additional_content' => 'home#additional_content'

  post 'ask/desi'

  post 'signup'              => 'user#create'
  post 'login'               => 'user#login'
  post 'logout'              => 'user#logout'
  post 'reset'               => 'user#reset'
  post 'position'            => 'user#save_position'
  get  'position'            => 'user#get_position'
  get   'verify'             => 'user#verify'
  post  'resend_pin'         => 'user#resend_pin'
  post  'verify_pin'         => 'user#verify_pin'
  patch '/user/update_phone' => 'user#update_phone'
  get   '/user/profile'      => 'user#profile'
  get '/ideas/get'           => 'user#get_idea'
  post '/ideas/give'         => 'user#give_idea'
  post '/ideas/report'       => 'user#report_idea'
  post '/ideas/like'         => 'user#like_idea'

  get '/finance_details/:step' => 'home#index'
  patch '/finance_details'     => 'people#update_details'

  patch  '/people/children' => 'people#update_children'
  post   '/people'          => 'people#create'
  patch  '/people/:id'      => 'people#update'
  delete '/people/:id'      => 'people#destroy'

  post '/import/widget' => 'mx#widget'
  get '/import/connections' => 'mx#connections'
  get '/import/connections/:id' => 'mx#get_connection'
  delete '/import/connections/:id' => 'mx#remove_connection'
  get '/import/balances' => 'mx#get_balances'
  get '/import/loans' => 'mx#get_loans'
  get '/import/accounts_length' => 'mx#get_accounts_length'

  post '/big_decision/solve' => 'big_decision#solve'
  post '/different_decisions/solve' => 'big_decision#solve_different'
  post '/defaults' => 'big_decision#defaults'

  get '/future_history/:step' => 'home#index'

  get '/future_assumptions/:step'  => 'home#index'
  get '/different_decisions/:step' => 'home#index'
  get '/budget_walkthrough/:step'  => 'home#index'
  get '/savings_loans/:step'       => 'home#index'

  patch '/budget_needs'      => 'people#update_budget_needs'
  patch '/budget_categories' => 'people#update_budget_categories'
  patch '/budget_tracking' => 'people#update_tracking_info'
  patch '/loans' => 'people#update_loans'

  get ':page' => 'home#index'
  #get 'hello_world', to: 'hello_world#index'
end
