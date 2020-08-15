const express = require('express')
const hbs = require('express-handlebars');
const app = express()
const port = 3000
const bodyParser = require('body-parser');
const {MongoClient} = require('mongodb');
const uri = "mongodb+srv://djtimmy679:Timmy11721@cluster0.iyoxa.mongodb.net/test"
const client = new MongoClient(uri);
var userId = {}
async function createListing(client, newListing){
  const result = await client.db("UserDB").collection("users").insertOne(newListing);
  console.log(`New user created with the following id: ${result.insertedId}`);
  return result.insertedId;
}
const connectFunc = async () => {
  try {
    // Connect to the MongoDB cluster
    await client.connect();
    console.log('connected')
    // Make the appropriate DB calls
  } catch (e) {
      console.error(e);
  }
}
connectFunc()
// for parsing application/json
app.use(bodyParser.json()); 

// for parsing application/xwww-
app.use(bodyParser.urlencoded({ extended: true })); 
//form-urlencoded
app.set('view engine', 'hbs');
app.get('/', (req, res) => {
  res.render('home')
})
app.get('/signup', (req, res) => {
  res.render('signup')
})
app.engine('hbs', hbs({
  defaultLayout: 'main',
  extname: '.hbs'
}));
app.post('/create-user', async (req, res) => {
  console.log(req.body)
  var user = {
    first_name: req.body.first_name,
    last_name: req.body.last_name,
    email: req.body.email,
    password: req.body.password,
  }
  // doesn't work
  userId = await createListing(client, user);
  console.log(userId)
  res.redirect('/')
})
app.set('view engine', 'hbs');

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))