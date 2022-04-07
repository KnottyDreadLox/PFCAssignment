import Express from "express";
import multer from "multer";
import { fileURLToPath } from "url";
import path, { dirname } from "path";

import { SecretManagerServiceClient } from "@google-cloud/secret-manager";
import { Storage } from '@google-cloud/storage';
import axios from 'axios';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const upload = Express.Router();

//export GOOGLE_APPLICATION_CREDENTIALS="/home/user/Downloads/service-account-file.json"


const sm = new SecretManagerServiceClient({
  projectId: "programingforthecloud",
  keyFilename: "../key.json",
});


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
    if (ext !== ".png" && ext !== ".PNG") {
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

    // --------------------- Send to Google Cloud ---------------------

    // The ID of your GCS bucket
    const bucketName = 'programingforthecloud.appspot.com';

    // The path to your file to upload
    const filePath = req.file.path;

    // The new ID for your GCS file
    const destFileName = 'uploads/uploadedFile';

    // Creates a client

    const storage = new Storage({
      projectId: "programingforthecloud",
      keyFilename: "./key.json",
    });

    async function uploadFile() {
      await storage.bucket(bucketName).upload(filePath, {
        destination: destFileName,
      });

      console.log(`${filePath} uploaded to ${bucketName}`);
    }

    uploadFile().catch(console.error);

    //--------------------- Convert to base64 ---------------------

    const encoded = Buffer.from(req.file.path).toString('base64')
    console.log(encoded)

    //--------------------- Send to PDF Conversion API ---------------------

    //const axios = require("axios");

    const BASE_URL = `https://getoutpdf.com/api/convert/image-to-pdf`

    const SECRET_MANAGER_GET_OUT_PDF = "projects/3469417017/secrets/GetOutPDF/versions/latest";

    const convertedData = axios({
      method: 'post',
      url: BASE_URL,
      headers: {
        api_key: SECRET_MANAGER_GET_OUT_PDF,
        image: encoded
      }
    }).then(res => res.data).catch(err => console.error(err));

    console.log(convertedData);
    

    //--------------------- Error ---------------------

    res.send({
      status: "200",
      message: "File uploaded successfully! Processing..",
    });
  }
});

export default upload;
