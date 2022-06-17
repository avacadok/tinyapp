let getUserByEmail = function(email, usersDatabase) {
  for (let userId in usersDatabase) {
    let user = usersDatabase[userId];
    console.log("user", user);
    if (email === user.email) {
      return user;
    }
  } return null;
};

module.exports = {
  getUserByEmail
}