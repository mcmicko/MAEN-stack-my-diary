const Validator = require("validator");
const isEmpty = require("./is-empty");

module.exports = function validateChangePasswordInput(data) {
  let errors = {};

  data.password = !isEmpty(data.password) ? data.password : "";
  data.newPassword = !isEmpty(data.newPassword) ? data.newPassword : "";
  data.newPassword2 = !isEmpty(data.newPassword2) ? data.newPassword2 : "";

  if (Validator.isEmpty(data.password)) {
    errors.password = "Password field is required";
  }

  if (!Validator.isLength(data.newPassword, { min: 6, max: 30 })) {
    errors.newPassword = "Password must be at least 6 charactes";
  }

  if (Validator.isEmpty(data.newPassword)) {
    errors.newPassword = "Password field is required";
  }
  if (!Validator.equals(data.newPassword, data.newPassword2)) {
    errors.newPassword2 = "Password must match";
  }

  if (Validator.isEmpty(data.newPassword2)) {
    errors.newPassword2 = "Confirm password field is required";
  }

  return {
    errors: errors,
    isValid: isEmpty(errors)
  };
};
