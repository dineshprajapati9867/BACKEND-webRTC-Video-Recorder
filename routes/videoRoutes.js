const express = require("express");
const { uploadVideo, getFinalVideo,giveText,uploadText } = require("../controllers/videoController");
const multer = require("multer");

const router = express.Router();
const upload = multer({ dest: "uploads/" });


router.post("/upload-videos", upload.single("videos"), uploadVideo);
router.get("/final-video", getFinalVideo);

router.get("/give-text",giveText)
router.post("/upload-text",uploadText)
module.exports = router;
