let spinningThing = document.getElementById("loader");
let downloadButton = document.getElementById("downloadBtn");
let creditText = document.getElementById("creditText");

const authenticateReq = async (token) => {
    const url = `/auth?token=${token}`;
    const headers = {
      "Content-Type": "text/html",
      "Access-Control-Allow-Origin": "*",
    };
    const response = await axios.post(url, headers);
    const status = response.data.status;
  
    if (status == 200) {
        //logged in 
        const name = response.data.name;
        const expiry = response.data.expiry;

        const credits = response.data.credits;
        let date = new Date();
        date.setTime(date.getTime() + expiry);
        document.cookie = `token=${token};expires=${date.toUTCString()}`;
        console.log(`${name} signed in successfully.`);
        creditText.textContent = "Conversions cost 1 credit per. You have " + credits + " credits."
    } else {
        creditText.textContent = "Conversions cost 1 credit per. You have no credits."
        //if not logged in
    }
  };