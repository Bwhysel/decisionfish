module DecisionsHelper
  def negative_values_array_left
    negative_values = []
    [session[:spend_month].to_f, @net_housing_expense_left, @net_housing_expense_right, @net_housing_expense_you].each do |val|
      if val < 0
        negative_values << val.to_f
      end
    end

    return negative_values
  end

  def negative_values_array_right
    negative_values = []
    [@calculate_future_value, @future_wealth_left, @future_wealth_right, @future_wealth_you].each do |val|
      if val < 0
        negative_values << val.to_f
      end
    end

    return negative_values
  end

  def left_value_space(number)
    negative_values = negative_values_array_left

    calculator = Dentaku::Calculator.new
    calculator.bind({spend_month: session[:spend_month].to_f,
                    expense_left: @net_housing_expense_left.abs,
                    expense_right: @net_housing_expense_right.abs,
                    expense_you: @net_housing_expense_you.abs})
    left_column_max = calculator.evaluate('MAX(spend_month,
                                              expense_left,
                                              expense_right,
                                              expense_you)')
    calculator.bind({spend_month: session[:spend_month].to_f,
                    expense_left: @net_housing_expense_left,
                    expense_right: @net_housing_expense_right,
                    expense_you: @net_housing_expense_you})

    left_column_positive_max = calculator.evaluate('MAX(spend_month,
                                              expense_left,
                                              expense_right,
                                              expense_you)')
    left_column_negative_max = calculator.evaluate('MIN(spend_month,
                                              expense_left,
                                              expense_right,
                                              expense_you)').abs
    plus_value = 100 - (((100 * left_column_positive_max / left_column_max) / 2) + (((100 * left_column_negative_max / left_column_max) / 2)))

    if negative_values.size > 0
      if number > 0
        space = ((100 * number.abs / left_column_max) / 2) + plus_value
      else
        space = (100 * number.abs / left_column_max) / 2
      end
    else
      space = 100 * number.abs  / left_column_max
    end
  end


  def right_value_space(number)
    negative_values = negative_values_array_right

    calculator = Dentaku::Calculator.new
    calculator.bind({future_value: @calculate_future_value.abs,
                    wealth_left: @future_wealth_left.abs,
                    wealth_right: @future_wealth_right.abs,
                    wealth_you: @future_wealth_you.abs})
    right_column_max = calculator.evaluate('MAX(future_value,
                                              wealth_left,
                                              wealth_right,
                                              wealth_you)')
    calculator.bind({future_value: @calculate_future_value,
                    wealth_left: @future_wealth_left,
                    wealth_right: @future_wealth_right,
                    wealth_you: @future_wealth_you})

    right_column_positive_max = calculator.evaluate('MAX(future_value,
                                              wealth_left,
                                              wealth_right,
                                              wealth_you)')
    right_column_negative_max = calculator.evaluate('MIN(future_value,
                                              wealth_left,
                                              wealth_right,
                                              wealth_you)').abs
    plus_value = 100 - (((100 * right_column_positive_max / right_column_max) / 2) + (((100 * right_column_negative_max / right_column_max) / 2)))

    if negative_values.size > 0
      if number > 0
        space = ((100 * number.abs / right_column_max) / 2) + plus_value
      else
        space = (100 * number.abs / right_column_max) / 2
      end
    else
      space = 100 * number.abs  / right_column_max
    end
  end

  def before_value_space_left(number)
    negative_values = negative_values_array_left

    calculator = Dentaku::Calculator.new
    calculator.bind({spend_month: session[:spend_month].to_f,
                    expense_left: @net_housing_expense_left.abs,
                    expense_right: @net_housing_expense_right.abs,
                    expense_you: @net_housing_expense_you.abs})
    left_column_max = calculator.evaluate('MAX(spend_month,
                                              expense_left,
                                              expense_right,
                                              expense_you)')

    if negative_values.size == 1
      if number < 0
        space = 0
      elsif number > 0
        space = (100 * negative_values[0].abs / left_column_max.to_f) / 2
      end
    elsif negative_values.size > 1
      numbers = %w(first second third fourth)
      counter = 0
      negative_values.each_with_index do |val, index|
        binding_word = numbers[index].to_sym
        calculator.bind({ binding_word => val.abs })
        counter += 1
      end

      case counter
      when 2
        negative_max = calculator.evaluate('MAX(first, second)')
      when 3
        negative_max = calculator.evaluate('MAX(first, second, third)')
      when 4
        negative_max = calculator.evaluate('MAX(first, second, third, fourth)')
      end

      if number < 0
        space = (100 * (negative_max - number.abs)  / left_column_max) / 2
      elsif number > 0
        space = (100 * negative_max / left_column_max) / 2
      end
    elsif negative_values.size == 0
      space = 0
    end
  end

  def before_value_space_right(number)
    negative_values = negative_values_array_right

    calculator = Dentaku::Calculator.new
    calculator.bind({future_value: @calculate_future_value.abs,
                    wealth_left: @future_wealth_left.abs,
                    wealth_right: @future_wealth_right.abs,
                    wealth_you: @future_wealth_you.abs})
    right_column_max = calculator.evaluate('MAX(future_value,
                                              wealth_left,
                                              wealth_right,
                                              wealth_you)')

    if negative_values.size == 1
      if number < 0
        space = 0
      elsif number > 0
        space = (100 * negative_values[0].abs / right_column_max.to_f) / 2
      end
    elsif negative_values.size > 1
      numbers = %w(first second third fourth)
      counter = 0
      negative_values.each_with_index do |val, index|
        binding_word = numbers[index].to_sym
        calculator.bind({ binding_word => val.abs })
        counter += 1
      end

      case counter
      when 2
        negative_max = calculator.evaluate('MAX(first, second)')
      when 3
        negative_max = calculator.evaluate('MAX(first, second, third)')
      when 4
        negative_max = calculator.evaluate('MAX(first, second, third, fourth)')
      end

      if number < 0
        space = (100 * (negative_max - number.abs)  / right_column_max) / 2
      elsif number > 0
        space = (100 * negative_max / right_column_max) / 2
      end
    elsif negative_values.size == 0
      space = 0
    end
  end
end
