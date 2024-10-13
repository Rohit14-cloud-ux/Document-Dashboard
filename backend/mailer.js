const nodemailer = require('nodemailer');

const sendMail = async (to, subject, text, attachments) => {
    // Log the email details instead of sending
    console.log('Email would be sent with the following details:');
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Text: ${text}`);
    console.log('Attachments:', attachments);

    // Return a resolved promise to simulate successful sending
    return Promise.resolve({ response: 'Email logged successfully' });
};

module.exports = sendMail;