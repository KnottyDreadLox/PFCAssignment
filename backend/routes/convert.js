import Express from "express";
import { fileURLToPath } from "url";
import path, { dirname } from "path";

import { validateToken } from "./auth.js";

import {
    GetDocument,
} from "../db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const convert = Express.Router();

export default convert;

convert.route("/").get((req, res) =>{

    const token = req.cookies['token'];

    //Before we send the page to the user, we verify that the token is valid
    validateToken(token)
      .then((ticket) => {
        if (ticket.getPayload().name != null) {
            const payload = ticket.getPayload();
            console.log(payload);

            // GetDocument("userData", "email", payload.email).then((r) =>{
            //     r.forEach(element => {
            //         res.send({
            //             status: "200",
            //             credits: element.credits,
            //         });
            //       }); 
            // }); 
            
            res.sendFile(path.join(__dirname, "../../frontend/convert.html"));
        } else {
          res.redirect("/");
        }
      })
      .catch((error) => {
        console.log("Token expired");
        res.redirect("/");
      });

      
});

