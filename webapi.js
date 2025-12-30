require("dotenv").config();
const express = require('express');
const session = require("express-session");
const { Request } = require("node-fetch");

const app = express();
app.use(session({
  secret: "83hbaam2night8shifthoxygonp&*657",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    httpOnly: true,
  }
}))


const CLIENT_ID = process.env.CLIENT_ID;
const REDIRECT_URI = process.env.REDIRECT_URI;
const REDIRECT_URI2 = process.env.REDIRECT_URI2;
const client_secret = process.env.client_secret;
const AUTH_URL = "https://accounts.spotify.com/authorize?";



//Tockens
app.use(express.static(__dirname + '/spotify'));


app.get("/", (req, res) => {
  
  if(!req.session.spot_response){
  res.sendFile("./spotify/index.html", { root: __dirname });
}else{
  res.redirect("/home");
}
})

app.get("/Login", async (req, res) => {
  const params = {
    response_type: 'code',
    client_id: CLIENT_ID,
    scope: 'user-read-private user-read-email',
    redirect_uri: REDIRECT_URI2,
    state: "aB9xYzQwLmN2RtUv"
  }

  const url_params = new URLSearchParams(params);
  res.redirect(AUTH_URL + url_params.toString());


});

app.get("/callback", async (req, res) => {
  console.log("The call back triggered");
  const code = req.query.code || null;
  const state = req.query.state || null;
  console.log({ state, code });
  if (state === null) {
    const url_query = new URLSearchParams({
      error: 'state_mismatch'
    }).toString();

    res.redirect('/#' + url_query);
  } else {
    const authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: code,
        redirect_uri: REDIRECT_URI2,
        grant_type: 'authorization_code',

      },
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + (new Buffer.from(CLIENT_ID + ':' + client_secret).toString('base64'))
      },
      json: true
    };
    const serchParams = new URLSearchParams(authOptions.form).toString()
    const response = await fetch(authOptions.url, {
      method: "POST",
      body: new URLSearchParams({
        code: code,
        redirect_uri: REDIRECT_URI2,
        grant_type: 'authorization_code',
      }),
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + (new Buffer.from(CLIENT_ID + ':' + client_secret).toString('base64'))
      },

    });

    const res_in_json = await response.json();
    //wait until data store to the session
    req.session.spot_response = res_in_json;
    await new Promise((res,rej)=>{
      req.session.save(res);
    })
    res.redirect("/home"); 

  }
})

app.get("/home",(req,res)=>{
  res.sendFile("./spotify/home.html",{ root: __dirname });
})


app.get("/tockenPass", (req, res) => {

  if (req.session?.spot_response?.access_token === undefined) {
    res.status(404).json({
      Error: "Tocken not found, Please Login to get Tocken "
    });
    return;
  }
  res.json(req.session?.spot_response);
})

 async function RefreshTocken(req) {

  const refresh_token = req.session.spot_response.refresh_token;
  
  console.log("refresh tocken triggered");
  //data required to send request for access tocken
  const authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + (new Buffer.from(CLIENT_ID + ':' + client_secret).toString('base64'))
    },
    form: {
      grant_type: 'refresh_token',
      refresh_token: refresh_token
    },
    json: true
  };

  // request for new access token
  const response = await fetch(authOptions.url, {
    method:"POST",
    headers: {
      ...authOptions.headers
    },
    body: new URLSearchParams(authOptions.form)
  });

  const json_response = await response.json();
 //new access token request success
  if (response.status === 200) {
    
    return {
      status:response.status,
      access_token:json_response.access_token,
    };
  }else{
    return {
      status:response.status,
      ...json_response
    }
  }

};


app.get("/Profile", async (req, res) => {
console.log("request for profile",!req.session.spot_response?.refresh_token);
 //checks session empty to redirect to login page
 if(!req.session.spot_response?.refresh_token){
  res.status(401).json({
    message:"unauthorized, please login"
  });
  return;
 }

 //spotify url to get the profile
  const prof_url = "https://api.spotify.com/v1/me";
  
  //loop wich first request for profile with access token, if any error request new token and repeat the profile request
  //repeat only once wich controlled by request flag variable
  let req_flag = true;
  while (req_flag) {
console.log("loop");
    //request for get profile
    console.log(req.session.spot_response.access_token);
    const prof_res = await fetch(prof_url, {
      headers: {
        Authorization: `Bearer ${req.session.spot_response.access_token}`,

      }
    })
    console.log(prof_res.status);
    //Checks request failed/
    if (prof_res.status === 401 || prof_res.status===403) {
      //request for new token
      const new_access_token = await RefreshTocken(req);
      console.log(new_access_token.status);
     //if any error occured while requestin new access token
      if (new_access_token.status !== 200) {
        res.status(new_access_token.status).json(new_access_token)
        break;
      }
      //stores new access_token
      req.session.spot_response.access_token = new_access_token.access_token;

      //requst success
    }else if(prof_res.status===200){
      console.log("profile request is success");
      const prof_res_json = await prof_res.json()
      res.json(prof_res_json);
      req_flag=false;
      
    }else{
    res.status(500).json({
    status: 'error',
    message: 'An unknown error occurred',
   
  });
 req_flag =false;
    }
    
  }
  return;
})



app.listen(4000, () => console.log("Server running on 4000"));
