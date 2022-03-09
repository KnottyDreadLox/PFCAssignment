import Express from "express";
import cors from "cors";
import { v4 as uuid } from "uuid";
import session from "express-session";
import { CreateUser } from "./db.js";

//Session config
const config = {
  genid: (req) => uuid(),
  secret: "keyboard cat",
  cookie: {},
  resave: false,
  saveUninitialized: true,
};

const app = Express();
app.use(cors());
app.use(session(config));

const PORT = 3001;
let requests = 0;
const secretToken = uuid();

app.get("/secret", (req, res) => {
  const token = req.query.token;
  requests++;
  if (token === secretToken) {
    res.send({
      result: 200,
      requests: requests,
      message: "This is a very secret message.",
    });
  } else {
    res.send({ result: 401, message: "Invalid token!" });
  }
});

app.post("/login", (req, res) => {
  const email = req.query.email;
  const password = req.query.password;
  requests++;
  if (email == "test@test.com" && password == "123") {
    res.send({ result: "success", email: "test@test.com", name: "David" });
  } else {
    res.send({ result: "fail" });
  }
});

app.post("/register", (req, res) => {
  const email = req.query.email;
  const password = req.query.password;
  const name = req.query.name;
  const surname = req.query.surname;
  requests++;

  //Step 1: Check if that email address already exists
  //Step 2: If the email is not registered in the database we create it
  //Step 3: If the account was created successfully we inform the user

  GetUser(email).then((r) => {
    //if this email address is not taken
    if (r === null) {
      //Save the user to the database
      CreateUser(name, surname, email, password).then((r) => {
        console.log(r);
        res.send({ result: "success", email: email, name: name });
      });
    } else {
      console.log("Account already exists");
      res.send({ result: "fail", reason: "Account already exists" });
    }
  });
});

//console.log(secretToken);

app.listen(PORT, () => console.log("Server Listening on port: " + PORT));