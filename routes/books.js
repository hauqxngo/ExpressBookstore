const express = require("express");
const router = new express.Router();
const Book = require("../models/book");
const jsonschema = require("jsonschema");
const bookSchema = require("../schemas/bookSchema.json");
const bookSchemaUpdate = require("../schemas/bookSchemaUpdate.json");
const ExpressError = require("../expressError");

/** GET / => {books: [book, ...]}  */

router.get("/", async function (req, res, next) {
  try {
    const books = await Book.findAll(req.query);
    return res.json({ books });
  } catch (err) {
    return next(err);
  }
});

/** GET /[id]  => {book: book} */

router.get("/:isbn", async function (req, res, next) {
  try {
    const book = await Book.findOne(req.params.isbn);
    return res.json({ book });
  } catch (err) {
    return next(err);
  }
});

/** POST /   bookData => {book: newBook}  */

router.post("/", async function (req, res, next) {
  try {
    const result = jsonschema.validate(req.body, bookSchema);

    if (!result.valid) {
      let listOfErrors = result.errors.map((err) => err.stack);
      let err = new ExpressError(listOfErrors, 400);
      return next(err);
    }

    const book = await Book.create(req.body);
    return res.status(201).json({ book });
  } catch (err) {
    return next(err);
  }
});

/** PUT /[isbn]   bookData => {book: updatedBook}  */

router.put("/:isbn", async function (req, res, next) {
  try {
    if ("isbn" in req.body) {
      const err = new ExpressError({ message: "Not allowed." }, 400);
      return next(err);
    }

    const result = jsonschema.validate(req.body, bookSchemaUpdate);
    if (!result.valid) {
      const listOfErrors = result.errors.map((e) => e.stack);
      const err = new ExpressError(listOfErrors, 400);
      return next(err);
    }

    const book = await Book.update(req.params.isbn, req.body);
    return res.json({ book });
  } catch (err) {
    return next(err);
  }
});

/** DELETE /[isbn]   => {message: "Book deleted"} */

router.delete("/:isbn", async function (req, res, next) {
  try {
    await Book.remove(req.params.isbn);
    return res.json({ message: "Book deleted" });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
