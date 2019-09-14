const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const keys = require("../../config/keys");
const passport = require("passport");
const allowOnly = require("./middleware/roleChecker").allowOnly;
const roles = require("../../config/roles");
const ObjectId = require("mongoose").Types.ObjectId;

// Load User model
const User = require("../../models/User");
const Token = require("../../models/Token");

// Load Input validation
const validateRegisterInput = require("../../validation/register");
const validateLoginInput = require("../../validation/login");
const validateChangePasswordInput = require("../../validation/changePassword");

// Send the email
var transporter = nodemailer.createTransport({
  host: "smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: "534b5efd052c33",
    pass: "87303451a8174c"
  }
});
var rand, mailOptions, host, link;

router.get("/test", (req, res) => {
  res.json({ msg: "USERS  works" });
});

// @route   POST api/users/register
// @desc    Register an User with VERIFICATION
// @access  Public
router.post("/register", (req, res) => {
  const { errors, isValid } = validateRegisterInput(req.body);

  if (!isValid) {
    return res.status(400).json(errors);
  }

  User.findOne({ email: req.body.email })
    .then(user => {
      // Make sure user doesn't already exist
      if (user) {
        errors.email = "Email already exists";
        return res.status(400).json(errors);
      } else {
        // Create and save the user
        var user = new User({
          name: req.body.name,
          email: req.body.email,
          password: req.body.password
        });
        user.save(function(err) {
          if (err) {
            return res.status(500).send({ msg: err.message });
          }

          bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(user.password, salt, (err, hash) => {
              if (err) {
                throw err;
              }

              user.password = hash;
              user
                .save()
                .then(user => {
                  return res.status(200).json(user);
                })
                .catch(err => {
                  return res.status(404).json({ error: err });
                });
            });
          });

          // Create a verification token for this user
          var token = new Token({
            _userId: user._id,
            token: crypto.randomBytes(16).toString("hex")
          });
          // Save the verification token
          token.save(function(err) {
            if (err) {
              return res.status(500).send({ msg: err.message });
            }
            host = req.get("host");
            link =
              "http://" + req.get("host") + "/api/users/verify/" + token.token;
            var mailOptions = {
              from: "no-reply@yourwebapplication.com",
              to: user.email,
              subject: "Please confirm your Email account",
              html:
                "Hello,<br> Please Click on the link to verify your email.<br><a href=" +
                link +
                ">Click here to verify</a>"
            };
            console.log(mailOptions);
            transporter.sendMail(mailOptions, function(error, response) {
              if (error) {
                console.log(error);
                res.end("error");
              } else {
                console.log("Message sent: " + response.message);
                res.json({ msg: "message is sent in your email" });
              }
            });
          });
        });
      }
    })
    .catch(err => {
      return res.status(404).json({ error: err });
    });
});

router.get("/verify/:token", function(req, res) {
  console.log(req.protocol + ":/" + req.get("host"));
  console.log(req.params.token);
  Token.findOne({ token: req.params.token }, function(err, token) {
    if (!token)
      return res.status(400).send({
        type: "not-verified",
        msg: "We were unable to find a valid token. Your token my have expired."
      });

    // If we found a token, find a matching user
    User.findOne({ _id: token._userId }, function(err, user) {
      if (!user)
        return res
          .status(400)
          .send({ msg: "We were unable to find a user for this token." });
      if (user.isVerified)
        return res.status(400).send({
          type: "already-verified",
          msg: "This user has already been verified."
        });

      // Verify and save the user
      user.isVerified = true;
      user.save(function(err) {
        if (err) {
          return res.status(500).send({ msg: err.message });
        }
        res.status(200).send(
          `<html>
            <head>
              <style>
              #login{
                backgorund:lightgreen;
                width:100%;
                height:100%;
                display:flex;
                flex-direction: column;
                align-items:center;
                justify-content:center;
                font-size:2rem;
                font-family: Arial, Helvetica, sans-serif;
              }
              a{
                text-decoration: none;
                color: green;
                transition: all 500ms ease
              }
              a:hover {
                color: orange;
              }
              </style>
            </head>
            <body>
              <div id='login'>
                <p>The account has been verified. Please log in. </p>
                <br>
                <h2>Please log in <a href='http://localhost:4200/login'>login</a></h2>
              </div>
            </body>
          </html>`
        );
      });
    });
  });
});

