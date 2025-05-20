// const mailchimp = require("@mailchimp/mailchimp_transactional")(
//     process.env.MAILCHIMP_TRANSACTIONAL_API_KEY
//   );
const mailchimp = require("@mailchimp/mailchimp_marketing");
const dotenv = require("dotenv");
dotenv.config();

mailchimp.setConfig({
  apiKey: process.env.MAILCHIMP_MARKETING_API_KEY,
  server: process.env.MAILCHIMP_SERVER_PREFIX,
});

// Make sure this value is set in your .env or config securely
const LIST_ID = process.env.MAILCHIMP_LIST_ID;

const sendEmail = async ({ subject, fromName, replyTo, htmlContent }) => {
  try {
    if (!htmlContent || typeof htmlContent !== "string") {
      throw new Error("htmlContent is required and must be a string.");
    }

    // 1. Create a campaign
    const campaign = await mailchimp.campaigns.create({
      type: "regular",
      recipients: {
        list_id: LIST_ID,
      },
      settings: {
        subject_line: subject,
        from_name: fromName || "Support",
        reply_to: replyTo || "ayotundeolaiya@gmail.com",
      },
    });

    // 2. Set the content of the campaign
    await mailchimp.campaigns.setContent(campaign.id, {
      html: htmlContent,
      plain_text: htmlContent.replace(/<[^>]+>/g, ""),
    });

    // 3. Send the campaign
    const response = await mailchimp.campaigns.send(campaign.id);
    console.log("Campaign sent:", response);
  } catch (error) {
    console.error(
      "Error sending campaign via Mailchimp Marketing API:",
      error.response?.body || error.message
    );
  }
};

module.exports = {
  sendEmail,
};
