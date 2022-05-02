let signInButton = document.getElementById("signIn");
let signOutButton = document.getElementById("signOut");
let profile = document.getElementById("profile");
let signInContainer = document.getElementById("signInContainer");
let loginBox = document.getElementById("LoginBox");
let payBox = document.getElementById("PayBox");
let creditTxt = document.getElementById("creditTxt");

const authenticateReq = async (token) => {
  const url = `/auth?token=${token}`;
  const headers = {
    "Content-Type": "text/html",
    "Access-Control-Allow-Origin": "*",
  };
  const response = await axios.post(url, headers);
  const status = response.data.status;

  if (status == 200) {
    const name = response.data.name;
    const email = response.data.email;
    const picture = response.data.picture;
    const expiry = response.data.expiry;

    const credits = response.data.credits;

    const JsonData = response.data.JsonData;

    profile.style.display = "inline";
    signInContainer.style.display = "none";
    loginBox.style.display = "none";
    payBox.style.display = "block";
    creditTxt.style.display = "inline";

    document.getElementById("navbarDropdownMenuLink").innerHTML =
      `<img
    id="picture"
    src=""
    class="rounded-circle"
    style="margin-right: 5px"
    height="25"
    alt=""
    loading="lazy"
    />` + name;
    
    //Add URL links to USER account details

    var stringify = JSON.parse(JsonData);
    for (var i = 0; i < stringify.length; i++) {
        console.log(stringify[i]['link']);
    }
    
    stringify.forEach(element => {
      document.getElementById("userDownloads").innerHTML +=
      `<div style="background-color: cornflowerblue; padding:10px; margin:5px">` +
      `<p>NAME</p>` + JSON.stringify(element['filename']) +
      `<p>URL</p>` + JSON.stringify(element['link']) +
      `</div>` ;          
    });

    console.log("Json: " + stringify);



    document.getElementById("picture").src = picture;
    let date = new Date();
    date.setTime(date.getTime() + expiry);
    document.cookie = `token=${token};expires=${date.toUTCString()}`;
    console.log(`${name} signed in successfully.`);
    creditTxt.textContent = "You have " + credits + " credits."
  } else {
    //if not logged in
    profile.style.display = "none";
    signInContainer.style.display = "inline";
    payBox.style.display = "none";
    creditTxt.style.display = "none";
  }
};


async function loadGoogleLogin() {
  let session = document.cookie;
  if (session && session.includes("token")) {
    authenticateReq(session.split("token=")[1].split(";")[0]);
  } else {
    profile.style.display = "none";
    signInContainer.style.display = "inline";
  }

  const signOut = () => {
    let auth2 = gapi.auth2.getAuthInstance();
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    auth2
      .signOut()
      .then(() => {
        profile.style.display = "none";
        signInContainer.style.display = "inline";
        console.log("User signed out.");
      })
      .catch((error) => alert(error));
  };

  signOutButton.addEventListener("click", () => signOut());

  gapi.load("auth2", () => {
    // Retrieve the singleton for the GoogleAuth library and set up the client.
    let auth2 = gapi.auth2.init({
      client_id: "3469417017-0mg8nskci0c801kvb62kg0q7q1ghesn9.apps.googleusercontent.com",
      cookiepolicy: "single_host_origin",
      scope: "profile",
    });

    auth2.attachClickHandler(
      signInButton,
      {},
      function (googleUser) {
        authenticateReq(googleUser.getAuthResponse().id_token);
      },
      function (error) {
        alert(
          "Error: " + JSON.parse(JSON.stringify(error, undefined, 2)).error
        );
      }
    );
  });

}