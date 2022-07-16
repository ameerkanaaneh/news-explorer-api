// for hashing passwords we use the bcrypt module
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const User = require("../models/user");
const AuthError = require("../errors/AuthError");
const NotFoundError = require("../errors/NotFoundError");
const ConflictError = require("../errors/ConflictError");

dotenv.config();
const { NODE_ENV, JWT_SECRET } = process.env;

module.exports.getUser = (req, res, next) => {
  User.findById(req.user._id)
    .then((user) => {
      if (!user) {
        throw new NotFoundError("The user is not found");
      }
      res.send({ data: user });
    })
    .catch(next);
};

module.exports.addUser = (req, res, next) => {
  const { email, password, name } = req.body;
  bcrypt
    .hash(password, 10)
    .then((hash) => User.create({ email, name, password: hash }))
    .then((user) => {
      if (!user) {
        throw new AuthError("Cannot create the user please try again");
      }
      res.send({
        data: {
          email: user.email,
          name: user.name,
          _id: user._id,
          __v: user.__v,
        },
      });
    })
    .catch((err) => {
      if (err.name === "MongoServerError") {
        throw new ConflictError("This email is already in use");
      }
    })
    .catch(next);
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;

  return User.findOne({ email })
    .select("+password")
    .then((user) => {
      if (!user) {
        throw new AuthError("Incorrect email");
      } else {
        req._id = user._id;
        return bcrypt.compare(password, user.password);
      }
    })
    .then((matched) => {
      if (!matched) {
        throw new AuthError("Incorrect password");
      } else {
        const token = jwt.sign(
          { _id: req._id },
          NODE_ENV === "production" ? JWT_SECRET : "super-secret",
          { expiresIn: "7d" }
        );
        res.send({ token });
      }
    })
    .catch(next);
};
