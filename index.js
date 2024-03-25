const express = require("express");
const { MongoClient } = require("mongodb");
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

const hbs = require("express-handlebars").create({
  helpers: {
      eq: (v1, v2) => v1 === v2,
      selectedIfEquals: selectedIfEquals
  }
});
app.engine("hbs", hbs.engine);
app.set("view engine", "hbs");
const bodyParser = require("body-parser");
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
    res.render("profile", { user: userId});
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
app.post("/create-user", async (req, res) => {
  console.log(req.body);
  var user = {
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    password: req.body.password,
    role: req.body.role,
    // Initialize subjects as an empty array in case parsing fails or it's not provided
    subjects: JSON.parse(req.body.subjects || '[]')
  };
  try {
    const userId = await createUser(client, user);
    console.log(`Created user with ID: ${userId}`);
    res.redirect("/login");
  } catch (error) {
    console.error("Failed to create user:", error);
    // Handle the error appropriately
    res.status(500).send("Server error");
  }
});

app.post("/login-worker", async (req, res) => {
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
  // Extracting subjects from the request body
  let subjects = req.body.subjects;
  // Check if subjects is a string and not empty
  if (subjects !== ""){
    newSubjects = JSON.parse(subjects);
  }
  try {
    var user = {
      email: req.body.email,
    };
    const userResult = await client.db("UserDB").collection("users").findOne({ email: user.email});
    console.log('im here');
    if (!userResult) {
        // Handle case where user is not found
        return res.status(404).send("User not found");
    }
    console.log('user subjects')
    console.log(user.subjects)
    // Combine old and new subjects, removing duplicates
    const updatedSubjects = Array.from(new Set([...userResult.subjects, ...newSubjects]));

  // Prepare the user object for update, including the converted subjects array
  const userUpdate = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      role: req.body.role,
      subjects: updatedSubjects, // Using the array
  };
  console.log(userUpdate)
  await updateUser(client, userUpdate); // Make sure updateUser handles skills correctly
  res.redirect("/userPortal");
 } catch (error) {
  console.error("Failed to update user:", error);
  // Handle the error appropriately
  res.status(500).send("Server error");
}
  // Proceed with your database update logic using the userUpdate object
  // Make sure to handle errors and send appropriate responses
});

app.set("view engine", "hbs");

app.listen(port, () =>
  console.log(`Example app listening at http://localhost:${port}`)
);
function selectedIfEquals(value, expectedValue) {
  return value === expectedValue ? 'selected' : '';
}
