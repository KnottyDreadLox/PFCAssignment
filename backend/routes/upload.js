import Express from "express";
import multer from "multer";
import { fileURLToPath } from "url";
import path, { dirname } from "path";

import { SecretManagerServiceClient } from "@google-cloud/secret-manager";
import { Storage } from '@google-cloud/storage';
import axios from 'axios';
import fs from 'fs';
import { Console } from "console";

import {
  SaveFileToUser,
} from "../db.js";

import { validateToken } from "./auth.js";


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

    const bucketName = 'programingforthecloud.appspot.com';
    const filePath = req.file.path;
    const uploadFileName = 'uploads/uploaded_' + req.file.filename;
    const convertedFileName = 'completed/converted_' + req.file.filename.replace('.png', '.pdf');

    const storage = new Storage({
      projectId: "programingforthecloud",
      keyFilename: "./key.json",
    });

    async function uploadFile() {
      await storage.bucket(bucketName).upload(filePath, {
        destination: uploadFileName,
      });

      console.log(`${filePath} uploaded to ${bucketName}`);
    }

    uploadFile().catch(console.error);

    //--------------------- Convert to base64 ---------------------

    const base64 = fs.readFileSync(req.file.path, "base64");

    //--------------------- Send to PDF Conversion API ---------------------


    const BASE_URL = `https://getoutpdf.com/api/convert/image-to-pdf`

    const SECRET_MANAGER_GET_OUT_PDF = "projects/3469417017/secrets/GetOutPDF/versions/latest";

    const convertedData = axios({
      method: 'POST',
      url: BASE_URL,
      data: {
        api_key: "bbc48d858053d012377e073d47e1193b54cbc7335341ab95a28de8558651b69f",
        image: base64
      }
    }).then(res => {


      const pdfBase = res.data.pdf_base64
      
      //needs fixing
      const convertedBuffer = Buffer.from(pdfBase, 'base64').toString('utf8'); 
    

      async function uploadFromMemory() {
        await storage.bucket(bucketName).file(convertedFileName).save(convertedBuffer);

        //const fileUrl = storage.bucket(bucketName).file(convertedFileName)
        
        const fileUrl = "https://storage.cloud.google.com/" + bucketName + "/" + convertedFileName;
        console.log(fileUrl);

        const token = req.cookies['token'];

        //Before we send the page to the user, we verify that the token is valid
        validateToken(token)
        .then((ticket) => {
          if (ticket.getPayload().name != null) {
              const payload = ticket.getPayload();
              console.log(payload.email);           
              
              SaveFileToUser(req.file.filename, fileUrl, req.file.filename.replace('.png', '.pdf') ,  payload.email)      

          } else {
            res.redirect("/");
          }
        })
        .catch((error) => {
          console.log("Token expired");
          res.redirect("/");
        });

        // console.log(
        //   `${convertedFileName} with contents ${convertedBuffer} uploaded to ${bucketName}.`
        // );
      }
      
      uploadFromMemory().catch(console.error);

    }).catch(err => console.error(err));
    
    res.send({
      status: "200",
      message: "File uploaded successfully! Processing..",
    });
  }
});

export default upload;

