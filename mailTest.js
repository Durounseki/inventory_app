import 'dotenv/config';
import { MailerSend, EmailParams, Sender, Recipient } from "mailersend";

const mailerSend = new MailerSend({
  apiKey: process.env.MAILERSEND_TOKEN,
});

const sentFrom = new Sender(process.env.MAILERSEND_EMAIL, "The Dance Thread");

const recipients = [
  new Recipient("cesparzajp@gmail.com", "Your Client")
];

const emailParams = new EmailParams()
  .setFrom(sentFrom)
  .setTo(recipients)
  .setSubject("Testing MailerSend")
  .setHtml("<strong>This is the HTML content</strong>")
  .setText("This is the text content");

mailerSend.email
	.send(emailParams)
  .then((response) => response.statusCode === 202 ? console.log("Email sent") : console.log("Error sending email"))
  .catch((error) => console.log(error));
