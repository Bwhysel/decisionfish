Rails.application.routes.draw do
  devise_for :users, path: 'admin'

  namespace :admin do
    resources :decisions do
      resources :formulas, :variables
    end

    root 'decisions#index'
  end

  resources :decisions, only: [:index, :show] do
    member do
      get 'assumptions'
      get 'make_decision'
      get 'understand_results'
      get 'done'
      get 'detailed_results'
      get 'other_scenarios'
      get 'bank_debt_to_income_tests'
      get 'upload_csv'
      post 'import_csv'
      get 'charts'
      get 'send_email'
    end

    resources :variables, only: [:index, :show] do
      collection do
        get 'free_result_table'
      end
    end
  end

  root 'pages#show', page: 'welcome'
  get "/pages/:page" => "pages#show"

  # The priority is based upon order of creation: first created -> highest priority.
  # See how all your routes lay out with "rake routes".

  # You can have the root of your site routed with "root"
  # root 'welcome#index'

  # Example of regular route:
  #   get 'products/:id' => 'catalog#view'

  # Example of named route that can be invoked with purchase_url(id: product.id)
  #   get 'products/:id/purchase' => 'catalog#purchase', as: :purchase

  # Example resource route (maps HTTP verbs to controller actions automatically):
  #   resources :products

  # Example resource route with options:
  #   resources :products do
  #     member do
  #       get 'short'
  #       post 'toggle'
  #     end
  #
  #     collection do
  #       get 'sold'
  #     end
  #   end

  # Example resource route with sub-resources:
  #   resources :products do
  #     resources :comments, :sales
  #     resource :seller
  #   end

  # Example resource route with more complex sub-resources:
  #   resources :products do
  #     resources :comments
  #     resources :sales do
  #       get 'recent', on: :collection
  #     end
  #   end

  # Example resource route with concerns:
  #   concern :toggleable do
  #     post 'toggle'
  #   end
  #   resources :posts, concerns: :toggleable
  #   resources :photos, concerns: :toggleable

  # Example resource route within a namespace:
  #   namespace :admin do
  #     # Directs /admin/products/* to Admin::ProductsController
  #     # (app/controllers/admin/products_controller.rb)
  #     resources :products
  #   end
end
