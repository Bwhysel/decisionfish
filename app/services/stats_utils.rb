class StatsUtils

  # Reference!M6:M106  https://www.ssa.gov/oact/STATS/table4c6.html#fn2
  LIFE_NUMBERS_MALE = [100000, 99343, 99299, 99270, 99248, 99230, 99215, 99200, 99187, 99175, 99164, 99155, 99146, 99132, 99112, 99080, 99037, 98983, 98917, 98837, 98744, 98637, 98517, 98387, 98254, 98120, 97987, 97855, 97722, 97588, 97452, 97312, 97170, 97024, 96876, 96724, 96568, 96405, 96236, 96057, 95869, 95668, 95453, 95221, 94967, 94687, 94380, 94043, 93674, 93270, 92830, 92352, 91832, 91270, 90663, 90008, 89302, 88544, 87736, 86886, 85995, 85060, 84075, 83032, 81925, 80748, 79492, 78151, 76717, 75185, 73548, 71795, 69917, 67915, 65796, 63559, 61195, 58692, 56048, 53265, 50344, 47283, 44091, 40794, 37424, 34014, 30589, 27180, 23822, 20555, 17429, 14493, 11797, 9379, 7270, 5481, 4018, 2864, 1986, 1341, 884]
  # Reference!P6:P106 https://www.ssa.gov/oact/STATS/table4c6.html#fn1
  LIFE_NUMBERS_FEMALE = [100000, 99449, 99411, 99389, 99373, 99358, 99346, 99334, 99324, 99314, 99305, 99296, 99288, 99277, 99265, 99248, 99228, 99204, 99175, 99144, 99109, 99071, 99030, 98986, 98939, 98891, 98841, 98789, 98735, 98677, 98615, 98549, 98478, 98403, 98323, 98240, 98153, 98060, 97960, 97853, 97737, 97610, 97472, 97321, 97155, 96972, 96772, 96552, 96312, 96050, 95766, 95457, 95123, 94763, 94380, 93974, 93543, 93083, 92592, 92071, 91516, 90923, 90287, 89600, 88857, 88050, 87171, 86211, 85168, 84039, 82818, 81494, 80054, 78494, 76809, 74992, 73026, 70896, 68604, 66153, 63542, 60757, 57786, 54633, 51305, 47815, 44179, 40417, 36561, 32655, 28751, 24912, 21208, 17707, 14472, 11557, 9010, 6854, 5088, 3687, 2610]
  # Reference!W4
  SOC_SEC = {
    62 => [ 0.7   , 0.325 ],
    63 => [ 0.75  , 0.35 ],
    64 => [ 0.8   , 0.375 ],
    65 => [ 0.867 , 0.417 ],
    66 => [ 0.933 , 0.458 ],
    67 => [ 1.0   , 0.5 ],
    68 => [ 1.08  , 0.5 ],
    69 => [ 1.1664, 0.5 ],
    70 => [ 1.2597, 0.5 ],
  }

  TAX_RATES_SINGLE = {
    0      => 0.10,
    9275   => 0.15,
    37650  => 0.25,
    91150  => 0.28,
    190150 => 0.33,
    413350 => 0.35,
    415050 => 0.396
  }

  TAX_RATES = {
    0      => 0.10,
    18550  => 0.15,
    75300  => 0.25,
    151900 => 0.28,
    231450 => 0.33,
    413350 => 0.35,
    466950 => 0.396
  }

  # https://trends.collegeboard.org/college-pricing/figures-tables/net-price-public-two-year-institutions-dependency-status-income-2011-12
  # U1 = Private Nonprofit 4Yr
  # U2 = Public 4Yr In-State
  # U3 = Public 4Yr
  # U4 = Public 2Yr
  COLLEGE_PRICING = {
    0      => [ 20720, 11020, 20750, 8070 ],
    30000  => [ 24650, 14970, 24060, 10940 ],
    65000  => [ 29950, 18940, 28340, 13290 ],
    106000 => [ 34020, 20530, 31410, 13790 ]
  }

  def life_expectancy(sex, age, risk)
    #assert(life_expectancy('Male', 40, 0.9), 93)
    #assert(life_expectancy('Female', 38, 0.9), 96)
    data = sex == 'Male' ? LIFE_NUMBERS_MALE : LIFE_NUMBERS_FEMALE
    # =MATCH(INDEX(data,age+1)*(1-E269),data,-1)
    # original formula, Future!E270, uses age + 1 cuz excel has non-zero indexed arrays
    v = data[age] * (1-risk)
    i = 0
    n = data.length
    while (i < n) && (data[i] >= v) do
      i += 1
    end
    i
  end

  def rng_SocSec(lookup_age, failure_value = 0)
    SOC_SEC[lookup_age] || [0, 0]
    # assert rng_SocSec(67), [1.0, 0.5]
  end

  def cumprinc(rate, nper, pV, start_period, end_period, type)
    # source: https://stackoverflow.com/a/30512609
    if type == 1
      start_period -= 1
      end_period -= 1
    end
    return 0 if end_period > nper
    rateK = 1 + rate
    k1 = rateK ** nper
    k2 = rateK ** end_period - rateK ** (start_period - 1)
    monthly_payment = rate * pV * k1 / (k1 - 1)
    k2 * pV - monthly_payment * k2 / rate

    # assert cumprinc(0.04/12, 30*12, 1, 1, 5*12, 0), -0.0955
  end

  def pmt(r, n, pv)
    # source: https://superuser.com/a/871411
    (pv*r) / ((1 + r)**(-n) - 1)
  end

  def pv(rate, nper, pmt, fv=0, type=0)
    # source: https://support.office.com/en-us/article/PV-function-23879d31-0e02-4321-be01-da16e8168cbd
    # pv * (1+rate)**nper + pmt * (1+rate*type) * ((1+rate)**nper-1)/rate + fv == 0
    if rate == 0
      fv - pmt * nper
    else
      kper = (1+rate)**nper
      (fv - pmt * (1+rate*type) * (kper-1) / rate) / kper
    end
  end

  def college_cost(income, college_type)
    #=INDEX(rng_College,MATCH(Table!O2,Reference!D4:D7,1),MATCH(B281,Reference!$E$3:$H$3,0))
    net_level = COLLEGE_PRICING.keys[college_cost_level(income)]
    COLLEGE_PRICING[net_level][college_type]
  end

  def college_cost_level(income)
    i = 0
    COLLEGE_PRICING.keys.each do |net|
      break if net > income
      i += 1
    end
    [i-1, 0].max
  end

  # VLOOKUP analogue
  def tax_rate(value, data, column = nil, match = 1, missing_return = 0)
    # match = 1 // approximate search
    # match = 0 || false // exaxt search
    # TRUE assumes the first column in the table is sorted either numerically or alphabetically, and will then search for the closest value. This is the default method if you don't specify one.
    # FALSE searches for the exact value in the first column.
    rate = if match == 0 # exact search
      data[value]
    else # approximate search
      prev_rate = nil
      data.each do |key, rate|
        key <= value ? prev_rate = rate : break
      end
      prev_rate
    end
    rate || missing_return
  end


end