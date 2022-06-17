const express = require("express");
const app = express();
const PORT = 8080;
// const cookieParser = require("cookie-parser");
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');
const bodyParser = require("body-parser");
const {getUserByEmail} = require("./helper");


//--------MIDDLEWARE-----------
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
// app.use(cookieParser());
app.use(cookieSession({
  name: 'may',
  keys: ["we", "can", "do", "this"],
}));


//--------ROUTES---------------
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

//--------HOME PAGE-------------
app.get("/urls", (req, res) => {
  //const userID = req.cookies["user_id"];
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
  // Log the POST request body to the console
  console.log(req.body.longURL);
  let shortURL = generateRandomString();
  //assign the new key-value pair;
  urlDatabase[shortURL] = { longURL: req.body.longURL, userID: req.session.user_id };
  // req.cookies["user_id"]
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
  console.log("newemail", newEmail);

  for (let userId in users) {
    console.log("user", users[userId].email);
    if (users[userId].email === newEmail) {
      res.status(401).send('Email is already taken, please login with your email.');
      return;
    }
  }

  users[newId] = {
    id: newId,
    email: newEmail,
    password: hashedPassword
  };

  console.log(users);
  // res.cookie("user_id", newId);
  req.session.user_id = newId;

  res.redirect("/urls");
  console.log("users", users);

});

//-----------LOGIN----------------
app.get("/login", (req, res) => {
  //const userID = req.cookies["user_id"];
  const userID = req.session.user_id;
  const user = users[userID];
  // let email = req.body.username;
  // let userId = getUserFromEmail(email).id;
  // res.cookie("user_id", userId);
  const templateVars = {
    user
    //null
  };
  res.render("login", templateVars);
  // console.log("user",req.body)
});

//-----------LOGIN END POINT----------
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  const user = getUserByEmail(email, users);
  console.log("user:", user);
  //check if the passwordMatch return a truly value
  const isPasswordAMatch = bcrypt.compareSync(password, user.password);

  if (!user || !isPasswordAMatch) {
    res.status(400).send('Please enter a valid Username or Password');
    return;
  }

  // res.cookie("user_id", user.id);
  req.session.user_id = user.id;
  res.redirect("/urls");

});

app.post("/logout", (req, res) => {
  //res.clearCookie("user_id");
  req.session = null;
  res.redirect("/urls");
});

app.get("/urls/new", (req, res) => {
  //const userID = req.cookies["user_id"];
  const userID = req.session.user_id;
  const user = users[userID];
  
  const templateVars = {
    urls: urlDatabase,
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
  //const userID = req.cookies["user_id"];
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
    // send('Please enter a valid shortURL.');
    res.render("shortURLError", { message: "Please enter a vaild shortURL!", user: null });
    return;
  }
  const longURL = urlObject.longURL;
  res.redirect(`${longURL}`);

});

app.post("/urls/:shortURL/delete", (req, res) => {
  //const userID = req.cookies["user_id"];
  const userID = req.session.user_id;
  const user = users[userID];
  const url = urlDatabase[req.params.shortURL];
  console.log("url", url.userID)
  console.log("user.id", user.id )
  if (url.userID === user.id) {
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls");
  } else {
    res.status(401).send("Unauthorized user.");
  }
  
  
});

app.post("/urls/:shortURL/edit", (req, res) => {
  //const userID = req.cookies["user_id"];
  const userID = req.session.user_id;
  const user = users[userID];
  const url = urlDatabase[req.params.shortURL];
  console.log("url", url.userID);
  console.log("user", user);
  if (url.userID === user.id) {
    let shortURL = req.params.shortURL;
    urlDatabase[shortURL].longURL = req.body.longURL;
    res.redirect("/urls/");
  } else {
    res.status(401).send("Unauthorized user.");
  }
  
});

app.get("/urls/:shortURL/edit", (req, res) => {
  //const userID = req.cookies["user_id"];
  const userID = req.session.user_id;
  const user = users[userID];
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    user
  };
  res.render("urls_show", templateVars);
});


app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  //const userID = req.cookies["user_id"];
  const userID = req.session.user_id;
  const user = users[userID];
  const templateVars = {
    greeting: 'Hello World!',
    user
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
