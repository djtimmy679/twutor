const express = require('express')
const hbs = require('express-handlebars');
const app = express()
const port = 3000
const mongo = require('mongo')
const assert = require('assert')
const bodyParser = require('body-parser');

const url = 'mongodb://localhost:27017/test'
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
app.post('/create-user',(req, res) => {
  console.log(req.body)
  var user = {
    first_name: req.body.first_name,
    last_name: req.body.last_name,
    email: req.body.email,
    password: req.body.password,
  }
  // doesn't work
  mongo.connect(url, (err, db) => {
    console.log('here')
    assert.equal(null, err);
    db.collection('user-data').insertOne(user, (err, result) => {
      assert.equal(null, err);
      console.log('Item inserted')
      db.close()
    })
  })
  res.redirect('/')
})
app.set('view engine', 'hbs');

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))