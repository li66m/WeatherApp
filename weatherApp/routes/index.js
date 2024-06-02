
var url = require('url');
var sqlite3 = require('sqlite3').verbose(); //verbose provides more detailed stack trace
var db = new sqlite3.Database('data/db_users');

exports.authenticate = function (request, response, next){
    /*
	Middleware to do BASIC http 401 authentication
	*/
    var auth = request.headers.authorization;
	// auth is a base64 representation of (username:password)
	//so we will need to decode the base64
	if(!auth){
 	 	//note here the setHeader must be before the writeHead
		response.setHeader('WWW-Authenticate', 'Basic realm="need to login"');
        response.writeHead(401, {'Content-Type': 'text/html'});
		console.log('No authorization found, send 401.');
 		response.end();
	}
	else{
	    console.log("Authorization Header: " + auth);
        //decode authorization header
		// Split on a space, the original auth
		//looks like  "Basic Y2hhcmxlczoxMjM0NQ==" and we need the 2nd part
        var tmp = auth.split(' ');

		// create a buffer and tell it the data coming in is base64
        var buf = Buffer.from(tmp[1], 'base64');

        // read it back out as a string
        //should look like 'ldnel:secret'
		var plain_auth = buf.toString();
        console.log("Decoded Authorization ", plain_auth);

        //extract the userid and password as separate strings
        var credentials = plain_auth.split(':');      // split on a ':'
        var username = credentials[0];
        var password = credentials[1];
        console.log("User: ", username);
        console.log("Password: ", password);

		var authorized = false;
		//check database users table for user
		db.all("SELECT userid, password, role FROM users", function(err, rows){
			for (var i = 0; i < rows.length; i++) {
				if (rows[i].userid == username & rows[i].password == password) {
				  authorized = true
				  request.user_role = rows[i].role
				}
			  }
			if(authorized == false){
			//we had an authorization header by the user:password is not valid
			response.setHeader('WWW-Authenticate', 'Basic realm="need to login"');
			response.writeHead(401, {'Content-Type': 'text/html'});
			console.log('No authorization found, send 401.');
			response.end();
			}else
			next();
		});
	}

	//notice no call to next()

}

exports.index = function (request, response){
        // index
	     response.render('index', { title: 'Welcome to the weather app!', body: 'You may only use this app if you have signed up for it.'});
}

exports.users = function(request, response){
        // users
		console.log('USER ROLE: ' + request.user_role);
		if(request.user_role !== 'admin'){
			response.writeHead(200, {
				'Content-Type': 'text/html'
			})
			response.write('<h2>ERROR: Admin Privileges Required To See Users</h2>')
			response.end();
			return
		}
		
		db.all("SELECT userid, password, role FROM users", function(err, rows){
 	       response.render('users', {title : 'Users:', userEntries: rows});
		})

}

exports.signup = function (request, response){
	// signup
	response.render('signup', {title: 'Sign Up or Login'});
}

exports.createUser = function(request, response){
	console.log("Running create user page.")
	// get username and password from query and add that data to the database
	let username = request.query.username
	let password = request.query.password
	if(!username || !password){
		console.error('No username or password provided.')
		response.status(400).send('No username or password provided.')
		return
	}
	sqlString = "INSERT OR REPLACE INTO users VALUES ('"+ username +"', '" + password + "', 'guest')";
    db.run(sqlString);
	console.log('User added to db.');
	// render the index page with a message
	response.render('index', {title: 'Welcome to the weather app!', body: 'Thanks for creating an account! You may now use this app. Login below.'});
}

exports.weatherApp = function(request, response){
	// get the city from the query
	let city = request.query.city
	if(!city){
		// basically just means theres no city in the query
		response.render('weatherApp', {title: 'Weather App'});
		return
	}

	// getting the weather data from the API
	const API_KEY = '9951ff297b65d29901bd3e9885a342a2'
	const options = {
		host: 'api.openweathermap.org',
		path: `/data/2.5/weather?q=${city}&appid=${API_KEY}`
	}
	var http = require('http')
	http.request(options, function(res){
		// adding the data to a string
		let weatherData = ''
		res.on('data', function(chunk){
			weatherData += chunk
		})
		// once we have all the data, we parse it and send it to the client
		res.on('end', function(){
			const weatherObj = JSON.parse(weatherData)
			// if the city isn't found, then an error message is displayed
			if(weatherObj && weatherObj.cod && weatherObj.cod !== 200){
				response.render('weatherApp', { title: 'Weather App', error: 'City not found. Please check your input.' })
			} else{
				// Source: https://www.calculatorsoup.com/calculators/conversions/kelvin-to-celsius.php
				celsius = weatherObj.main.temp - 273.15
				weatherMain = weatherObj.weather[0].main
				response.render('weatherApp', { title: 'Weather App', weather: weatherObj, main: weatherMain, description: weatherObj.weather[0].description, temp: celsius.toFixed(2) })
			}
		})
	}).end()
}

exports.removeUser = function(request, response){
	// getting the user from the query and removing it from the database
	let user = request.query.user
	// if there's no user, then an error message is displayed
	if(!user){
		console.error('No user provided.')
		response.status(400).send('No user provided.')
		return
	}

	// now we check if the user actually exists in the database
	let checkUser = "SELECT userid FROM users WHERE userid = ?";
	db.get(checkUser, [user], function(err, row){
		if(!row){
			response.render('index', {title: 'Welcome to the weather app!', body: 'ERROR: User not found in database.'})
			return
		}
		if(err){
			console.error(err)
			response.status(500).send('Internal server error.')
			return
		}
		// since the user exists, we can remove it from the database
		let sqlString = "DELETE FROM users WHERE userid = ?"
		db.run(sqlString, [user], function(err){
			if(err){
				console.error(err)
				response.status(500).send('Internal server error.')
				return
			}
			response.render('index', {title: 'Welcome to the weather app!', body: 'ADMIN ANNOUNCEMENT. User ' + user + ' was removed from database.'})
		})
	})
}