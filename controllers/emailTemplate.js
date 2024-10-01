import { MailerSend, EmailParams, Sender, Recipient } from "mailersend";

const mailerSend = new MailerSend({
    apiKey: process.env.MAILERSEND_TOKEN,
});
  
const sentFrom = new Sender(process.env.MAILERSEND_EMAIL, "The Dance Thread");

async function sendVerificationEmail(user,verificationLink) {
    const recipients = [
        new Recipient(user.email, user.name)
    ];
      
    const emailParams = new EmailParams()
    .setFrom(sentFrom)
    .setTo(recipients)
    .setSubject("Please verify your email")
    .setHtml(`
        <!DOCTYPE html>
        <html>
            <head>
                <meta charset="utf-8">
            </head>
            <body>
                <p>Hello ${user.name}!</p>
                <p>Click on the link below to verify your email</p>
                <a href="${verificationLink}" style="display: inline-block; padding: 10px 20px; background-color: #ffa6db; color: #fff5ff; text-decoration: none; border-radius: 5px;">Verify Email</a>
            </body>
        </html>
        `
    )
    .setText(`
        Hello, ${user.name}! Please verify your email using this link:
        ${verificationLink}
        `,
    );
      
    return mailerSend.email.send(emailParams)
    .then((response) => {
        console.log('Email sent successfully: ', response);
        return response;
    })
    .catch((error) => {
        console.log("Error sending email")
        throw error
    });

}

export default sendVerificationEmail;