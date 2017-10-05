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
    @url = verify_url(id: user.perishable_token)
    mail(to: user.email, subject: 'Email verification')
  end

  def tracking(user, secondary_mail, too_fast, too_slow)
    @too_fast = too_fast
    @too_slow = too_slow
    @name = user.name
    @joke = Joke.find(Joke.pluck(:id).sample).content
    attachments.inline['fish.png'] = File.read("#{Rails.root}/app/assets/images/fish/hello.png")
    opts = { to: user.email, subject: "Desi's Budget Update" }
    opts[:cc] = secondary_mail if secondary_mail.present?
    mail(opts)
  end

end
