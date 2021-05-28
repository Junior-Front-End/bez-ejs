require("dotenv").config()
 
const cookieParser = require("cookie-parser"); 
const path = require("path"); 
const express = require("express"); 
const app = express(); 

var logger = require('morgan');

app.locals.siteTitle = 'bez-ejs'

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs'); 
app.use(logger('dev'));

// static
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('server/public'));
app.use(cookieParser());

// routes
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Headers","x-access-token, Origin, Content-Type, Accept");
  next();
});

// 
app.use(require("./security/routes")) 

// catch 404 
app.use(function(req, res, next) {
  res.status(404);
  res.render('index',{
    pageTitle: '404',
    url: req.url,
    pageID: '404',
  })
});

// server
app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}.`);
});
