import Express from "express";
import cors from "cors";
import { v4 as uuid } from "uuid";
import session from "express-session";
import { CreateUser, GetUser, HashPassword, GOOGLE_APPLICATION_CREDENTIALS } from "./db.js";

import { fileURLToPath } from "url";
import path, { dirname } from "path";

import https from "https";

import { SecretManagerServiceClient } from "@google-cloud/secret-manager";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

//Session config
const config = {
  genid: (req) => uuid(),
  secret: "keyboard cat",
  cookie: {},
  resave: false,
  saveUninitialized: true,
};

const app = Express();
app.use(Express.static(path.join(__dirname, "../frontend/public")));

app.use(cors());
app.use(session(config));


const PORT = 80;
let requests = 0;
const secretToken = uuid();

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

app.get("/account", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/account.html"));
});

app.get("/convert", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/convert.html"));
});

app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/admin.html"));
});

app.post("/adminlogin", (req, res) => {
  const email = req.query.email;
  const password = req.query.password;
  requests++;
  if (email == "test@test.com" && password == "123") {
    res.send({ result: "success", email: "test@test.com", name: "David" });
  } else {
    res.send({ result: "fail" });
  }
});



//console.log(secretToken);

app.listen(PORT, () => console.log("Server Listening on port: " + PORT));