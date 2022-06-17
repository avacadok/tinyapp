let getUserByEmail = function(email, usersDatabase) {
  for (let userId in usersDatabase) {
    let user = usersDatabase[userId];
    if (email === user.email) {
      return user;
    }
  } return undefined;
};

function generateRandomString() {
  let output = "";
  const randomStr = "abcdefghijklmnopqrstuvwxyz0123456789";

  for (let i = 0; i < 6; i++) {
    output += randomStr.charAt(Math.floor(Math.random() * randomStr.length));
  }
  return output;
}

module.exports = {
  getUserByEmail,
  generateRandomString
};