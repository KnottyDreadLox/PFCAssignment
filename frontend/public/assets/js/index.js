async function submitLoginInfo() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const url = `http://localhost:3001/login?email=${email}&password=${password}`;
    const headers = {
      "Content-Type": "text/html",
      "Access-Control-Allow-Origin": "*",
    };
    const response = await axios.post(url, headers);
    if (response.data.result === "success") {
      console.log("Hello " + response.data.name);
    } else {
      console.log("Invalid credentials");
    }
  }