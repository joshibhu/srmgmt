const User = require("../models/user");

checkDuplicateEmail = (req, res, next) => {

  // check if email exist for any other user
  User.findOne({
    email: req.body.email
  }).exec((err, user) => {
    if (err) {
      res.status(500).send({ error: err });
      return;
    }

    if (user) {
      res.status(400).send({ error: "Failed! Email is already in use!" });
      return;
    }
    next();
  });
};

const verifySignUp = {
  checkDuplicateEmail
};

module.exports = verifySignUp;
