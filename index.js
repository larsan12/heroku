var express = require("express");
var app = express();
//app.use(express.logger());
//app.use(express.bodyParser());
//app.use(express.session());
var path = require("path");


app.get('/', function(req, res) {
  	res.sendFile(path.join(__dirname+'/html/main.html'));
});

app.get('/style', function(req, res) {
  	res.sendFile(path.join(__dirname+'/html/Style.css'));
});




var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});