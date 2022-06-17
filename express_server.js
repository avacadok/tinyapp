const express = require("express");
const app = express();
const PORT = 8080;
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');
const bodyParser = require("body-parser");
const {getUserByEmail, generateRandomString} = require("./helper");


//--------MIDDLEWARE-----------
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'may',
  keys: ["we", "can", "do", "this"],
}));


const urlDatabase = {
  b2xVn2: {
    longURL: "http://www.lighthouselabs.ca",
    userID: "Snowie"
  },
  s9m5xK: {
    longURL: "http://www.google.com",
    userID: "Brando"
  }
};

const urlsForUser = function(id) {
  const urls = {};
  
  for (let key in urlDatabase) {
    const url = urlDatabase[key];
    if (url.userID === id) {
      urls[key] = url;
    }
  }
  
  return urls;
};

//--------USER INFORMATION------
const users = {
  "Snowie": {
    id: "Snowie",
    email: "snowie@gmail.com",
    password: "$2a$10$2vkI.HIE6HTduf.UzPYGvO3fDumXVYbA4DcmIOvRIGcExJD8Flufa"
  },
  "Brando": {
    id: "Brando",
    email: "123@gmail.com",
    password: "$2a$10$2vkI.HIE6HTduf.UzPYGvO3fDumXVYbA4DcmIOvRIGcExJD8Flufa"
  }
};

//--------ROUTES---------------
//--------HOME PAGE-------------
app.get("/urls", (req, res) => {
  const userID = req.session.user_id;
  const user = users[userID];
  if (!user) {
    res.render("notLogin", {message: "Please Login First!", user: null});
    return;
  }
  
  const urls = urlsForUser(userID);

  const templateVars = { urls, user };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {

  let shortURL = generateRandomString();
  const longURL = req.body.longURL;
  const userID = req.session.user_id;

  urlDatabase[shortURL] = { longURL, userID};
  res.redirect(`urls/${shortURL}`);

});

//--------REGISTRATION--------------
app.get("/register", (req, res) => {
  const templateVars = {
    user: null
  };
  res.render("register", templateVars);
});

//--------REGISTRATION END-POINT------
app.post("/register", (req, res) => {
  const newId = generateRandomString();
  const newEmail = req.body.email;
  const newPassword = req.body.password;

  if (newPassword === "" || newEmail === "") {
    res.status(401).send("Please enter valid email and password");
    return;
  }
  //convert new password to hashed password;
  const hashedPassword = bcrypt.hashSync(newPassword, 10);

  for (const userId in users) {
    if (users[userId].email === newEmail) {
      return res.status(401).send('Email is already taken, please login with your email.');
    }
  }

  users[newId] = {
    id: newId,
    email: newEmail,
    password: hashedPassword
  };

  req.session.user_id = newId;

  res.redirect("/urls");

});

//-----------LOGIN----------------
app.get("/login", (req, res) => {

  const userID = req.session.user_id;
  const user = users[userID];

  const templateVars = {
    user
  };
  res.render("login", templateVars);

});

//-----------LOGIN END POINT----------
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  const user = getUserByEmail(email, users);
  
  if (!user) {
    return res.status(403).send('Email not found, please register for an account.');

  }

  const isPasswordAMatch = bcrypt.compareSync(password, user.password);

  if (!isPasswordAMatch) {
    return res.status(400).send('Please enter a valid Username or Password.');
  }

  req.session.user_id = user.id;
  res.redirect("/urls");
  
});

app.post("/logout", (req, res) => {

  req.session = null;
  res.redirect("/urls");
});

app.get("/urls/new", (req, res) => {

  const userID = req.session.user_id;
  const user = users[userID];
  const urls = urlDatabase;
  
  const templateVars = {
    urls,
    user
  };

  if (templateVars.user) {
    res.render("urls_new", templateVars);
  } else {
    res.status(401);
    res.render("error", { message: "Please login in order to create new URL!", user: null });
  }

});

app.get("/urls/:shortURL", (req, res) => {

  const userID = req.session.user_id;
  const user = users[userID];
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    user
  };

  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  //match the longURL with the shortURL on the urlDatabase
  const urlObject = urlDatabase[req.params.shortURL];
  if (!urlObject) {
    res.status(403);
    return res.render("shortURLError", { message: "Please enter a vaild shortURL!", user: null });
    
  }
  const longURL = urlObject.longURL;
  res.redirect(`${longURL}`);

});

app.post("/urls/:shortURL/delete", (req, res) => {

  const userID = req.session.user_id;
  const user = users[userID];
  const url = urlDatabase[req.params.shortURL];

  if (url.userID === user.id) {
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls");
  } else {
    res.status(401).send("Unauthorized user.");
  }
  
});

app.post("/urls/:shortURL/edit", (req, res) => {

  const userID = req.session.user_id;
  const user = users[userID];
  const shortURL = req.params.shortURL;
  const url = urlDatabase[shortURL];

  if (url.userID === user.id) {

    url.longURL = req.body.longURL;
    res.redirect("/urls/");
  } else {
    res.status(401).send("Unauthorized user.");
  }
  
});

app.get("/urls/:shortURL/edit", (req, res) => {

  const userID = req.session.user_id;
  const user = users[userID];
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  const templateVars = {
    shortURL,
    longURL,
    user
  };
  res.render("urls_show", templateVars);
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


