/* eslint-disable no-param-reassign */
const express = require('express');
const booksController = require('../controllers/booksController');

function routes(Book) {
  const bookRouter = express.Router();
  const controller = booksController(Book);
  bookRouter.use('/books/:bookId', (req, res, next) => {
    Book.findById(req.params.bookId, (err, book) => {
      console.log('inside middleware');
      if (err) {
        return res.send(err);
      }
      if (book) {
        req.book = book;
        return next();
      }
      return res.sendStatus(404);
    });
  });

  bookRouter.route('/books')
    .post(controller.post)
    .get(controller.get);

  bookRouter.route('/books/:bookId')
    .get((req, res) => {
      const returnBook = req.book.toJSON();
      returnBook.links = {};
      const genre = req.book.genre.replace(' ', '%20');
      returnBook.links.FilterByThisGenre = `http://${req.headers.host}/api/books/?genre=${genre}`;
      res.json(returnBook);
    })
    .put((req, res) => {
      const { book } = req;
      book.title = req.body.title;
      book.author = req.body.author;
      book.read = req.body.read;
      book.genre = req.body.genre;
      req.book.save((err) => {
        if (err) {
          return res.send(err);
        }
        return res.json(book);
      });
      return res.json(book);
    })
    .delete((req, res) => {
      req.book.remove((err) => {
        if (err) {
          res.send(err);
        }
        return res.send(204);
      });
    })
    .patch((req, res) => {
      console.log(`Book in patch: ${req}`);
      const { book } = req;
      console.log(Object.entries(req.body));
      if (req.body._id) {
        delete req.body._id;
      }
      Object.entries(req.body).forEach((item) => {
        const key = item[0];
        const value = item[1];
        book[key] = value;
      });

      req.book.save((err) => {
        if (err) {
          return res.send(err);
        }
        return res.json(book);
      });
    });
  return bookRouter;
}

module.exports = routes;
