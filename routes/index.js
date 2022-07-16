const router = require("express").Router();
const usersRouter = require("./users");
const articlesRouter = require("./articles");

const auth = require("../middlewares/auth");

const { celebrate, Joi } = require("celebrate");

const { addUser, login } = require("../controllers/users");

router.post(
  "/signup",
  celebrate({
    body: Joi.object().keys({
      email: Joi.string().required(),
      password: Joi.string().required().min(8),
      name: Joi.string().min(2).max(30).required(),
    }),
  }),
  addUser
);
router.post(
  "/signin",
  celebrate({
    body: Joi.object().keys({
      email: Joi.string().required(),
      password: Joi.string().required().min(8),
    }),
  }),
  login
);

router.use("/users", auth, usersRouter);
router.use("/articles", auth, articlesRouter);

module.exports = router;
