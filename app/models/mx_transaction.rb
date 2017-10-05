class MxTransaction < ApplicationRecord
  belongs_to :user
  belongs_to :mx_user

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
      'Food & Dining' => ['Alcohol & Bars', 'Coffee Shops', 'Fast Food', 'Restaurants']
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
    everything: {
      # all except of described above
      #'Business Services' => [],
      #'Fees & Charges' => [],
      #'Financial' => [], except of others
      #'Kids' => [],
      #'Taxes' => [],
    }
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

  def self.special_type_for(user)
    new_category = user.budget_category.fun_mx_category.to_sym || 'hobbies';
    h = CUSTOM_TYPES[new_category]

    {
      id: new_category,
      type: h[:top_category] || h[:title],
      sub_type: h[:top_category] ? h[:title] : false
    }
  end

  def self.parse_our_type(atrium_transaction, special)
    type = atrium_transaction.top_level_category
    sub_type = atrium_transaction.category

    if ( special[:top_category] == type ) &&
       ( !special[:sub_type] || special[:sub_type] == sub_type)
      selected_key = special[:id]
    end

    selected_key ||= OUR_TYPES.find do |key, hash|
      sub_types = hash[type]
      !sub_types.nil? && (sub_types.blank? || sub_types.include?(sub_type))
    end
    selected_key = selected_key.first if selected_key

    selected_key ||= :everything
  end


  def self.import_from(mx_user, with_print = false)
    special = special_type_for(mx_user)
    Atrium::Transaction.list(user_guid: mx_user.guid, from_date: 40.days.ago.to_date.to_s).each do |tr|
      next if tr.type == 'CREDIT'
      load(tr, mx_user, special)
      if with_print
        puts [tr.transacted_at, tr.type, tr.amount, parse_our_type(tr, special), tr.top_level_category, tr.category].join("\t\t")
      end
    end
    nil
  end

  def self.load(tr, mx_user, special)
    guid = tr.guid
    new_tr = mx_user.transactions.find_by(guid: tr.guid)
    new_tr ||= MxTransaction.new(
      guid: guid,
      user_id: mx_user.user_id,
      mx_user_id: mx_user.id,
      amount: tr.amount,
      date: tr.date,
      top_level_category: tr.top_level_category,
      category: tr.category
    )
    new_tr.update_attributes(
      our_category: parse_our_type(tr, special),
      status: tr.status,
      transacted_at: tr.transacted_at
    )
  end

  def self.group_by_date(user, to_date)
    # As far as we decided to send notifications on the next day after end of a period
    # // On EST. Say, 8 a.m. EST (1p.m.UTC)
    # we need to check stats until previous day

    time_elapsed_p = to_date.day * 1.0 / to_date.end_of_month.day

    from_date = to_date.beginning_of_month

    too_fast = []
    too_little = []

    budget_categories = user.budget_category

    special = special_type_for(user)

    spend = user.mx_user.transactions.where(date: (from_date..to_date)).group(:our_category).sum(:amount)

    too_fast = {}
    too_slow = {}
    [
      :transportation, :insurance, :groceries, :dining_out, :personal_care,
      :clothing, :entertaining, :fitness, :education, :charity, :fun, :everything
    ].each do |key|
      expected_spending = budget_categories.send(key) || 0
      is_special = key == :fun
      current_spending = spend[(is_special ? special[:id] : key).to_s] || 0
      next if current_spending == 0 && expected_spending == 0

      title = is_special ? special[:sub_type] || special[:type] : key.to_s.split('_').map(&:capitalize).join(' ')
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

end
