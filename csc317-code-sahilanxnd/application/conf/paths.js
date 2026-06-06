const path = require("path");
const fs = require("fs");

// True only in deployed Netlify Functions (not during `netlify dev`).
const isProductionServerless = Boolean(
  process.env.AWS_LAMBDA_FUNCTION_NAME && !process.env.NETLIFY_DEV
);

const appRoot = path.join(__dirname, "..");

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

const videoDir = isProductionServerless
  ? path.join("/tmp", "videos")
  : path.join(appRoot, "public", "videos");

const thumbnailDir = isProductionServerless
  ? path.join("/tmp", "images", "uploads")
  : path.join(appRoot, "public", "images", "uploads");

ensureDir(videoDir);
ensureDir(thumbnailDir);

module.exports = {
  isProductionServerless,
  appRoot,
  videoDir,
  thumbnailDir,
  videoPublicPrefix: "videos",
  thumbnailPublicPrefix: "images/uploads",
};
