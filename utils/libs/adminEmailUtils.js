// utils/libs/adminEmailUtils.js
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  // host: 'smtp.namecheap.com', // Your SMTP server hostname
  //   port: 587, // SMTP port
  //   secure: false, // true for 465, false for other ports
  //   auth: {
  //       user: process.env.USER, // Your email address
  //       pass: process.env.PASS, // Your email password
  //   }

  service: "gmail",
  auth: {
    user: process.env.USER,
    pass: process.env.PASS,
  },
});

const AdullamLogo =
  "https://res.cloudinary.com/dn4gfzlhq/image/upload/v1708184019/Adullam_logo_nwivli.png";

// AAdmin

/**
 * Sends a welcome email to a new user.
 * @param {string} recipientEmail The recipient's email address.
 * @param {string} recipientName The recipient's name.
 * @returns {Promise} A promise that resolves when the email is successfully sent.
 */

export const sendAdminWelcomeEmail = async (email, firstName) => {
  const mailOptions = {
    from: process.env.USER,
    to: email,
    subject: "Welcome to Adullam Fashion and Lifestyle Ltd!",
    html: `
          <div style="background-color: #f2f2f2; padding: 20px; color: #333; border-radius: 10px; font-family: Arial, sans-serif; display: flex; flex-direction: column;">
              
              <div style="text-align: center; width: 100%">
                  <p style="font-size: 18px; margin-bottom: 10px; text-align: left;">Hi, ${firstName}!</p>
                  <p style="font-size: 16px;">We're thrilled to have you join us at Adullam! Thank you for registering and becoming a part of our brand, aimed at spreading the gospel through faith-inspired fashion.</p>
                  <p style="font-size: 16px;">Your registration is complete, and you are now all set to explore our latest collections, exclusive offers, and be the first to know about upcoming deals. Feel free to reply to this mail if you have any questions or comments.</p>
                  <p style="font-size: 16px;">We look forward to sharing this journey with you and hope our merchs will enable you to openly declare your identity in Christ with elegance.</p>
                  <br>
                  <p style="font-size: 16px; font-weight: bold;">Kind regards,</p>
                  <p style="font-size: 16px; font-weight: bold;">Admin from Adullam.</p>
              </div>
      </div>
      `,
  };

  return transporter.sendMail(mailOptions);
};

export const sendAdminPasswordResetOTP = async (email, otp, adminName) => {
  const mailOptions = {
    from: process.env.USER,
    to: email,
    subject: "Password Reset Code for Your Admin Account",
    html: `
          <div style="background-color: #f2f2f2; padding: 20px; color: #333; border-radius: 10px; font-family: Arial, sans-serif; align-items: center;">
              <div style="text-align: center;">
            <p style="font-size: 18px; margin-bottom: 10px; text-align: left;">Dear ${adminName} </p>
            <p style="font-size: 16px;">We have initiated the password reset process for your Admin account. Your One-Time Password (OTP) is <strong>${otp}</strong> which we will use to facilitate the password recovery procedure.</p>
            <p style="font-size: 16px;">Kindly use the OTP code provided to securely reset your password and regain access to your account. If you encounter any difficulties or require further assistance, please do not hesitate to contact us.</p>
            <p style="font-size: 16px;">If you didn't request this, you can safely ignore this email.</p>
            <p style="font-size: 16px;">Thank you for your attention to this issue.</p>
            <br>
            <p style="font-size: 16px; font-weight: bold;">Best regards,</p>
            <p style="font-size: 16px; font-weight: bold;">Adullam</p>
          </div>
        </div>`,
  };

  return transporter.sendMail(mailOptions);
};

export const sendAdminPasswordChangeConfirmationEmail = async (
  email,
  adminName
) => {
  const mailOptions = {
    from: process.env.USER,
    to: email,
    subject: "Your Password Has Been Successfully Changed!",
    html: `
            <div style="background-color: #f2f2f2; padding: 20px; color: #333; border-radius: 10px; font-family: Arial, sans-serif;">
              <div style="text-align: center;">
                <p style="font-size: 18px; margin-bottom: 10px; text-align: left;">Hey there, ${adminName}</p>
                <p style="font-size: 16px;">Great news! Your password has been successfully updated for your Admin account. You're all set with a new and secure password to continue managing the system.</p>
                <p style="font-size: 16px;">If you have any more questions or need further assistance, feel free to reach out. We're here to help you every step of the way!</p>
                <br>
                <p style="font-size: 16px; font-weight: bold;">Keep shining,</p>
                <p style="font-size: 16px; font-weight: bold;">Adullam.</p>
              </div>
            </div>`,
  };

  return transporter.sendMail(mailOptions);
};

export const sendPromotionalEmail = async (email, firstName, subject, text) => {
  const formattedText = text.replace(/\n/g, "<br>");

  const mailOptions = {
    from: process.env.USER,
    to: email,
    subject: subject,
    html: `
            <div style="background-color: #f2f2f2; padding: 20px; color: #333; border-radius: 10px; font-family: Arial, sans-serif;">
              <div style="text-align: center;">
              <p style="font-size: 18px; margin-bottom: 10px; text-align: left;">Hey, ${firstName}</p>
                <p style="font-size: 18px; margin-bottom: 10px;">${formattedText}</p> 
                <br>
                <p style="font-size: 16px;">Best regards,</p>
                <p style="font-size: 16px;">The Adullam Team</p>
              </div>
            </div>`,
  };

  return transporter.sendMail(mailOptions);
};
