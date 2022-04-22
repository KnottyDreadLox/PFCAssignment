import Express from "express";
import { OAuth2Client } from "google-auth-library";

import {
  GetDocument,
  AddNewUser
} from "../db.js";

const CLIENT_ID =
  "3469417017-0mg8nskci0c801kvb62kg0q7q1ghesn9.apps.googleusercontent.com";
const auth = Express.Router();
const client = new OAuth2Client(CLIENT_ID);

export default auth;

auth.route("/").post((req, res) => {
  const token = req.query.token;
  client
    .verifyIdToken({
      idToken: token,
      audience: CLIENT_ID,
    })
    .catch((error) => {
      console.log(error);
      res.send({ status: "401" });
    })
    .then((ticket) => {
      if (ticket) 
      {
        const payload = ticket.getPayload();

        //Get information about logged in user
        //send all information to frontend
        GetDocument("userData", "email", payload.email).then((r) =>{

          //If email of user doesnt exist in database, create it
          if(r.length == 0)
          {
            AddNewUser(payload.email);
            
            GetDocument("userData", "email", payload.email).then((r) =>{
              r.forEach(element => {
                res.send({
                  status: "200",
                  name: payload.name,
                  email: payload.email,
                  picture: payload.picture,
                  token: token,
                  expiry: payload.exp,
                  credits: element.credits,
                });
              });
            }).catch(e => console.log(e));
          }else{
            r.forEach(element => {
              res.send({
                status: "200",
                name: payload.name,
                email: payload.email,
                picture: payload.picture,
                token: token,
                expiry: payload.exp,
                credits: element.credits,
              });
            });    
        }    
        console.log(`${payload.name} has logged in.`);
      }); 
    }
    else {
        res.send({ status: "401" });
      }
    });
});


export const validateToken = async (token) => {
  return await client.verifyIdToken({
    idToken: token,
    audience: CLIENT_ID,
  });
};