// @route   POST api/users/login
// @desc    Login an User/Returning JWT Token
// @access  Public
router.post("/login", (req, res) => {
  const { errors, isValid } = validateLoginInput(req.body);

  // Check Validation
  if (!isValid) {
    return res.status(400).json(errors);
  }

  const email = req.body.email;
  const password = req.body.password;

  // Find an user by email
  User.findOne({ email: email }).then(user => {
    // Check for user
    if (!user) {
      errors.email = "User not found";
      return res.status(404).json(errors);
    }

    // Check Password
    bcrypt.compare(password, user.password).then(isMatch => {
      if (isMatch) {
        // User Matched

        // Create JWT Payload
        const payload = {
          id: user.id,
          name: user.name,
          avatar: user.avatar
        };

        // Sign Token
        jwt.sign(
          payload,
          keys.secretOrKey,
          { expiresIn: 86400 },
          (err, token) => {
            res.json({
              success: true,
              token: "Bearer " + token
            });
          }
        );
      } else {
        errors.password = "Password incorrect";
        return res.status(400).json(errors);
      }
    });
    // Check vefirication
    if (user.isVerified === false) {
      errors.verify = "User is not varificied";
      return res.status(401).json(errors);
    }
  });
});

// @route   GET api / users / current
// @desc    Return current user
// @access  Private(Users and Admins)
router.get(
  "/current",
  passport.authenticate("jwt", { session: false }),
  allowOnly(roles.accessLevels.user, (req, res) => {
    res.json({
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role
    });
  })
);

//@Route SET api/users/changeRole
//@Desc Change role of users
//@access Private(admin)
router.post(
  "/changeRole/",
  passport.authenticate("jwt", { session: false }),
  allowOnly(roles.accessLevels.admin, (req, res) => {
    User.findOne({ _id: ObjectId(req.body._id) }).then(user => {
      if (user.role === 2) {
        user.role = 4;
      } else {
        user.role = 2;
      }
      user
        .save()
        .then(user => {
          return res.status(200).json(user);
        })
        .catch(err => {
          return res.status(404).json({ error: err });
        });
    });
  })
);

// @route   SET api/users/changePassword
// @desc    Create new uers password
// @access  Private (Users and Admins)

router.post(
  "/changePassword",
  passport.authenticate("jwt", { session: false }),
  allowOnly(roles.accessLevels.user, (req, res) => {
    const { errors, isValid } = validateChangePasswordInput(req.body);

    //Check validation
    if (!isValid) {
      return res.status(400).json(errors);
    }

    let passwordFields = {};

    passwordFields.password = req.body.password;
    passwordFields.newPassword = req.body.newPassword;

    User.findOne({ _id: ObjectId(req.body._id) }).then(user => {
      if (user) {
        bcrypt.compare(passwordFields.password, user.password).then(isMatch => {
          if (isMatch) {
            user.password = passwordFields.newPassword;

            bcrypt.genSalt(10, (err, salt) => {
              bcrypt.hash(user.password, salt, (err, hash) => {
                if (err) {
                  throw err;
                }

                user.password = hash;
                user
                  .save()
                  .then(user => {
                    return res.status(200).json(user);
                  })
                  .catch(err => {
                    return res.status(404).json({ error: err });
                  });
              });
            });
          } else {
            errors.password = "Password incorrect";
            return res.status(400).json(errors);
          }
        });
      }
    });
  })
);

/// @routes  GET api/users/
/// @desc    Return all users
/// @access  Private(Users, Admins)

router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  allowOnly(roles.accessLevels.user, (req, res) => {
    let errors = {};
    User.find()
      .then(users => {
        if (users.length === 0) {
          errors.no_users = "There are no registered users";
          return res.status(400).json(errors);
        }
        return res.status(200).json(users);
      })
      .catch(err => {
        return res.status(404).json({
          msg: "There was an error fetching users from database",
          err: err
        });
      });
  })
);

/// @routes  set api/users/create new user
/// @desc    create new user as admin
/// @access  Private( Admins)
router.post("/invite", (req, res) => {
  const message = {
    from: "no-reply@yourwebapplication.com",
    to: req.body.email,
    subject: "Please confirm your Email account",
    html: `Hello,<br> Please Click on the link to register your account.<br>
            <h2><a href='http://localhost:4200/registration'>register</a></h2>`
  };

  transporter.sendMail(message, function(err, info) {
    if (err) {
      console.log(err);
      res.end("err");
    } else {
      console.log("Message sent: " + info.message);
      res.json({ msg: "message is sent in your email" });
    }
  });
});

//@route delete api/users
//@desc delete category by id
//@access Private(admin)
router.delete(
  "/:user_id",
  passport.authenticate("jwt", { session: false }),
  allowOnly(roles.accessLevels.admin, (req, res) => {
    Story.deleteMany({ author: ObjectId(req.params.user_id) })
      .then(() => {
        User.findOneAndRemove({ _id: ObjectId(req.params.user_id) })
          .then(result => {
            if (result) {
              return res.status(200).json({ msg: "User removed" });
            }
            return res.status(400).json({ msg: "User does not exists" });
          })
          .catch(err => {
            return res.status(404).json({
              msg: "There was an error removing user",
              err: err
            });
          });
      })
      .catch(err => {
        return res.status(404).json({
          msg: "There was an error removing stories",
          err: err
        });
      });
  })
);
module.exports = router;
