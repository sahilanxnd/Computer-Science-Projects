const path = require("path");
const pathToFFMPEG = require("ffmpeg-static");
const { promisify } = require("util");
const exec = promisify(require("child_process").exec);
const fs = require("fs");
const {
  isProductionServerless,
  thumbnailDir,
  thumbnailPublicPrefix,
} = require("../conf/paths");
const { PLACEHOLDER_THUMB } = require("../conf/storage");

module.exports = {
  makeThumbnail: async function (req, res, next) {
    if (!req.file) {
      req.flash("error", "File upload failed.");
      return res.redirect("/posts/postvideo");
    }

    if (isProductionServerless) {
      req.file.thumbnail = PLACEHOLDER_THUMB;
      return next();
    }

    try {
      const baseName = req.file.filename.split(".")[0];
      const outputPath = path.join(thumbnailDir, `thumbnail-${baseName}.png`);
      const inputPath = req.file.path;

      const thumbnailCommand = `"${pathToFFMPEG}" -ss 00:00:01 -i "${inputPath}" -frames:v 1 -s 200x200 "${outputPath}"`;
      await exec(thumbnailCommand);

      req.file.thumbnail = `${thumbnailPublicPrefix}/thumbnail-${baseName}.png`;
      next();
    } catch (error) {
      console.error("Thumbnail generation failed:", error.message);
      req.file.thumbnail = PLACEHOLDER_THUMB;
      next();
    }
  },
};
