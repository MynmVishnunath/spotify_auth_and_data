async function getProfile(){
   const response = await fetch("/Profile");
   const json_response = await response.json();
   console.log(json_response);
   
   if(response.status!==200){
      window.location.replace("/");
   }else{

   console.log(json_response);
   updateProfile(json_response);
   }
}

getProfile();

function updateProfile(userData){
   const userName = document.querySelector(".user-name");
   const userMail = document.querySelector(".user-email");
   const userImag = document.querySelector(".profile-pic img");
   const userCountry = document.querySelector(".user-country");

   userName.innerHTML = userData.display_name;
   userMail.innerHTML = userData.email;
   userImag.src=userData.images[0].url;
   userCountry.innerHTML = getCountryName(userData.country);


}