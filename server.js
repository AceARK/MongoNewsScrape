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

// Requiring Article and Note models
var Article = require("./models/Article.js");
var Note = require("./models/Note.js");

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

Routing for button press to scrape articles -> get to /scrape

Routing to get saved articles -> get to /saved

Routing to save notes to article with specific id -> post to /articles/:id

Routing to get saved notes for article with specific id -> get to /articles/:id

*/

app.get("/articles", function(req, res) {
  // Find all from Article 
  Article.find({}, function(error, data) {
    // If error,
    if (error) {
      console.log(error);
    }
    // Else send data
    else {
      res.json(data);
    }
  });
});

app.get("/scrape", function(req, res) {
	// First, we grab the body of the html with request
	request("http://www.echojs.com/", function(error, response, html) {
	    // Then, we load that into cheerio and save it to $ for a shorthand selector
	    var $ = cheerio.load(html);
	    // Now, we grab every h2 within an article tag, and do the following:
	    $("article h2").each(function(i, element) {

	      // Save an empty result object
	      var result = {};

	      // Add the text and href of every link, and save them as properties of the result object
	      result.title = $(this).children("a").text();
	      result.link = $(this).children("a").attr("href");

	      // Using our Article model, create a new entry
	      // This effectively passes the result object to the entry (and the title and link)
	      var entry = new Article(result);

	      // Now, save that entry to the db
	      entry.save(function(err, doc) {
	        // Log any errors
	        if (err) {
	          console.log(err);
	        }
	        // Or log the doc
	        else {
	          console.log(doc);
	        }
	      });

	    });
	});
	// Tell the browser that we finished scraping the text
	res.send("Scrape Complete");
});

// Listening on port
app.listen(port, function() {
	console.log("Listening on " + port);
});