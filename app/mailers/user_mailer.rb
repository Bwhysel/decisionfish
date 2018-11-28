class UserMailer < ApplicationMailer
  default from: 'no-reply@decisionfish.com'
  def ask_desi(text, email, option = 0)
    subject = case option
    when 0
      'Help me with different decision'
    when 1
      'I have a suggestion, compliment or criticism'
    when 2
      'Help!'
    else
      'Other'
    end
    @email = email
    @text = text

    mail(to: 'desi@decisionfish.com', subject: subject)
  end

  def verify_email(user)
    @greetings = user.phone_verified? ? 'Welcome back.' : 'Thank you for signing up.'
    @url = verify_url(id: user.perishable_token, protocol: 'https')
    mail(to: user.email, subject: 'Email verification')
  end

  def tracking(user, secondary_mail, too_fast, too_slow)
    @too_fast = too_fast
    @too_slow = too_slow
    @name = user.name
    @joke = Joke.find(Joke.pluck(:id).sample).content
    @unsubscribe_url = unsubscribe_url(user.budget_tracking_entity.unsubscribe_hash, protocol: 'https')
    attachments.inline['fish.png'] = File.read("#{Rails.root}/app/assets/images/fish/hello.png")

    main_recipients = [ user.email ]
    main_recipients.push(user.email2) if user.email2.present?

    opts = { to: main_recipients, subject: "Desi's Budget Update" }
    opts[:cc] = secondary_mail if secondary_mail.present?

    headers['List-Unsubscribe'] = @unsubscribe_url

    mail(opts)
  end

  def remind_me_return(user)
    @names = user.persons.collect(&:name).join(" and ")
    add_fish_image

    @host = ActionMailer::Base.default_url_options[:host]
    @links = [
      ['/dashboard', 'Check your financial wellness dashboard'],
      ['/budget_intro', 'Manage your Happy Budget®'],
      ['/savings_intro', 'Put your monthly savings to work'],
      ['/ideas', 'Give and get ideas'],
      ['/ask', 'Ask me anything'],
      ['/menu', 'Revisit a chapter']
    ]

    mail({
      to: user.email,
      subject: "Desi's Reminder"
    })
  end

private

  def add_fish_image
    attachments.inline['fish.png'] = File.read("#{Rails.root}/app/assets/images/fish/hello.png")
  end

end
