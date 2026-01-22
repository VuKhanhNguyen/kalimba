var cloudinary = require("cloudinary").v2;

function configureCloudinary() {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

function uploadImageBuffer(buffer, options) {
  return new Promise(function (resolve, reject) {
    var stream = cloudinary.uploader.upload_stream(
      options || { resource_type: "image" },
      function (err, result) {
        if (err) return reject(err);
        return resolve(result);
      },
    );

    stream.end(buffer);
  });
}

module.exports = {
  cloudinary: cloudinary,
  configureCloudinary: configureCloudinary,
  uploadImageBuffer: uploadImageBuffer,
};
