class MxTransaction

  OUR_TYPES = {
    housing: {
      'Bills & Utilities' => [], # empty array means whole category matching
      'Home' => []
    },
    transportation: {
      'Auto & Transport' => []
    },
    health_care: {
      'Health & Fitness' => ['Dentist', 'Doctor', 'Eyecare', 'Pharmacy']
    },
    insurance: {
      'Health & Fitness' => ['Health Insurance'],
      'Financial' => ['Life Insurance']
    },
    groceries: {
      'Food & Dining' => ['Groceries']
    },
    dining_out: {
      'Food & Dining' => ['Food & Dining', 'Alcohol & Bars', 'Coffee Shops', 'Fast Food', 'Restaurants']
    },
    personal_care: {
      'Personal Care' => []
    },
    clothing: {
      'Shopping' => ['Clothing']
    },
    entertaining: {
      'Entertainment' => []
    },
    fitness: {
      'Health & Fitness' => ['Gym', 'Sports'],
      'Shopping' => ['Sporting Goods']
    },
    education: {
      'Education' => []
    },
    charity: {
      'Gifts & Donations' => ['Gift', 'Charity']
    },
    vacation: {
      'Travel' => []
    },
    fun: {
      'Pets' => [],
      'Shopping' => ['Books', 'Hobbies']
    },
    credit_card: {
      'Transfer' => []
    },
    everything: {
      # all except of described above
      #'Business Services' => [],
      #'Fees & Charges' => [],
      #'Financial' => [], except of others
      #'Kids' => [],
      #'Taxes' => [],
    }
  }

  TYPES_2_NEEDS = {
    housing:        'basics',
    transportation: 'basics',
    health_care:    'basics',
    insurance:      'basics',
    groceries:      'basics',
    dining_out:     'love',
    personal_care:  'respect',
    clothing:       'respect',
    entertaining:   'love',
    fitness:        'respect',
    education:      'expert',
    charity:        'helping',
    vacation:       'fun',
    fun:            'fun',
    credit_card:    'control',
    savings:        'control',
    everything:     nil
  }

  MX_TYPES = { # top_level_category => category
    'Auto & Transport' => [ 'Auto Insurance', 'Auto Payment', 'Gas', 'Parking',
                            'Public Transportation', 'Service & Parts' ],
    'Bills & Utilities' => [ 'Domain Names', 'Fraud Protection', 'Home Phone',
                              'Hosting', 'Internet', 'Mobile Phone', 'Television', 'Utilities' ],
    'Business Services' => [ 'Advertising', 'Legal', 'Office Supplies', 'Printing', 'Shipping' ],
    'Education' => ['Books & Supplies''Student Loan''Tuition'],
    'Entertainment' => [ 'Amusement', 'Arts', 'Movies & DVDs', 'Music', 'Newspapers & Magazines' ],
    'Fees & Charges' => [ 'ATM Fee', 'Banking Fee', 'Finance Charge',
                          'Late Fee', 'Service Fee', 'Trade Commissions' ],
    'Financial' => [ 'Financial Advisor', 'Life Insurance' ],
    'Food & Dining' => [ 'Alcohol & Bars', 'Coffee Shops', 'Fast Food', 'Groceries', 'Restaurants' ],
    'Gifts & Donations' => [ 'Charity', 'Gift' ],
    'Health & Fitness' => [ 'Dentist', 'Doctor', 'Eyecare', 'Gym', 'Health Insurance', 'Pharmacy', 'Sports' ],
    'Home' => [ 'Furnishings', 'Home Improvement', 'Home Insurance', 'Home Services',
                'Home Supplies', 'Lawn & Garden', 'Mortgage & Rent' ],
    'Income' => [ 'Bonus', 'Interest Income', 'Paycheck', 'Reimbursement', 'Rental Income',
                  'Investments', 'Buy', 'Deposit', 'Dividend & Cap Gains', 'Sell', 'Withdrawal' ],
    'Kids' => [ 'Allowance', 'Baby Supplies', 'Babysitters & Daycare', 'Child Support',
                'Kids Activities', 'Toys' ],
    'Personal Care' => [ 'Hair', 'Laundry', 'Spa & Massage' ],
    'Pets' => [ 'Pet Food & Supplies', 'Pet Grooming', 'Veterinary' ],
    'Shopping' => [ 'Books', 'Clothing', 'Hobbies', 'Sporting Goods' ],
    'Taxes' => [ 'Federal Tax', 'Local Tax', 'Property Tax', 'Sales Tax', 'State Tax' ],
    'Transfer' => [ 'Credit Card Payment', 'Transfer for Cash Spending', 'Mortgage Payment' ],
    'Travel' => [ 'Air Travel', 'Hotel', 'Rental Car & Taxi', 'Vacation' ],
    'Uncategorized' => [ 'Cash', 'Check' ]
  }

  CUSTOM_TYPES = {
    alco: {
      title: "Alcohol & Bars",
      our: "dining_out",
      top_category: 'Food & Dining'
    },
    books: {
      title: "Books",
      our: "fun",
      top_category: 'Shopping'
    },
    business_services: {
      title: "Business Services",
      our: "everything",
      top_category: nil
    },
    hobbies: {
      title: 'Hobbies',
      our: 'fun',
      top_category: 'Shopping'
    },
    home_improvement: {
      title: 'Home Improvement',
      our: 'housing',
      top_category: 'Home'
    },
    home_services: {
      title: 'Home Services',
      our: 'housing',
      top_category: 'Home'
    },
    kids: {
      title: 'Kids',
      our: 'everything',
      top_category: nil
    },
    pets: {
      title: 'Pets',
      our: 'fun',
      top_category: nil
    },
    sporting_goods: {
      title: 'Sporting Goods',
      our: 'fitness',
      top_category: 'Shopping'
    },
    sports: {
      title: 'Sports',
      our: 'fitness',
      top_category: 'Health & Fitness'
    }
  }

  class << self
    def special_type_for(user)
      new_category = user.budget_category.fun_mx_category&.to_sym || :hobbies;
      h = CUSTOM_TYPES[new_category]

      {
        id: new_category,
        type: h[:top_category] || h[:title],
        sub_type: h[:top_category] ? h[:title] : false
      }
    end

    def parse_our_type(atrium_transaction, special)
      type = atrium_transaction.top_level_category
      sub_type = atrium_transaction.category

      if ( special[:top_category] == type ) &&
         ( !special[:sub_type] || special[:sub_type] == sub_type)
        selected_key = special[:id]
      end

      selected_key ||= OUR_TYPES.find do |key, hash|
        sub_types = hash[type]
        !sub_types.nil? && (sub_types.blank? || sub_types.include?(sub_type) || sub_type == type)
      end
      selected_key = selected_key.first if selected_key

      selected_key ||= :everything
    end

    def fill_balances_history(user, with_save = false, with_print = false)
      mx_user = user.mx_user
      accounts_by_type = mx_user.get_accounts

      today = Date.today
      # For today we're checking only accounts balances.
      # For past days - restoring transaction data.
      # After that we could find initial accounts balance.

      negative_accs = []
      last_balances = {}
      birth_dates = {}
      positive = [:cash, :college_savings, :retirement_savings]
      net_worths = Hash.new(0)

      accounts_by_type.each do |kind, accounts|
        is_negative = !positive.include?(kind)
        accounts.each do |acc|
          last_balances[acc.guid] = acc.available_balance || acc.balance
          negative_accs.push(acc.guid) if is_negative
          net_worths[today] += last_balances[acc.guid] * (is_negative ? -1 : 1)
          birth_dates[acc.guid] = Date.parse(acc.created_at)
        end
      end
      restored_balances = { today => last_balances.dup }

      history = {}
      if with_print
        puts "--Transactions--"
      end
      Atrium::Transaction.list_each(user_guid: mx_user.guid, query_params: {from_date: 100.days.ago}) do |tr|
        if with_print
          puts [tr.account_guid[-4..-1], tr.updated_at, tr.transacted_at, tr.status, tr.type, tr.amount, tr.top_level_category, tr.category].join("\t\t")
        end
        amount = tr.amount
        tr_day = tr.transacted_at.to_date
        next if tr_day == today

        acc_id = tr.account_guid

        history[tr_day] ||= Hash.new(0)
        # "DEBIT" - decreasing balance
        # "CREDIT" - increasing balance
        # opposite for negative accounts - credit cards or loans
        sign = 1
        if negative_accs.include?(acc_id)
          sign = -1 if tr.type == 'CREDIT'
        else
          sign = -1 if tr.type != 'CREDIT'
        end
        history[tr_day][acc_id] += amount * sign
      end

      history.keys.sort{|a,b| b <=> a}.each do |day|
        restored_balances[day] = {}
        history[day].each do |acc, amount|
          # Minus amount because we're moving in reverse history mode
          restored_balances[day][acc] = last_balances[acc] -= amount
        end
        last_balances.each do |acc, amount|
          #if birth_dates[acc] <= day
            net_worths[day] += amount * (negative_accs.include?(acc) ? -1 : 1)
          #end
        end
      end

      if with_print
        puts "--History--"
        history.each do |day, info|
          puts [day, info.map{|k,v| "#{k[-4..-1]}: #{v}" }.join("\t") ].join "\t\t"
        end
        puts "--Restored Balances--"
        restored_balances.each do |day, info|
          puts [day, net_worths[day], info.map{|k,v| "#{k[-4..-1]}: #{v}" }.join("\t") ].join "\t\t"
        end
        puts "--Account Details--"
        birth_dates.each do |acc, day|
          puts [day, acc[-4..-1], negative_accs.include?(acc) ? "NEGATIVE" : ""].join "\t\t"
        end
      end

      if with_save
        NetWorthInfo.where(user_id: user.id).delete_all
        net_worths.each do |day, amount|
          NetWorthInfo.create(user_id: user.id, amount: amount, when: day)
        end
      end

      net_worths
    end

    def month_to_date_data(user, with_print = false)
      mx_user = user.mx_user
      budget_needs = user.budget_need
      special = special_type_for(user)
      income = expenses = 0
      today = Date.today
      totals = {}
      all_needs = %w(basics love respect expert helping fun control)

      TYPES_2_NEEDS.each do |category, need|
        next if !need
        totals[need] ||= { planned: 0, current: 0 }
        totals[need][:planned] += [user.budget_category.send(category) || 0, 0].max
      end
      if with_print
        puts totals
      end
      totals['control'][:planned] += user.big_decision.monthly_savings

      Atrium::Transaction.list_each(user_guid: mx_user.guid, query_params: {from_date: today.beginning_of_month}) do |tr|
        our_tr_type = parse_our_type(tr, special)
        need = TYPES_2_NEEDS[our_tr_type]
        if with_print
          puts [tr.transacted_at, tr.status, tr.type, tr.amount, tr.top_level_category, tr.category, need, our_tr_type].join("\t\t")
        end
        amount = tr.amount
        if tr.type == 'CREDIT'
          income += amount
          totals['control'][:current] += amount
        else
          expenses += amount
        end
        if need
          totals[need][:current] += amount
          totals[need][:met] = budget_needs.send("#{need}_met")
        end
      end
      totals.each do |need, data|
        data[:current] = data[:current].round(2)
      end


      [ income.round, expenses.round, totals ]
    end

    def grouped_by_categories(user, date, get_prev_data = false, with_print = false)
      mx_user = user.mx_user
      special = special_type_for(user)

      totals = Hash.new(0)
      totals_prev = Hash.new(0)

      Atrium::Transaction.list_each(user_guid: mx_user.guid, query_params: {from_date: date.beginning_of_month}) do |tr|
        next if tr.type == 'CREDIT'
        our_tr_type = parse_our_type(tr, special)
        totals[our_tr_type] += tr.amount
        # Transacted_at could be earlier than current date, so use Updated_at attribute as a sign on "not today transactions"
        if get_prev_data && tr.updated_at.to_date != date
          totals_prev[our_tr_type] += tr.amount
        end
        if with_print
          puts [tr.updated_at, tr.transacted_at, tr.status, tr.type, tr.amount, our_tr_type, tr.top_level_category, tr.category].join("\t\t")
        end
      end

      [totals, totals_prev]
    end

    def dynamic_stats(user, to_date, totals)
      # As far as we decided to send notifications on the next day after end of a period
      # // On EST. Say, 8 a.m. EST (1p.m.UTC)
      # we need to check stats until previous day

      time_elapsed_p = to_date.day * 1.0 / to_date.end_of_month.day

      budget_categories = user.budget_category

      special = special_type_for(user)
      special_title = special[:sub_type] || special[:type]

      too_fast = {}
      too_slow = {}
      [
        :transportation, :insurance, :groceries, :dining_out, :personal_care,
        :clothing, :entertaining, :fitness, :education, :charity, :fun, :everything
      ].each do |key|
        expected_spending = budget_categories.send(key) || 0
        is_special = key == :fun
        current_spending = totals[is_special ? special[:id] : key] || 0
        next if current_spending == 0 && expected_spending == 0

        title = is_special ? special_title : key.to_s.split('_').map(&:capitalize).join(' ')
        title = 'Everything Else' if title == 'Everything'
        diff = expected_spending - current_spending

        if (expected_spending == 0 || (current_spending / expected_spending > time_elapsed_p))
          too_fast[title] = diff
        else
          too_slow[title] = diff
        end
        #puts [key, current_spending, 'of', expected_spending, '=>', diff[key]].join("\t\t")
      end
      [too_fast, too_slow]
    end

    def month_credit_charges(mx_user, with_print = false)
      charges = Hash.new(0)
      Atrium::Transaction.list(user_guid: mx_user.guid, query_params: {from_date: Date.today.beginning_of_month}).each do |tr|
        next unless tr.type == 'CREDIT'
        charges[tr.account_guid] += tr.amount
        if with_print
          puts [tr.transacted_at, tr.account_guid, tr.type, tr.amount, tr.top_level_category, tr.category].join("\t\t")
        end
      end
      accounts = {}
      credit_card_types = MxUser::ACCOUNT_TYPES[:credit_cards]
      charges.each do |guid, amount|
        acc = Atrium::Account.read(user_guid: mx_user.guid, account_guid: guid)
        if acc.type.in?(credit_card_types)
          name = acc.name
          accounts[name] = amount.round
        end
      end
      accounts
    end
  end

end
