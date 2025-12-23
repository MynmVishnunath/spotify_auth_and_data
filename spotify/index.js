console.log(" lets cook this");
const CLIENT_ID = "6383f24881b6457c8fee1f2c0a9ccb17";
const REDIRECT_URI = "http://127.0.0.1:4000/callback";
const THE_URL = "https://accounts.spotify.com/authorize?";


 async function getTocken(){
   const response = await fetch("/tockenPass");
   const response_json = await response.json();
   if(response.status === 404){
     console.error(response_json.Error);
     return;

   }
   const {access_token, refresh_token} = response_json;
   console.log(response_json);
 }
 
 //getTocken();

const login = async ()=>{
  window.location.replace("/Login")
 
  localStorage.setItem("tocken",JSON.stringify(response));
  console.log(response);
}