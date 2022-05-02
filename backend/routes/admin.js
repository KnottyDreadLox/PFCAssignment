import Express from "express";

import { fileURLToPath } from "url";
import path, { dirname } from "path";

import { validateToken } from "./auth.js";

import {
    GetDocument,
} from "../db.js";

import Redis from "redis";


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const admin = Express.Router();

export let rclient = new Redis.createClient();

rclient.on("connect", () => {
  console.log("Redis Connected");
  getCredits().then((data)=> console.log("REDIS: " + JSON.parse(data)));
});

const getCredits = async() => {
  return rclient.get("credits"); 
}

const setCredits = async (payload) => {
  return await rclient.set("credits", JSON.stringify(payload));
}

admin.route("/").get((req, res) =>{

    
    const token = req.cookies['token'];


        //Before we send the page to the user, we verify that the token is valid
        validateToken(token)
        .then((ticket) => {
          if (ticket.getPayload().name != null) {
              const payload = ticket.getPayload();
              console.log(payload);

              GetDocument("userData", "email", payload.email).then((r) =>{
                  if(r[0]['type'] == "user")
                  {
                    res.sendFile(path.join(__dirname, "../../frontend/index.html"));
                    console.log("IS USER");
                  }
                  else if (r[0]['type'] == "admin")
                  {
                    res.sendFile(path.join(__dirname, "../../frontend/admin.html"));
                    console.log("IS ADMIN")
                  }
                  else
                  {
                    res.sendFile(path.join(__dirname, "../../frontend/index.html"));
                    console.log("UNDEFINED")
                  }

              });

              
          } else {
            res.redirect("/");
          }
        })
        .catch((error) => {
          console.log("Token expired");
          res.redirect("/");
        });

});

export default admin;
