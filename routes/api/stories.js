const express = require("express");
const router = express.Router();
const passport = require("passport");
const allowOnly = require("./middleware/roleChecker").allowOnly;
const roles = require("../../config/roles");
const ObjectId = require("mongoose").Types.ObjectId;

//Load Validation
const validateStoryInput = require("../../validation/stories");

// Load models
const Story = require("../../models/Story");

// @route   GET api/stories/users/:user_id
// @desc    Find stories by User_Id
// @accescc Private (User, admin)
router.get(
  "/user/:user_id",
  passport.authenticate("jwt", { session: false }),
  allowOnly(roles.accessLevels.user, (req, res) => {
    let errors = {};
    Story.find({
      $or: [
        { author: ObjectId(req.params.user_id) },
        { owner: ObjectId(req.params.user_id) }
      ]
    })
      .populate("author", ["name"])
      .then(stories => {
        if (stories.length === 0) {
          errors.no_stories = "There are no story published";
          return res.status(400).json(errors);
        }
        return res.status(200).json(stories);
      })
      .catch(err => {
        return res.status(404).json({
          msg: "There was an error fetching stories from database",
          err: err
        });
      });
  })
);

// POST story
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  allowOnly(roles.accessLevels.user, (req, res) => {
    const { errors, isValid } = validateStoryInput(req.body);

    // Check Validation
    if (!isValid) {
      return res.status(400).json(errors);
    }

    let storyFields = {};

    storyFields.title = req.body.title;
    storyFields.content = req.body.content;
    storyFields.privacy = req.body.privacy;
    storyFields.author = req.body.author;

    Story.findOne({ _id: ObjectId(req.body._id) }).then(story => {
      if (story) {
        Story.findOneAndUpdate(
          { _id: ObjectId(req.body._id) },
          { $set: storyFields },
          { new: true }
        )
          .then(story => {
            return res.status(200).json(story);
          })
          .catch(err => {
            return res.status(404).json({
              msg: "There was an error updating category",
              err: err
            });
          });
      } else {
        new Story(storyFields)
          .save()
          .then(story => {
            return res.status(200).json(story);
          })
          .catch(err => {
            return res.status(404).json({
              msg: "There was an error saving new Story",
              err: err
            });
          });
      }
    });
  })
);

// @route   GET api/stories/
// @desc    find ALL STORIES
// @accescc Private (User, admin)
router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  allowOnly(roles.accessLevels.user, (req, res) => {
    let errors = {};
    Story.find({ privacy: false, owner: null })
      .populate("author", ["name"])
      .then(stories => {
        if (stories.length === 0) {
          errors.no_stories = "There are no stories published";
          return res.status(200).json(errors);
        }
        return res.status(200).json(stories);
      })
      .catch(err => {
        return res.status(404).json({
          msg: "There was an error fetching stories from database",
          err: err
        });
      });
  })
);

// @route   DELETE api/stories/:story_id
// @desc    Delete stories by Id
// @access  Private(User, Admin)
router.delete(
  "/:story_id",
  passport.authenticate("jwt", { session: false }),
  allowOnly(roles.accessLevels.user, (req, res) => {
    Story.findOneAndRemove({ _id: ObjectId(req.params.story_id) })
      .then(result => {
        if (result) {
          return res.status(200).json({ msg: "Story removed" });
        }
        return res.status(400).json({ msg: "Story does not exist" });
      })
      .catch(err => {
        return res.status(404).json({
          msg: "There was an error removing a story",
          err: err
        });
      });
  })
);
// POST COMMENT
router.post(
  "/comment/:id",
  passport.authenticate("jwt", { session: false }),
  allowOnly(roles.accessLevels.user, (req, res) => {
    Story.findById(req.params.id)
      .then(story => {
        const newComment = {
          user: req.user._id,
          text: req.body.text,
          name: req.body.name
        };
        story.comments.unshift(newComment);
        story.save().then(post => res.json(post));
      })
      .catch(err => res.status(404).json({ storyNotFound: "no story found" }));
  })
);

// DELETE COMMENT
// api/stories/comment/:id/:comment_id
router.delete(
  "/comment/:id/:comment_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Story.findById(req.params.id)
      .then(story => {
        //check to see if comment exists
        if (
          story.comments.filter(
            comment => comment._id.toString() === req.params.comment_id
          ).length === 0
        ) {
          return res
            .status(404)
            .json({ commentnotexist: "Comment does not exist" });
        }
        //get remove index
        const removeIndex = story.comments
          .map(item => item._id.toString())
          .indexOf(req.params.comment_id);

        //splice comment out of array
        story.comments.splice(removeIndex, 1);
        story.save().then(story => res.json(story));
      })
      .catch(err => res.status(404).json({ postnotfound: "not found story" }));
  }
);

// @route   POST api/storie/saveStory
// @desc    Save public story from another user
// @access  Public(user, admin)
router.post(
  "/saveStory/:story_id",
  passport.authenticate("jwt", { session: false }),
  allowOnly(roles.accessLevels.user, (req, res) => {
    User.findOne({ _id: ObjectId(req.body.userId) })
      .then(user => {
        if (user) {
          Story.findOne({ _id: ObjectId(req.params.story_id) })
            .then(story => {
              if (story) {
                let newStory = {};
                newStory.author = story.author;
                newStory.title = story.title;
                newStory.content = story.content;
                newStory.owner = user._id;
                newStory.paublishDate = story.paublishDate;
                newStory.ratings = story.ratings;

                new Story(newStory).save().then(story => {
                  res.status(200).json(story);
                });
              }
            })
            .catch(err => {
              return res.status(404).json({
                msg: "There was an error fetching stories from database",
                err: err
              });
            });
        }
      })
      .catch(err => {
        return res.status(404).json({
          msg: "There was an error fetching stories from database",
          err: err
        });
      });
  })
);

// @route   POST  api/stories/rate
// @desc    User to rate a story
// @access  Private(user, admin)

router.post(
  "/rate/:storyId",
  passport.authenticate("jwt", { session: false }),
  allowOnly(roles.accessLevels.user, (req, res) => {
    Story.findOne({
      _id: ObjectId(req.params.storyId)
    })
      .then(story => {
        if (story) {
          const newRating = {
            user: req.body.user,
            rating: req.body.rating
          };

          story.ratings.unshift(newRating);

          story.save().then(post => res.json(post));
        }
      })
      .catch(err => {
        return res.status(404).json({
          msg: "There was an error fetching stories from database",
          err: err
        });
      });
  })
);

// SEARCH STORY
router.get(
  "/searchStory/:title",
  passport.authenticate("jwt", { session: false }),
  allowOnly(roles.accessLevels.user, (req, res) => {
    let errors = {};
    Story.find({
      title: { $regex: ".*" + req.params.title + ".*", $options: "i" },
      privacy: false
    })
      .populate("author", ["name"])
      .then(stories => {
        if (stories.length === 0) {
          errors.noStories = "There are no stories published with this title";
          return res.status(400).json(errors);
        }
        return res.status(200).json(stories);
      })
      .catch(err => {
        return res.status(404).json({
          msg: "There was an error fetching stories from database",
          err: err
        });
      });
  })
);

module.exports = router;
