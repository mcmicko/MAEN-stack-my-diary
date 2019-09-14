const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const StorySchema = new Schema({
  title: {
    type: String,
    required: true,
    allowNull: false
  },
  content: {
    type: String,
    required: true,
    allowNull: false
  },
  privacy: {
    type: Boolean,
    default: false
  },
  paublishDate: {
    type: Date,
    default: () => {
      return new Date();
    }
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: "users"
  },

  comments: [
    {
      user: {
        type: Schema.Types.ObjectId,
        ref: "users"
      },
      text: {
        type: String,
        required: true
      },
      name: {
        type: String
      },
      date: {
        type: Date,
        default: Date.now
      }
    }
  ],
  ratings: [
    {
      user: {
        type: Schema.Types.ObjectId,
        ref: "users"
      },
      rating: {
        type: Number
      }
    }
  ],

  owner: {
    type: Schema.Types.ObjectId,
    ref: "users"
  }
});

module.exports = Story = mongoose.model("stories", StorySchema);
