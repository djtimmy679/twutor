const express = require('express')
const hbs = require('express-handlebars');
const app = express()
const port = 3000

app.set('view engine', 'hbs');
app.get('/', (req, res) => {
  res.render('home')
})
app.engine('hbs', hbs({
  defaultLayout: 'main',
  extname: '.hbs'
}));

app.set('view engine', 'hbs');

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))