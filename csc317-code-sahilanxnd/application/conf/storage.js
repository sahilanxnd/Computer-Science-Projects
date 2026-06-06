const path = require("path");
const fs = require("fs");
const {
  isProductionServerless,
  thumbnailPublicPrefix,
} = require("./paths");

const PLACEHOLDER_THUMB = `${thumbnailPublicPrefix}/placeholder-thumbnail.png`;

async function persistVideo(file) {
  if (!file) {
    throw new Error("No video file received.");
  }

  if (!isProductionServerless) {
    return file.filename;
  }

  if (!file.buffer) {
    throw new Error("Video buffer missing for serverless upload.");
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error(
      "BLOB_READ_WRITE_TOKEN is missing. In Vercel, go to Storage → Create Blob store and link it to this project."
    );
  }

  const { put } = require("@vercel/blob");
  const ext = path.extname(file.originalname) || ".mp4";
  const key = `videos/${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;

  const blob = await put(key, file.buffer, {
    access: "public",
    contentType: file.mimetype || "video/mp4",
    token: process.env.BLOB_READ_WRITE_TOKEN,
  });

  return blob.url;
}

async function persistThumbnail(thumbnailPath) {
  if (!isProductionServerless) {
    return thumbnailPath;
  }

  if (!thumbnailPath || thumbnailPath === PLACEHOLDER_THUMB) {
    return PLACEHOLDER_THUMB;
  }

  const absolutePath = path.join(__dirname, "..", "public", thumbnailPath);
  if (!fs.existsSync(absolutePath)) {
    return PLACEHOLDER_THUMB;
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return PLACEHOLDER_THUMB;
  }

  const { put } = require("@vercel/blob");
  const buffer = fs.readFileSync(absolutePath);
  const key = `thumbnails/${path.basename(thumbnailPath)}`;

  const blob = await put(key, buffer, {
    access: "public",
    contentType: "image/png",
    token: process.env.BLOB_READ_WRITE_TOKEN,
  });

  return blob.url;
}

module.exports = {
  PLACEHOLDER_THUMB,
  persistVideo,
  persistThumbnail,
};
