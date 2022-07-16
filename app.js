const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const helmet = require("helmet");
const { errorsHandler } = require("./errors/errorsHandler");

const mainRoute = require("./routes/index");

dotenv.config();

const { PORT = 3000, DATABASE_ADDRESS, NODE_ENV } = process.env;
const allowedOrigins = [
  "http://localhost:3000",
  "https://api.ameer-news.students.nomoredomainssbs.ru",
  "https://ameer-news.students.nomoredomainssbs.ru",
  "https://www.ameer-news.students.nomoredomainssbs.ru",
];

const { requestLogger, errorLogger } = require("./middlewares/logger");

const app = express();
app.use(bodyParser.json());

const NotFoundError = require("./errors/NotFoundError");

// connect to mongoDB server
mongoose.connect(
  NODE_ENV === "production"
    ? DATABASE_ADDRESS
    : "mongodb://localhost:27017/newsProjectDb"
);

app.use(cors({ origin: allowedOrigins }));
app.use(helmet());

app.use(requestLogger);

app.get("/crash-test", () => {
  setTimeout(() => {
    throw new Error("Server will crash now");
  }, 0);
});

app.use(mainRoute);
app.use(errorLogger);

app.use("/", (req, res) => {
  throw new NotFoundError("Requested resource not found");
});

app.use(errorsHandler);

app.listen(PORT, () => {
  console.log(`App is listening at port ${PORT}`);
});
