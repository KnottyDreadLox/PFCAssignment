import Express from "express";
import multer from "multer";
import { fileURLToPath } from "url";
import path, { dirname } from "path";

import { Storage } from '@google-cloud/storage';


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const upload = Express.Router();

//export GOOGLE_APPLICATION_CREDENTIALS="/home/user/Downloads/service-account-file.json"

let imageUpload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, path.join(__dirname, "../uploads/"));
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname);
    },
  }),
  fileFilter: function (req, file, callback) {
    var ext = path.extname(file.originalname);
    if (ext !== ".png" && ext !== ".PNG" && ext !== ".jpg" && ext !== ".JPG" && ext !== ".gif" && ext !== ".GIF" && ext !== ".jpeg" && ext !== ".JPEG") {
      return callback(new Error("Only images are allowed"));
    }
    callback(null, true);
  },
  limits: {
    fileSize: 2621441,
  },
});

upload.route("/").post(imageUpload.single("image"), (req, res) => {
  if (req.file) {
    console.log("File downloaded at: " + req.file.path); 

    // The ID of your GCS bucket
    const bucketName = 'programingforthecloud.appspot.com';

    // The path to your file to upload
    const filePath = req.file.path;

    // The new ID for your GCS file
    const destFileName = 'uploads';

    // Imports the Google Cloud client library
    //const {Storage} = require('@google-cloud/storage');

    // Creates a client
    const storage = new Storage();

    async function uploadFile() {
      await storage.bucket(bucketName).upload(filePath, {
        destination: destFileName,
      });

      console.log(`${filePath} uploaded to ${bucketName}`);
    }

    uploadFile().catch(console.error);



    //Convert to base64
    //Send to PDF Conversion API

    res.send({
      status: "200",
      message: "File uploaded successfully! Processing..",
    });
  }
});

export default upload;
