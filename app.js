const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const path = require("path");
const helmet = require("helmet");
const { celebrate, Joi, errors } = require("celebrate");

const { PORT = 3000 } = process.env;
const allowedOrigins = [
  "http://localhost:3000",
  "https://api.ameer-news.students.nomoredomainssbs.ru",
  "https://ameer-news.students.nomoredomainssbs.ru",
  "https://www.ameer-news.students.nomoredomainssbs.ru",
];

const usersRouter = require(path.join(__dirname, "/routes/users.js"));
const articlesRouter = require(path.join(__dirname, "/routes/articles.js"));

const auth = require("./middlewares/auth");
const { addUser, login } = require("./controllers/users");
const { requestLogger, errorLogger } = require("./middlewares/logger");

const app = express();
app.use(bodyParser.json());

// connect to mongoDB server
mongoose.connect("mongodb://localhost:27017/newsProjectDb");

app.use(cors({ origin: allowedOrigins }));
app.use(helmet());

app.use(requestLogger);

app.use("/users", auth, usersRouter);
app.use("/articles", auth, articlesRouter);

app.get("/crash-test", () => {
  s;
  setTimeout(() => {
    throw new Error("Server will crash now");
  }, 0);
});

app.post(
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
app.post(
  "/signin",
  celebrate({
    body: Joi.object().keys({
      email: Joi.string().required(),
      password: Joi.string().required().min(8),
    }),
  }),
  login
);

app.use(errorLogger);

app.use(errors());

app.use("/", (req, res) => {
  throw new NotFoundError("Requested resource not found");
});

app.use((err, req, res, next) => {
  const { statusCode = 500, message } = err;
  res.status(statusCode).send({
    message: statusCode === 500 ? "An error occurred on the server" : message,
  });
});

app.listen(PORT, () => {
  console.log(`App is listening at port ${PORT}`);
});
