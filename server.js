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
// exphbs.registerPartials(__dirname + '/views/partials');

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

function promiseAllArticles() {
	// Query to find all from Article 
	var query = Article.find();
	// Return promise
	return query.exec();
}	

app.get("/", function(req, res) {
	// Get all articles to display 
  	promiseAllArticles().then(function(allArticlesData) {
  		// Get saved articles to display count
  		promiseSavedArticles().then(function(savedArticles) {
  			// Render index with received data
			res.render("index", {articles: allArticlesData, articleCount: allArticlesData.length, savedCount: savedArticles.length});
  		})
	});
});

app.get("/scrape", function(req, res) {
	// Initialize promise array to hold all save entry queries
	var promiseArray = [];

	// First, we grab the body of the html with request
	request("https://www.nytimes.com/section/world?WT.nav=page&action=click&contentCollection=World&module=HPMiniNav&pgtype=Homepage&region=TopBar", function(error, response, html) {
	    // Then, we load that into cheerio and save it to $ for a shorthand selector
	    var $ = cheerio.load(html);
		
	    // Iterating over each required element
	    $("ol.story-menu>li>article>div.story-body>a.story-link").each(function(i, element) {
	    	console.log("ARTICLE INDEX: " + i);
	    	// Capturing required properties of each element into variables
	    	var link = $(element).attr("href");
	    	// console.log("Link -> " + link);

	    	var headline = $(element).children().find(".headline").html().trim();
	    	// console.log("Headline -> " + headline);

	    	var summary = $(element).children().find(".summary").html().trim();
	    	// console.log("Summary -> " + summary);

	    	var byline = $(element).children().find(".byline").html();
	    	// console.log("Byline -> " + byline);

		    // Initialize result object
		    var result = {};

		    // Add the headline, link, summary and byline of each to result object
		    result.headline = headline;
		    result.link = link;
		    result.summary = summary;
		    result.byline = byline;

		    // Create an entry object of Article model
		    var entry = new Article(result);

		    // Pushing each entry save into an array to use promise
		    promiseArray.push(

			    // Saving the entry to Articles
			    entry.save(function(err, data) {
			        // Log any errors
			        if (err) {
			          console.log("Error in db save: "+ err);
			        }
			        // Or log saved entry
			        else {
			    		console.log("Saved entry " + data);
			        }
		      	})
			);
	    });

	    // Rendering partials after every entry is saved - using Promise for this
	    Promise.all(promiseArray).then(function() {
	    	// Execute promise function to fetch all articles
	    	promiseAllArticles().then(function(allArticlesData) {
	    		console.log(allArticlesData.length);
	  			// Render articles onto index page using articledata partial
	  			res.render("partials/articledata", {articles: allArticlesData, layout: false, articleCount: allArticlesData.length, savedCount: 0});
			});
	    });

	});
});

// Function that promises to deliver all saved articles
function promiseSavedArticles() {
	var query = Article.find({saved_flag: true});
	return query.exec();
}

// Get all saved articles and render saved page
app.get("/saved", function(req, res)  {
	 promiseSavedArticles().then(function(err, savedArticles) {
		if(err){
			console.log(err);
		}else {
			promiseAllArticles().then(function(err, allArticlesData) {
				if(err) {
					console.log(err);
				}
				res.render("saved", {saved: savedArticles, savedCount: savedArticles.length, articleCount: allArticlesData.length});
			})
	    }
	});
});

// Update article saved_flag
app.post("/save", function(req, res) {
	// Find required article and update saved_flag
	Article.findOneAndUpdate({"_id": req.body.id}, {saved_flag: true})
	.exec(function(err, data) {
		if(err) {
			console.log(err);
		}else {
			res.send(data);
		}
	});
});

// Listening on port
app.listen(port, function() {
	console.log("Listening on " + port);
});