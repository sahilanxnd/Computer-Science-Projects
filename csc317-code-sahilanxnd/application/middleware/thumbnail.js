const path = require("path");
const pathToFFMPEG = require("ffmpeg-static");
const { promisify } = require("util");
const exec = promisify(require("child_process").exec);
const fs = require("fs");
const { isProductionServerless, thumbnailDir, thumbnailPublicPrefix } = require("../conf/paths");

module.exports = {
  makeThumbnail: async function (req, res, next) {
    if (!req.file) {
      req.flash("error", "File upload failed.");
      return res.redirect("/posts/postvideo");
    }

    if (isProductionServerless) {
      return next();
    }

    try {
      const baseName = req.file.filename.split(".")[0];
      const outputPath = path.join(thumbnailDir, `thumbnail-${baseName}.png`);
      // Generate a thumbnail from the uploaded video
      const thumbnailCommand = `"${pathToFFMPEG}" -ss 00:00:01 -i "${req.file.path}" -frames:v 1 -s 200x200 "${outputPath}"`;


      await exec(thumbnailCommand);

      req.file.thumbnail = `${thumbnailPublicPrefix}/thumbnail-${baseName}.png`;
      next();
    } catch (error) {
      console.error("Thumbnail generation failed:", error.message);
      req.file.thumbnail = `${thumbnailPublicPrefix}/placeholder-thumbnail.png`;
      next();
    }
  }
};
