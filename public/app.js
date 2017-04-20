// Scrape articles and populate on click of button
$("#scrapeArticles").on("click", function() {
	$.get({
		url: "/scrape",
	}).done(function(data) {
		console.log(data);
		$("#articlesDiv").html(data);
	}).fail(function(error) {
		console.log("Scrape unsuccessful,  error -> ");
		console.log(error);
	});
});

