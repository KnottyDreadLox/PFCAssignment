const Firestore = require("@google-cloud/firestore");

const db = new Firestore({
    projectId: "programingforthecloud",
    keyFilename: GOOGLE_APPLICATION_CREDENTIALS,
  });
  

const AddDocument = async (collection, data) => {
    const docRef = db.collection(collection).doc();
    return await docRef.set(data);
  }
  

exports.helloPubSub =(event, context) =>{

    const data = Buffer.from(event.data, "base64").toString();
    const jsonData = JSON.parse(data);

    AddDocument("conversions", {
        email: jsonData.email,
        filename: jsonData.filename,
        link: jsonData.url,
        completed: "",
    });
    
}
