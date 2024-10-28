const path = require('path');
const nodemailer = require('nodemailer');


const transport = nodemailer.createTransport({
    host: 'live.smtp.mailtrap.io', // ou outro servidor SMTP
    port: 587,
    secure: false, // true para 465, false para outras portas
    auth: {
        user: 'api', // seu e-mail
        pass: '1c42b21776ad7b475ae1e0bffc99cf04', // sua senha de e-mail
    },
    // host: "sandbox.smtp.mailtrap.io",
    // port: 2525,
    // auth: {
    //   user: "c0419c52e2c04c",
    //   pass: "cabe286ad5a632"
    // }

  });


module.exports = transport