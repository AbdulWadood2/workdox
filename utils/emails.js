const nodemailer = require("nodemailer");
// const pug = require("pug");
const { html } = require("./htmlEmail");
module.exports = class Email {
  constructor(user, resetcode) {
    this.to = user.email;
    this.username = user.name.split(" ")[0];
    this.resetcode = resetcode;
    this.from = `${process.env.myEmail}`;
  }
  newTransport() {
    // if (process.env.NODE_ENV === "production") {
    //     return 1;
    // }

    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.myEmail,
        pass: process.env.emailPassword,
      },
    });

    //  USING MAILTRAP

    // return nodemailer.createTransport({
    //   host: process.env.EMAIL_HOST,
    //   port: process.env.EMAIL_PORT,
    //   auth: {
    //     user: process.env.EMAIL_USERNAME,
    //     pass: process.env.EMAIL_PASSWORD,
    //   },
    // });
  }
  async send() {
    const mailOptions = {
      from: "Workdox app <abdulwadoodowner@gmail.com>",
      to: this.to,
      subject: "Workdox verification code",
      html: html.replace("#code#", this.resetcode),
      //   html:
    };

    await this.newTransport().sendMail(mailOptions);
  }
  async sendWelcome() {
    await this.send("Welcome", "Welcome to the starschat!");
  }
  async sendVerificationCode() {
    await this.send();
  }
};
