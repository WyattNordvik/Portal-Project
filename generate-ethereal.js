// generate-ethereal.js
const nodemailer = require("nodemailer");

(async () => {
  try {
    // Create a new Ethereal test account
    const testAccount = await nodemailer.createTestAccount();

    console.log("=== Ethereal SMTP Credentials ===");
    console.log(`SMTP Host:     ${testAccount.smtp.host}`);
    console.log(`SMTP Port:     ${testAccount.smtp.port}`);
    console.log(`SMTP Secure:   ${testAccount.smtp.secure}`);
    console.log(`Username:      ${testAccount.user}`);
    console.log(`Password:      ${testAccount.pass}`);
    console.log("\nPaste those into your .env.local like so:\n");
    console.log(`SMTP_HOST=${testAccount.smtp.host}`);
    console.log(`SMTP_PORT=${testAccount.smtp.port}`);
    console.log(`SMTP_SECURE=${testAccount.smtp.secure}`);
    console.log(`SMTP_USER=${testAccount.user}`);
    console.log(`SMTP_PASS=${testAccount.pass}`);
    console.log(`EMAIL_FROM="Your App <no-reply@example.com>"\n`);
  } catch (err) {
    console.error("Failed to create Ethereal account:", err);
    process.exit(1);
  }
})();

