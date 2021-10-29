process.env.NODE_ENV = "test";

const db = require("../db");
const Book = require("../models/book");

describe("Test Book class", () => {
  beforeEach(async () => {
    await db.query("DELETE FROM books");
    let book = await Book.create({
      isbn: "0691161518",
      amazon_url: "http://a.co/eobPtX2",
      author: "Matthew Lane",
      language: "english",
      pages: 264,
      publisher: "Princeton University Press",
      title: "Power-Up: Unlocking the Hidden Mathematics in Video Games",
      year: 2017,
    });
  });
});
