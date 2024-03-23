const express = require("express");
const hbs = require("express-handlebars");
require('dotenv').config();
const app = express();
const port = process.env.PORT || 3000;
const bodyParser = require("body-parser");
const { MongoClient } = require("mongodb");
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
var userId = null;
async function createUser(client, newUser) {
  const result = await client
    .db("UserDB")
    .collection("users")
    .insertOne(newUser);
  console.log(`New user created with the following id: ${result.insertedId}`);
  return result.insertedId;
}
async function validateLogin(client, user) {
  result = await client
    .db("UserDB")
    .collection("users")
    .findOne({ email: user.email, password: user.password });

  if (result) {
    console.log(
      `Found a listing in the collection with the name '${user.email}':`
    );
    console.log(result._id);
    return result;
  } else {
    console.log(`No listings found with the name '${user.email}'`);
    return null;
  }
}
async function updateUser(client, user) {
  result = await client
    .db("UserDB")
    .collection("users")
    .updateOne({ email: user.email }, { $set: user });

  console.log(`${result.matchedCount} document(s) matched the query criteria.`);
  console.log(`${result.modifiedCount} document(s) was/were updated.`);
}
async function findUsers(client, user) {
  result = await client.db("UserDB").collection("users").find({
    subjects: {$in: user.subjects}
  })
  let matches = await result.toArray()
  let newMatches = []
  matches.forEach(match => {
    if(match.email !== user.email) {
      newMatches.push(match)
    }
  })
  matches = newMatches
  console.log(matches)
  return matches
}
const connectFunc = async () => {
  try {
    // Connect to the MongoDB cluster
    await client.connect();
    console.log("connected");
    // Make the appropriate DB calls
  } catch (e) {
    console.error(e);
  }
};
connectFunc();
// for parsing application/json
app.use(bodyParser.json());

// for parsing application/xwww-
app.use(bodyParser.urlencoded({ extended: true }));
//form-urlencoded
app.set("view engine", "hbs");
app.get("/", (req, res) => {
  res.render("home");
});
app.get("/signup", (req, res) => {
  res.render("signup");
});
app.get("/login", (req, res) => {
  res.render("login");
});
app.get("/logout", (req, res) => {
  userId = null;
  res.redirect("/");
});
app.get("/userPortal", (req, res) => {
  if (userId) {
    res.render("userPortal", { user: userId });
  } else {
    res.redirect("/login");
  }
});
app.get("/profile", (req, res) => {
  if (userId) {
    res.render("profile", { user: userId });
  } else {
    res.redirect("/login");
  }
});
app.get("/connect", async (req, res) => {
  const matches = await findUsers(client, userId)
  res.render("connect", { matches: matches})
})
app.get("/about", (req, res) => {
  res.render("about")
})
app.engine(
  "hbs",
  hbs({
    defaultLayout: "main",
    extname: ".hbs",
  })
);
app.post("/create-user", async (req, res) => {
  console.log(req.body);
  var user = {
    first_name: req.body.first_name,
    last_name: req.body.last_name,
    email: req.body.email,
    password: req.body.password,
    role: req.body.role,
    subjects: req.body.subjects
  };
  if (req.body.subjects !== "") {
    const subjects = req.body.subjects.split(" ");
    console.log(subjects);
    user.subjects = subjects;
  }
  // doesn't work
  userId = await createUser(client, user);
  res.redirect("/login");
});
app.post("/login-worker", async (req, res) => {
  console.log(req.body);
  var user = {
    email: req.body.email,
    password: req.body.password,
  };
  userId = await validateLogin(client, user);
  if (userId) {
    res.redirect("/userPortal");
  } else {
    res.redirect("/login");
  }
});
app.post("/update-user", async (req, res) => {
  console.log(req.body);
  if(req.body.first_name !=="") {
    userId.first_name = req.body.first_name
  }
  if(req.body.last_name !=="") {
    userId.last_name = req.body.last_name
  }
  if (req.body.phone !== "") {
    userId.phone = req.body.phone;
  }
  if (req.body.role !== "") {
    userId.role = req.body.role;
  }
  if (req.body.subjects !== "") {
    const subjects = req.body.subjects.split(" ");
    console.log(subjects);
    userId.subjects = subjects;
  }
  updateUser(client, userId);
  res.redirect("/userPortal");
});
app.set("view engine", "hbs");

app.listen(port, () =>
  console.log(`Example app listening at http://localhost:${port}`)
);
