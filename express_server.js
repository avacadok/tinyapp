const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require("cookie-parser");

//--------MIDDLEWARE-----------
app.set("view engine", "ejs");

const bodyParser = require("body-parser");
const { response } = require("express");
const { del } = require("request");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

//--------ROUTES---------------
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/urls", (req, res) => {
  const templateVars = { 
    urls: urlDatabase,
    username: req.cookies["username"]
  };
  //para1 will be the ejs file inside the string, para2 has to be an obejct
  res.render("urls_index", templateVars);
});

app.post("/login", (req, res) => {
  let username = req.body.username
  res.cookie("username", username);
  res.redirect("/urls");
  // console.log("user",req.body)
});

app.post("/logout", (req, res) => {
  res.clearCookie("username")
  res.redirect("/urls");
});

app.get("/urls/new", (req, res) => {
  const templateVars = { 
    urls: urlDatabase,
    username: req.cookies["username"]
  };
  res.render("urls_new", templateVars);
});

app.post("/urls", (req, res) => {
  // Log the POST request body to the console
  console.log(req.body.longURL);
  let shortURL = generateRandomString();
  //assign the new key-value pair;
  urlDatabase[shortURL] = req.body.longURL;
  console.log(urlDatabase);
  res.redirect(`urls/${shortURL}`);
  //res.send("Ok");
  // Respond with 'Ok' (we will replace this)
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    username: req.cookies["username"]
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  //match the longURL with the shortURL on the urlDatabase
  const longURL = urlDatabase[req.params.shortURL];
  // console.log("longurl",longURL)
  res.redirect(`${longURL}`);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

//---------------------------need to fix this part--------------------------------
app.get("url/:shortURL/edit", (req, res) => {
  let shortURL = req.params.shortURL;
  console.log(shortURL);
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect("/urls");
});

app.post("/urls/:shortURL/edit", (req, res) => {
  let shortURL = req.params.shortURL;
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect("/urls");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  const templateVars = { 
    greeting: 'Hello World!',
    username: req.cookies["username"]
   };
  res.render("hello_world", templateVars);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

function generateRandomString() {
  let output = "";
  const randomStr = "abcdefghijklmnopqrstuvwxyz0123456789";

  for (let i = 0; i < 6; i++) {
    output += randomStr.charAt(Math.floor(Math.random() * randomStr.length));
  }
  return output;
};

