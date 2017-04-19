// Requiring mongoose
var mongoose = require("mongoose");
// Creating Schema 
var Schema = mongoose.Schema;

// Create Article schema
var ArticleSchema = new Schema({
  // Title 
  title: {
    type: String,
    required: true
  },
  // Link 
  link: {
    type: String,
    required: true
  },
  // To save note ids as reference to each note
  note: {
    type: Schema.Types.ObjectId,
    ref: "Note"
  }
});

// Create Article model with ArticleSchema
var Article = mongoose.model("Article", ArticleSchema);

// Export Article model 
module.exports = Article;
