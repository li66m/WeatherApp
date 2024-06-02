//Cntl+C to stop server

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');

var  app = express(); //create express middleware dispatcher

const PORT = process.env.PORT || 3000

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs'); //use hbs handlebars wrapper

app.locals.pretty = true; //to generate pretty view-source code in browser

//read routes modules
var routes = require('./routes/index');

//register middleware with dispatcher
//middleware

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));

app.use(express.static(path.join(__dirname, 'public')))
app.use('/routes', express.static(path.join(__dirname, 'routes')))
app.use('/CSS', express.static(path.join(__dirname, 'CSS')))
//routes
app.get('/index.html', routes.index);
app.get('/signup', routes.signup);
app.get('/createUser', routes.createUser);
// only authenticate users once they've signed up (only can view index and signup.)
app.use(routes.authenticate); //authenticate user at these routes.
app.get('/weatherApp', routes.weatherApp);
app.get('/users', routes.users);
app.get('/removeUser', routes.removeUser);



//start server
app.listen(PORT, err => {
  if(err) console.log(err)
  else {
		console.log(`Server listening on port: ${PORT} CNTL:-C to stop`)
		console.log(`To Test:`)
		console.log('user: admin password: admin')
		console.log('http://localhost:3000/index.html')
		console.log('http://localhost:3000/users')
	}
})
