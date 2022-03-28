import Firestore from "@google-cloud/firestore";
import { createHmac } from "crypto";

//Google Cloud key
export const GOOGLE_APPLICATION_CREDENTIALS = "./key.json";

//Instantiating Firestore with project details
const db = new Firestore({
  projectId: "pfcassignment-343614",
  keyFilename: GOOGLE_APPLICATION_CREDENTIALS,
});

//Collection (Table)
//Document (Row)
//docRef selects the collection

export async function AddNewUser(email) {
  const docRef = db.collection("userData").doc();
  return await docRef.set({
    credits: 10,
    email: email,
    type: "user",
  });
}

export async function GetUser(email) {
  const docRef = db.collection("userData");
  const snapshot = await docRef.where("email", "==", email).get();
  let data = [];
  snapshot.forEach((doc) => {
    data.push(doc.data());
  });
  return data;
}

export function HashPassword(password) {
  const secret = "PFCA$$S!GNM3NT";
  return createHmac("sha256", password).update(secret).digest("hex");
}

export async function AddDocument(collection, data) {
  const docRef = db.collection(collection).doc();
  return await docRef.set(data);
}

export async function GetDocument(collection, valueType, value) {
  const docRef = db.collection(collection);
  const snapshot = await docRef.where(valueType, "==", value).get();
  let data = [];
  snapshot.forEach((doc) => {
    data.push(doc.data());
  });
  return data;
}