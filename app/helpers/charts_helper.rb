module ChartsHelper
  def bank_and_savings(counter)
    if counter == 0
      number_to_currency(@banks_may_tell_you, precision: 0)
    elsif counter ==  1
      "<b>Savings Rate</b>".html_safe
    elsif counter == 2
      number_to_percentage(@bank_savings_rate * 100, precision: 0)
    end
  end
end
