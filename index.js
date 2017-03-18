var express = require("express");
var app = express();
var path = require("path");
var bodyParser = require('body-parser')
var controllers = require("./controllers/index");
//var controllers = require("./controllers");


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); 

//refresh session time
app.use(function(req, res, next) {
	if (req.url != "/" && req.url != "/style" && req.url != "/session" && req.url != "/logic") {
		if (!req.body.session) {
			res.status(500).send({ error: 'Session doesnt exist!' });
		}
		controllers.refreshTimer(req.body.session);
		//TODO refresh session time
	}
	next();
})

app.get('/', function(req, res) {
  	res.sendFile(path.join(__dirname+'/html/main.html'));
});

app.get('/style', function(req, res) {
  	res.sendFile(path.join(__dirname+'/html/Style.css'));
});

app.get('/logic', function(req, res) {
  	res.sendFile(path.join(__dirname+'/html/logic.js'));
});

app.get('/session', controllers.getSession);
app.post('/move', controllers.move);
app.post('/add', controllers.add);
app.post('/delete', controllers.delete);
app.post('/rename', controllers.rename);
app.post('/apply', controllers.apply);
app.post('/reset', controllers.reset);

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});