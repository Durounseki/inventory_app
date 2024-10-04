import { MailerSend, EmailParams, Sender, Recipient } from "mailersend";

const mailerSend = new MailerSend({
    apiKey: process.env.MAILERSEND_TOKEN,
});
  
const sentFrom = new Sender(process.env.MAILERSEND_EMAIL, "The Dance Thread");

async function sendEmail(user,link,htmlTemplate,textTemplate) {
    const recipients = [
        new Recipient(user.email, user.name)
    ];
      
    const emailParams = new EmailParams()
    .setFrom(sentFrom)
    .setTo(recipients)
    .setSubject("Please verify your email")
    .setHtml(htmlTemplate(user.name,link))
    .setText(textTemplate(user.name,link));
      
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

function verificationHtmlTemplate(name, link){
    return `
        <!DOCTYPE html>
        <html>
            <head>
                <meta charset="utf-8">
            </head>
            <body>
                <p>Hello ${name}!</p>
                <p>Click on the link below to verify your email</p>
                <a href="${link}" rel="noopener noreferrer" target="_blank" style="display: inline-block; padding: 10px 20px; background-color: #ffa6db; color: #fff5ff; text-decoration: none; border-radius: 5px;">Verify Email</a>
            </body>
        </html>
    `
}

function verificationTextTemplate(name, link){
    return `
        Hello, ${name}! Please verify your email using this link:
        ${link}
    `
}

function sendVerificationEmail(user,link){
    return sendEmail(user,link,verificationHtmlTemplate,verificationTextTemplate);
}

function resetHtmlTemplate(name, link){
    return `
        <!DOCTYPE html>
        <html>
            <head>
                <meta charset="utf-8">
            </head>
            <body>
                <p>Hello ${name}!</p>
                <p>
                    Click on the link below to proceed to reset your password.
                    If you didn't intend to change your password you can ignore this email.
                </p>
                <a href="${link}" rel="noopener noreferrer" target="_blank" style="display: inline-block; padding: 10px 20px; background-color: #ffa6db; color: #fff5ff; text-decoration: none; border-radius: 5px;">Reset Password</a>
            </body>
        </html>
    `
}

function resetTextTemplate(name, link){
    return `
        Hello, ${name}! Please proceed to reset your password using this link:
        ${link}
    `
}

function sendResetEmail(user,link){
    return sendEmail(user,link,resetHtmlTemplate,resetTextTemplate);
}

export{
    sendVerificationEmail,
    sendResetEmail
}