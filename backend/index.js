import Express from "express";
import cors from "cors";
import https from "https";
import { fileURLToPath } from "url";
import path, { dirname } from "path";
import { SecretManagerServiceClient } from "@google-cloud/secret-manager";

const PORT = 80;
const SECRET_MANAGER_CERT =
  "projects/3469417017/secrets/PublicKey/versions/latest";
const SECRET_MANAGER_PK =
  "projects/3469417017/secrets/PrivateKey/versions/latest";

const SECRET_MANAGER_GET_OUT_PDF =
  "projects/3469417017/secrets/GetOutPDF/versions/latest";

const sm = new SecretManagerServiceClient({
  projectId: "programingforthecloud",
  keyFilename: "./key.json",
});

const startServerEncrypted = async () => {
  const [pub] = await sm.accessSecretVersion({
    name: SECRET_MANAGER_CERT,
  });

  const [prvt] = await sm.accessSecretVersion({
    name: SECRET_MANAGER_PK,
  });

  const sslOptions = {
    key: prvt.payload.data.toString(),
    cert: pub.payload.data.toString(),
  };

  https.createServer(sslOptions, app).listen(PORT, () => {
    console.log("Secure Server Listening on port:" + PORT);
  });
};

const startServer = () => {
  app.listen(PORT, () => console.log("Server Listening on port: " + PORT));
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = Express();
//enabled http -> https redirection
//app.enable("trust proxy");

//serve static files
app.use(Express.static(path.join(__dirname, "../frontend/public")));

//allow cross-origin reqs
app.use(cors());

//redirect to https
//app.use((req, res, next) => {
//  req.secure ? next() : res.redirect("https://" + req.headers.host + req.url);
//});


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

startServer();

//startServerEncrypted();


app.listen(PORT, () => console.log("Server Listening on port: " + PORT));