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

//--------USER INFORMATION------
const users = {
  "Snowie": {
    id: "Snowie",
    email: "snowie@gmail.com",
    password: "ilovemymama"
  },
  "Brandon": {
    id: "Brandon",
    email: "brando@gmail.com",
    password: "520ava1314"
  }
};

let getUserFromEmail = function(email) {
  for (let userId in users) {
    let user = users[userId];
    console.log("user", user);
    if (email === user.email) {
      return user;
    }
  } return null;
};

//--------HOME PAGE-------------
app.get("/urls", (req, res) => {
  const userObject = getUserFromEmail(req.cookies["user_id"]);
  const templateVars = {
    urls: urlDatabase,
    user: userObject
  };
  console.log(templateVars);
  console.log(req.cookies);
  //para1 will be the ejs file inside the string, para2 has to be an obejct
  res.render("urls_index", templateVars);
});

//--------REGISTRATION--------------
app.get("/register", (req, res) => {
  const userObject = getUserFromEmail(req.cookies["user_id"]);
  const templateVars = {
    user: userObject
    // username: req.cookies["username"]
  };
  res.render("register", templateVars);
});


//--------REGISTRATION END-POINT------
app.post("/register", (req, res) => {
  const newId = generateRandomString();
  const newEmail = req.body.email;
  const newPassword = req.body.password;
  console.log("newemail", newEmail);

  for (let userId in users) {
    console.log("user", users[userId].email);
    if (users[userId].email === newEmail) {
      res.status(400).send('Email is already taken, please login with your email.');
      return;
    }
  }

  if (newPassword === "" || newEmail === "") {
    res.status(400).send("Please enter valid email and password");
    return;
  }

  users[newId] = {
    id: newId,
    email: newEmail,
    password: newPassword
  };
  console.log(users);
  res.cookie("user_id", newId);
  res.redirect("/urls");
  console.log("users", users);
  
});

//-----------LOGIN----------------
app.get("/login", (req, res) => {
  const userObject = getUserFromEmail(req.cookies["user_id"]);
  // let email = req.body.username;
  // let userId = getUserFromEmail(email).id;
  // res.cookie("user_id", userId);
  const templateVars = {
    user: userObject
    //null
  };
  res.render("login", templateVars);
  // console.log("user",req.body)
});

//-----------LOGIN END POINT----------
app.post("/login", (req, res) => {
  // const templateVars = {
  //   user: users[req.cookies["user_id"]]
  //   // username: req.cookies["username"]
  // };

  const email = req.body.email;
  const password = req.body.password;

  for (let userId in users) {
    console.log(userId);
    console.log("email",email, users[userId].email);
    //checking the email and password in the same userObject to see if both are correct
    if (users[userId].email === email && users[userId].password === password) {
      res.cookie("user_id", email);
      res.redirect("/urls");
      return;
    }
  }
  //would not return this msg if the user enter correct password and username pair
  res.status(403).send('Please enter a valid Username or Password');
  return;
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

app.get("/urls/new", (req, res) => {
  const userObject = getUserFromEmail(req.cookies["user_id"]);
  const templateVars = {
    urls: urlDatabase,
    user: userObject
    // username: req.cookies["username"]
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
  const userObject = getUserFromEmail(req.cookies["user_id"]);
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    user: userObject
    //username: req.cookies["username"]
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

app.post("/urls/:shortURL/edit", (req, res) => {
  let shortURL = req.params.shortURL;
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect("/urls/");
});

app.get("/urls/:shortURL/edit", (req, res) => {
  const userObject = getUserFromEmail(req.cookies["user_id"]);
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    user: userObject
    // username: req.cookies["username"]
  };
  res.render("urls_show", templateVars);
});


app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  const userObject = getUserFromEmail(req.cookies["user_id"]);
  const templateVars = {
    greeting: 'Hello World!',
    user: userObject
    // username: req.cookies["username"]
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
}
