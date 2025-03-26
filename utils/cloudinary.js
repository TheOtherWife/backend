// utils/cloudinary.js
const { v2: cloudinary1 } = require("cloudinary");

const configureCloudinary = (cloud_name, api_key, api_secret) => {
  cloudinary1.config({
    cloud_name: cloud_name,
    api_key: api_key,
    api_secret: api_secret,
  });
};

// Cloudinary upload function
const cloudinaryUpload = (file) => {
  return new Promise((resolve, reject) => {
    cloudinary1.uploader.upload(file.path, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result); // This will return the Cloudinary URL and other data
      }
    });
  });
};

module.exports = { configureCloudinary, cloudinaryUpload };
