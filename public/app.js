var articleCount;
var savedCount;

// Scrape articles and populate on click of button
$("#scrapeArticles").on("click", function() {
	$.get({
		url: "/scrape"

	}).done(function(data) {
		// Display rendered articledata handlebars in articlesDiv
		$("#articlesDiv").html(data);
		// Get all and saved articles count
		articleCount = $("#articleCountInfo").val();
		savedCount = $("#savedCountInfo").val();
		// Set badges in menubar
		$("span.home").html(articleCount);
		$("span.saved").html(savedCount);
		// Log count
		console.log("ARTICLE COUNT: " + articleCount + " SAVED COUNT: " + savedCount);

	}).fail(function(error) {
		// Log error
		console.log("Scrape unsuccessful, error ->");
		console.log(error);
	});
});

// On clicking 'Add to Saved' button
$("#articlesDiv").on("click", ".saveArticle", function() {
	var articleId = $(this).attr("data-id");
	console.log(articleId);
	// Get saved article count
	savedCount = $("span.saved").html();
	console.log(savedCount);
	// Getting current button to work with within ajax done
	var saveButton = $(this);
	// Mark article as saved and hide save button
	saveButton.prop('disabled', true);

	// Post request to mark article as saved
	$.post({
		url: "/save",
		data: {id: articleId}

	}).done(function(data) {
		console.log("Saved count before increment -> " + savedCount);
		// Increment saved count and set badge in menubar
		savedCount++;
		$("span.saved").html(savedCount);

		// Hide save button and mark as saved
		saveButton.parent().append("<i style='color: green;' class='fa fa-3x fa-check' aria-hidden='true'></i>");
		saveButton.hide();

		// Log count
		console.log("SAVED COUNT: " + savedCount);

	}).fail(function(error) {
		// Log error
		console.log("Could not add to saved, error ->");
		console.log(error);
		// Re-enable save button to try saving again
		saveButton.prop('disabled', false);
	});
});