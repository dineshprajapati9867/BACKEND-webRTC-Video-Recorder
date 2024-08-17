  const path = require("path");
const fs = require("fs");
const ffmpeg = require("fluent-ffmpeg");
const Video = require("../models/videoModel");
const Text = require("../models/textModel");

let uploadedFiles = [];

const mergeVideos = async (files, res) => {
  const uniqueName = `merged_video_${Date.now()}.mp4`;
  const mergedOutputPath = path.join("merged", uniqueName);

  try {
    // Clean up old merged videos
    // const filesInDirectory = fs.readdirSync("merged");
    // filesInDirectory.forEach((file) => {
    //   if (file.startsWith("merged_video_") && file.endsWith(".mp4")) {
    //     fs.unlinkSync(path.join("merged", file));
    //     console.log("Deleted old video:", file);
    //   }
    // });

    await new Promise((resolve, reject) => {
      ffmpeg()
        .input(files[0])
        .input(files[1])
        .input(files[2])
        .on("end", async () => {
          console.log("Merging completed successfully");

          try {
            const newVideo = await Video.create({
              mergedPath: uniqueName,
            });
            console.log("Merged video saved to MongoDB:", newVideo);

            // Clean up the uploaded files
            files.forEach((file) => fs.unlinkSync(file));

            res.json({
              status: "Videos merged successfully",
              file: uniqueName,
            });
            resolve();
          } catch (err) {
            console.error("Error saving merged video to MongoDB:", err);
            reject(err);
          }
        })
        .on("error", (err) => {
          console.error("Error during video merging:", err);
          reject(err);
        })
        .mergeToFile(mergedOutputPath, "merged/");
    });
  } catch (err) {
    res.status(500).send("Error merging video");
  }
};

const uploadVideo = async (req, res) => {
  const file = req.file;
     console.log(file);
     
  if (!file) return res.status(400).send("No file was uploaded.");

  const inputPath = file.path;
  uploadedFiles.push(inputPath);

  if (uploadedFiles.length === 3) {
    await mergeVideos(uploadedFiles, res);
    console.log(mergeVideos)
    // Clean up the 'uploads' folder
    const files = fs.readdirSync("uploads");
    files.forEach((file) => fs.unlinkSync(path.join("uploads", file)));

    uploadedFiles = [];
  } else {
    res.json({
      status: "Video uploaded successfully, waiting for more uploads...",
    });
  }
};
// original video
const getFinalVideo = async (req, res) => {
  try {
    const video = await Video.findOne().sort({ createdAt: -1 });

    if (video) {
      const absolutePath = path.resolve(
        __dirname,
        "../merged/",
        video.mergedPath
      );
      if (fs.existsSync(absolutePath)) {
        res.setHeader("Content-Type", "video/mp4");
        res.sendFile(absolutePath);
      } else {
        res.status(404).send("File not found");
      }
    } else {
      res.status(404).send("No merged video found");
    }
  } catch (err) {
    res.status(500).send("Error retrieving video");
  }
};

// const getFinalVideo = async (req, res) => {
//   try {
//     // Fetch all documents from the Video collection
//     const videos = await Video.find();
//     console.log(videos);

//     // Check if videos were found
//     if (videos.length > 0) {
//       res.status(200).json(videos);
//     } else {
//       res.status(404).json({ message: "No videos found" });
//     }
//   } catch (err) {
//     console.error("Error retrieving videos:", err);
//     res.status(500).send("Error retrieving videos");
//   }
// };

const giveText = async (req, res) => {
  try {
    const text = await Text.find();

    if (!text) {
      console.warn("No document found with VideoNo: 'first'");
      return res.status(404).json({ message: "No text found" });
    }

    return res.status(200).json(text);
  } catch (error) {
    console.error("Error fetching text:", error.message);
    return res.status(500).json({ message: "Server error" });
  }
};

const uploadText = async (req, res) => {
  const { videoText, videoNo } = req.body;

  try {
    await Text.create({ videoText, videoNo });
    return res.status(200).json({
      message: "Data received successfully",
    });
  } catch (error) {
    console.error("Error saving text:", error);
    return res.status(500).json({
      error: "Error saving text",
    });
  }
};

module.exports = { uploadVideo, getFinalVideo, giveText, uploadText };
