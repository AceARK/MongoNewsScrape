// Dependencies
var express = require("express");
var bodyParser = require("body-parser");
// Database ORM
var mongoose = require("mongoose");
// Scraping tools
var request = require("request");
var cheerio = require("cheerio");
// Setting mongoose to leverage Promises
mongoose.Promise = Promise;

// Setting port
var port = process.env.PORT || 3000;

// Initialize express
var app = express();
// Use body-parser
app.use(bodyParser.urlencoded({
  extended: false
}));

// Make public a static dir
app.use(express.static("public"));

// Set Handlebars
var exphbs = require("express-handlebars");
// Setting default view engine to handlebars
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// Database configuration with mongoose on production or dev environment
if(process.env.MONGODB_URI) {
 	mongoose.connect("mongodb://heroku_qjgc5lj7:dt2mgr29ir18prn7j23f4er74u@ds163010.mlab.com:63010/heroku_qjgc5lj7");

}else {
   mongoose.connect("mongodb://localhost/mongonewsscrape");
}
// Getting mongoose connection
var db = mongoose.connection;

// Show any mongoose errors
db.on("error", function(error) {
  console.log("Mongoose Error: ", error);
});

// Once logged in to the db through mongoose, log a success message
db.once("open", function() {
  console.log("Mongoose connection successful.");
});

// Routes

/*

Routing to retrieve homepage with all articles from database or display none yet -> get to /

Routing for button press to scrape articles -> get to /scrape

Routing to get saved articles -> get to /saved

Routing to save notes to article with specific id -> post to /articles/:id

Routing to get saved notes for article with specific id -> get to /articles/:id

*/

// Listening on port
app.listen(port, function() {
	console.log("Listening on " + port);
});