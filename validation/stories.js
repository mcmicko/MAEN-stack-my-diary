const Validator = require("validator");
const isEmpty = require("./is-empty");

module.exports = function validateBookInput(data) {
  let errors = {};

  data.title = !isEmpty(data.title) ? data.title : "";
  data.content = !isEmpty(data.content) ? data.content : "";

  if (Validator.isEmpty(data.title)) {
    errors.title = "Title field is required";
  }

  if (Validator.isEmpty(data.content)) {
    errors.title = "Content field is required";
  }

  return {
    errors: errors,
    isValid: isEmpty(errors)
  };
};
