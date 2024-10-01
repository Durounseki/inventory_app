import 'dotenv/config';
import { MailerSend, EmailParams, Sender, Recipient } from "mailersend";

const mailerSend = new MailerSend({
  apiKey: process.env.MAILERSEND_TOKEN,
});

const sentFrom = new Sender("MS_EEu0SN@trial-3zxk54v2vyzljy6v.mlsender.net", "Your name");

const recipients = [
  new Recipient("cesparzadev@gmail.com", "Your Client")
];

const emailParams = new EmailParams()
  .setFrom(sentFrom)
  .setTo(recipients)
  .setSubject("This is a Subject")
  .setHtml("<strong>This is the HTML content</strong>")
  .setText("This is the text content");

mailerSend.email
	.send(emailParams)
  .then((response) => console.log(response))
  .catch((error) => console.log(error));
