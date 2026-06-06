const path = require("path");
const fs = require("fs");

const isLocalDev = Boolean(
  process.env.NETLIFY_DEV || process.env.VERCEL_ENV === "development"
);

// Deployed serverless (Vercel or Netlify), not local npm start / vercel dev.
const isProductionServerless = Boolean(
  !isLocalDev &&
    (process.env.VERCEL === "1" ||
      process.env.NETLIFY === "true" ||
      process.env.AWS_LAMBDA_FUNCTION_NAME)
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
