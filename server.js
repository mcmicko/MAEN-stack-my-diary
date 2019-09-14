const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require('body-parser');
const passport = require('passport');
const cors = require('cors');

const users = require("./routes/api/users");
const stories = require("./routes/api/stories");
// const comments = require("./routes/api/comments");

const app = express();

app.use(cors({ origin: 'http://localhost:4200' }));


// Body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//DB config
const db = require("./config/keys").mongoURI;


// Connect to database
mongoose
  .connect(db, {
    useNewUrlParser: true,
    useCreateIndex: true
  })
  .then(() => {
    console.log("MondoDB Connecetd");
  })
  .catch(err => {
    console.log(err);
  });

// Passport middleware
app.use(passport.initialize());

// Passport Config
require('./config/passport')(passport);



// Use routes
app.use("/api/users", users);
app.use("/api/stories", stories);

// app.use("/api/comments", comments)

app.get("/", (req, res) => res.send("Hello"));

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));

module.exports = app;
