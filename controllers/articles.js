const Article = require('../models/article');
const BadRequestError = require('../errors/BadRequestError');
const NotFoundError = require('../errors/NotFoundError');
const AuthError = require('../errors/AuthError');

module.exports.getArticles = (req, res, next) => {
  Article.find({ owner: req.user._id })
    .then((articles) => {
      res.send({ data: articles });
    })
    .catch(next);
};

module.exports.addArticle = (req, res, next) => {
  const {
    keyword, title, text, date, source, link, image,
  } = req.body;
  Article.create({
    keyword,
    title,
    text,
    date,
    source,
    link,
    image,
    owner: req.user._id,
  })
    .then((article) => {
      if (!article) {
        throw new BadRequestError('Unable to create card, Please try again');
      }
      res.send({ data: article });
    })
    .catch(next);
};

module.exports.deleteArticle = (req, res, next) => {
  const { articleId } = req.params;
  Article.findByIdAndRemove(articleId)
    .then((article) => {
      if (article && article.owner.toString() === req.user._id.toString()) {
        Article.deleteOne(article).then((deletedArticle) => {
          res.status(200).send({ data: deletedArticle });
        });
      } else if (!article) {
        throw new NotFoundError('Article not found');
      } else {
        throw new AuthError(
          'You should be the owner of the article in order to delete it',
        );
      }
    })
    .catch(next);
};
