import { v2 as cloudinary } from "cloudinary";

export function configureCloudinary() {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

export function uploadImageBuffer(
  buffer: Buffer,
  options?: Record<string, unknown>,
) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      (options as any) || { resource_type: "image" },
      (err, result) => {
        if (err) return reject(err);
        return resolve(result);
      },
    );

    stream.end(buffer);
  });
}

export { cloudinary };
