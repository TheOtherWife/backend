// services/emailService.js
const mailchimp = require("@mailchimp/mailchimp_transactional")(
  process.env.MAILCHIMP_TRANSACTIONAL_API_KEY
);
const { loadTemplate } = require("../utils/emailTemplateLoader");

const sendEmail = async ({ to, subject, templateName, variables }) => {
  try {
    const htmlContent = loadTemplate(templateName, variables);

    await mailchimp.messages.send({
      message: {
        from_email: "support@yourdomain.com",
        subject,
        to: [{ email: to, type: "to" }],
        html: htmlContent,
      },
    });
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

module.exports = {
  sendEmail,
};
