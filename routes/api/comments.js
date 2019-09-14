const express = require('express');
const router = express.Router();
const allowOnly = require('./middleware/roleChecker').allowOnly;
const ObjectId = require("mongoose").Types.ObjectId;
// const roles = require("../../config/roles");


const Comment = require('../../models/Comment');

//POST comments
router.post(
  "/",
  allowOnly(roles.accessLevels.admin, (req, res) => {

    let categoryFields = {};
    categoryFields.name = req.body.name;

    Comment.findOne({ _id: ObjectId(req.body.id) }).then(category => {
      if (category) {
        Category.findOneAndUpdate(
          { _id: ObjectId(req.body.id) },
          { $set: categoryFields },
          { new: true }
        )
          .then(category => {
            return res.status(200).json(category);
          })
          .catch(err => {
            return res.status(404).json({
              msg: "There was an error updating comments",
              err: err
            });
          });
      } else {
        new Comment(categoryFields)
          .save()
          .then(category => {
            return res.status(200).json(category);
          })
          .catch(err => {
            return res.status(404).json({
              msg: "There was an error saving new comments",
              err: err
            });
          });
      }
    });
  })
);


// @route   GET api/comments/
// @desc    Find All comments
// @access  Private (User, Admin)
router.get(
  "/",
  allowOnly(roles.accessLevels.user, (req, res) => {
    let errors = {};
    Comment.find()
      .then(categories => {
        if (categories.length === 0) {
          errors.no_categories = "There are no comments";
          return res.status(400).json(errors);
        }

        return res.status(200).json(categories);
      })
      .catch(err => {
        return res.status(404).json({
          msg: "There was an error fetching comments from database",
          err: err
        });
      });
  })
);


module.exports = router;