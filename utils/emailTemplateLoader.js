// utils/emailTemplateLoader.js
const fs = require("fs");
const path = require("path");

/**
 * Load an HTML email template and replace placeholders like {{FNAME}}
 * @param {string} templateName - File name without extension
 * @param {Object} variables - Key-value map of variables
 * @returns {string} The processed HTML string
 */
const loadTemplate = (templateName, variables = {}) => {
  const filePath = path.join(
    __dirname,
    "..",
    "emails",
    "templates",
    `${templateName}.html`
  );
  let template = fs.readFileSync(filePath, "utf-8");

  // Replace {{VAR_NAME}} with actual content
  Object.keys(variables).forEach((key) => {
    const regex = new RegExp(`{{${key}}}`, "g");
    template = template.replace(regex, variables[key]);
  });

  return template;
};

module.exports = { loadTemplate };
