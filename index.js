const express = require("express");
const hbs = require("express-handlebars");
const app = express();
const port = 3000;
const bodyParser = require("body-parser");
const { MongoClient } = require("mongodb");
const uri =
  "mongodb+srv://djtimmy679:Timmy11721@cluster0.iyoxa.mongodb.net/test";
const client = new MongoClient(uri, { useUnifiedTopology: true });
var userId = {};
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
    return result._id;
  } else {
    console.log(`No listings found with the name '${user.email}'`);
    return null;
  }
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
  };
  // doesn't work
  userId = await createUser(client, user);
  console.log(userId);
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
    res.redirect("/");
  }
});
app.set("view engine", "hbs");

app.listen(port, () =>
  console.log(`Example app listening at http://localhost:${port}`)
);
