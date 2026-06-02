const pathToFFMPEG = require("ffmpeg-static");
const { promisify } = require("util");
const exec = promisify(require("child_process").exec);
const fs = require("fs");

module.exports = {
  makeThumbnail: async function (req, res, next) {
    if (!req.file) {
      req.flash("error", "File upload failed.");
      return res.redirect("/posts/postvideo");
    }

    try {
      const baseName = req.file.filename.split(".")[0];
      const outputPath = `public/images/uploads/thumbnail-${baseName}.png`;

      fs.mkdirSync("public/images/uploads", { recursive: true });
      // Generate a thumbnail from the uploaded video
      const thumbnailCommand = `"${pathToFFMPEG}" -ss 00:00:01 -i "${req.file.path}" -frames:v 1 -s 200x200 "${outputPath}"`;


      await exec(thumbnailCommand);

      req.file.thumbnail = `images/uploads/thumbnail-${baseName}.png`;
      next();
    } catch (error) {
      console.error("Thumbnail generation failed:", error.message);
      req.file.thumbnail = "images/uploads/placeholder-thumbnail.png";
      next();
    }
  }
};
