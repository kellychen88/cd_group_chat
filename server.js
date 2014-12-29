var port = 6789;
// load express module, a minimalist web framework
var express = require('express');
// middleware to handle/transform file paths
var path = require('path');
// middleware to serve favicon
var favicon = require('serve-favicon');
// middleware for http request logger
var logger = require('morgan');
// middleware to parse cookie header & populate req.cookies with object keyed by the cookie names
var cookieParser = require('cookie-parser');
// middleware to parse form data
var bodyParser = require('body-parser');
// middleware to handle session data
var session = require('express-session');

// create variable to hold express framework
var app = express();
// setup where the views are served from
app.set('views', path.join(__dirname, 'views'));
// view engine setup - how to pass data to the view files
app.set('view engine', 'ejs');

// configure the project using all the modules
// favicon needs to be in place in /public/images
app.use(favicon(__dirname + '/public/images/favicon.ico'));
app.use(logger('dev'));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded( { extended: false }));
app.use(session({ secret: 'codingdojo', resave: true, saveUninitialized: true }));
// this is where all the static content gets served from - no more static content module (that we created)
app.use(express.static(path.join(__dirname, 'public')));
// set the port number
app.set('port', process.env.PORT || port);
// create the server
var server = app.listen(app.get('port'), function (){
  console.log('\nexpress node.js server now running on port ' + server.address().port, '\n');
});
// create socket - passing the server object
  // make sure to run: 'sudo npm install --save socket.io' (or set in dependencies before 'sudo npm install')
var io = require('socket.io').listen(server);
// get the routing rules - pass socket, app & cookieParser
var routes = require('./routes/index')(io, app, cookieParser);

app.use(function (req, res, next){
  var err = new Error('Not Found!');
  err.status = 404;
  next(err);
});

if(app.get('env') === 'development'){
  app.use(function (err, req, res, next){
    res.status(err.status || 500);
    res.render('error', { message: err.message, error: err });
  });
}