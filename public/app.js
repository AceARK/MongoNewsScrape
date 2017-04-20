// Scrape articles and populate on click of button
$("#scrapeArticles").on("click", function() {
	$.get({
		url: "/scrape",
	}).done(function(data) {
		console.log(data);
		$("#articlesDiv").html(data);
	}).fail(function(error) {
		console.log("Scrape unsuccessful, error ->");
		console.log(error);
	});
});

// On clicking 'Add to Saved' button
$("#articlesDiv").on("click", ".saveArticle", function() {
	var articleId = $(this).attr("data-id");
	console.log(articleId);
	$.post({
		url: "/save",
		data: {id: articleId}
	}).done(function(data) {
		$(this).parent().append("<i style='color: green;' class='fa fa-3x fa-check' aria-hidden='true'></i>");
		$(this).hide();
	}).fail(function(error) {
		console.log("Could not add to saved, error ->");
		console.log(error);
	});
});