var articleCount;
var savedCount;

var scrapedArticleCount;

articleCount = $("span.home").html();
console.log("ARticle count before scrape->" + articleCount);

// Scrape articles and populate on click of button
$("#scrapeArticles").on("click", function() {
	$.get({
		url: "/scrape"

	}).done(function(data) {
		// Display rendered articledata handlebars in articlesDiv
		$("#articlesDiv").html(data);
		// Calculate scrapedArticleCount
		scrapedArticleCount = parseInt($("#articleCountInfo").val()) - parseInt(articleCount);
		$("#scrapedArticleCount").html(scrapedArticleCount);
		// Get all and saved articles count
		articleCount = $("#articleCountInfo").val();
		savedCount = $("#savedCountInfo").val();
		// Set badges in menubar
		$("span.home").html(articleCount);
		$("span.saved").html(savedCount);
		// Display modal
		$("#scrapeDoneNotificationModal").modal("show");
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
	// Getting current button, to work with within ajax done
	var saveButton = $(this);
	// Disable save button
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

$(".savedArticle").on("click", ".undoSaveArticle", function() {
	var articleId = $(this).attr("data-id");
	// Getting current button, to work with within ajax done
	var unsaveButton = $(this);
	// Disable unsave button
	unsaveButton.prop('disabled', true);
	// Post to mark article as unsaved
	$.post({
		url: "/unsave",
		data: {id: articleId}

	}).done(function(data) {
		// Get saved article count and decrement
		savedCount = $("span.saved").html();
		savedCount--;
		console.log(savedCount);
		// Set updated saved count
		$("span.saved").html(savedCount);
		// Remove article from saved articles display
		unsaveButton.parent().parent().parent().remove();
	}).fail(function(error) {
		// Log error
		console.log("Could not remove from saved, error ->");
		console.log(error);
		// Re-enable save button to try saving again
		unsaveButton.prop('disabled', false);
	});
});

// Add note code
$(".savedArticle").on("click", ".addNote", function() {
	var articleId = $(this).attr("data-id");
	console.log(articleId);

	// Get notes for this article
	$.get({
		url: "/note/article/" + articleId

	}).done(function(data) {
		$("#addNotesModal #saveNote").html("Save Note");
		$("#addNotesModal #saveNote").attr("data-dismiss", "");
		// Remove any error messages from previous tries here
		$("div.alert-danger").remove();
		// Empty note div before creating new notes within
		$("#savedNotesDiv").empty();
		console.log(data);
		// Iterate through each note in data and create divs within savedNotesDiv
		data.notes.forEach(function(noteItem) {
			var noteDiv = $("<div class='noteItem'>");
			noteDiv.html(noteItem.text);
			noteDiv.append("<button data-id='" + noteItem._id + "' class='btn btn-danger deleteNote'><i class='fa fa-times' aria-hidden='true'></i></button>");
			$("#savedNotesDiv").append(noteDiv);
		});

		// Setting data-id attribute of Save Note button with current articleId 
		$("#saveNote").attr("data-id", articleId);
		// Show notes modal
		$("#addNotesModal").modal("show");
	}).fail(function(error) {
		console.log(error);
	});
});

$("#saveNote").on("click", function(event) {
	var articleId = $(this).attr("data-id");
	console.log(articleId);
	var noteContent = $("#newNote").val();
	// Post new note 
	$.post({
		url: "/note/article/" + articleId,
		data: { text: noteContent }
	}).done(function(data) {
		console.log(data);
		if(data.errors) {
			$("#addNotesModal .modal-body").prepend("<div class='text-center alert alert-danger'>Article notes cannot be empty.</div>");
			$("#addNotesModal #saveNote").attr("data-dismiss", "modal");
			$("#addNotesModal #saveNote").html("Ok");
		}else {
			$("#addNotesModal").modal("hide");
			$("#newNote").val("");
		}
	}).fail(function(error) { 
		console.log("Note could not be saved.");
		console.log(error);
	})
});

$("#savedNotesDiv").on("click", ".deleteNote", function() {
	var noteId = $(this).attr("data-id");
	var articleId = $("#saveNote").attr("data-id");
	// Find the noteDiv to remove after post
	var noteToDelete = $(this).parent();
	// Post new note 
	$.post({
		url: "/note/delete",
		data: { 
			noteId: noteId,
			articleId: articleId
		}
		
	}).done(function(data) {
		console.log(data);
		// Remove note from savedNotesDiv
		noteToDelete.remove();

	}).fail(function(error) { 
		console.log("Note could not be saved.");
		console.log(error);
	})
});

