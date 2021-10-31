process.env.NODE_ENV = "test";

const request = require("supertest");

const app = require("../app");
const db = require("../db");

let test_isbn;

beforeEach(async () => {
  await db.query("DELETE FROM books");
  const result = await db.query(
    `INSERT INTO books (
          isbn, 
          amazon_url, 
          author, 
          language, 
          pages,
          publisher,
          title,
          year)
        VALUES (
          '0691161518',
          'http://a.co/eobPtX2',
          'Matthew Lane',
          'english',
          '264',
          'Princeton University Press',
          'Power-Up: Unlocking the Hidden Mathematics in Video Games',
          2017
        )
        RETURNING isbn`
  );

  test_isbn = result.rows[0].isbn;
});

afterEach(async () => {
  // delete any data created by test
  await db.query(`DELETE FROM books`);
});

afterAll(async () => {
  // close db connection
  await db.end();
});

describe("POST /books", () => {
  test("creates a new book", async () => {
    const resp = await request(app).post(`/books`).send({
      isbn: "2345968480",
      amazon_url: "https://a.co/somebook",
      author: "Test Jr.",
      language: "english",
      pages: 480,
      publisher: "Penguine",
      title: "How to Test",
      year: 2020,
    });
    expect(resp.statusCode).toBe(201);
    expect(resp.body.book).toHaveProperty("isbn");
  });

  test("makes sure there's a title", async () => {
    const resp = await request(app).post(`/books`).send({
      pages: 999,
    });
    expect(resp.statusCode).toBe(400);
  });
});

describe("GET /books", () => {
  test("gets a list of a book", async () => {
    const resp = await request(app).get(`/books`);
    const { books } = resp.body;
    expect(books).toHaveLength(1);
    expect(books[0]).toHaveProperty("isbn");
    expect(books[0]).toHaveProperty("amazon_url");
  });
});

describe("GET /books/:isbn", () => {
  test("gets a specific book", async () => {
    const resp = await request(app).get(`/books/${test_isbn}`);
    expect(resp.body.book).toHaveProperty("isbn");
    expect(resp.body.book.isbn).toBe(test_isbn);
  });

  test("returns 404 if book not found", async () => {
    const resp = await request(app).get(`/books/3579`);
    expect(resp.statusCode).toBe(404);
  });
});

describe("PUT /books/:isbn", () => {
  test("updates a book", async () => {
    const resp = await request(app).put(`/books/${test_isbn}`).send({
      amazon_url: "https://a.co/updatedbook",
      author: "Test Jr.",
      language: "english",
      pages: 480,
      publisher: "Penguine",
      title: "Updated Book",
      year: 2020,
    });
    expect(resp.body.book).toHaveProperty("isbn");
    expect(resp.body.book.title).toBe("Updated Book");
  });

  test("returns bad request for a wrong update", async () => {
    const resp = await request(app).put(`/books/${test_isbn}`).send({
      isbn: "3345968480",
      mamamia: "this is wrong",
      amazon_url: "https://a.co/updatedbook",
      author: "Test Jr.",
      language: "english",
      pages: 480,
      publisher: "Penguine",
      title: "Updated Book",
      year: 2020,
    });
    expect(resp.statusCode).toBe(400);
  });

  test("returns 404 if book not found", async () => {
    //   delete it first
    await request(app).delete(`/books/${test_isbn}`);
    const resp = await request(app).get(`/books/${test_isbn}`);
    expect(resp.statusCode).toBe(404);
  });
});
