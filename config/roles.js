const userRoles = {
  user: 2,
  admin: 4
};

userRoles.accessLevels = {
  user: userRoles.user | userRoles.admin, // Can be accessed by users and admins
  admin: userRoles.admin // Can be accessed by admins
};

module.exports = userRoles;
