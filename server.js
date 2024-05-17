const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const serverless = require("serverless-http");
const dbPath = path.join(__dirname, "bookStore.db");

const app = express();
app.use(express.json());

let db = null;
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server running at port 3000");
    });
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

initializeDBAndServer();

// GET ALL BOOKS
app.get("/books/", async (req, res) => {
  const getBooksQuery = `SELECT * 
                        FROM books;`;
  const booksQuery = await db.all(getBooksQuery);
  res.send(booksQuery);
});

// GET SPECIFIC BOOK
app.get("/books/:bookId/", async (req, res) => {
  const { bookId } = req.params;
  const getBookQuery = `SELECT * FROM books
                        WHERE book_id = ${bookId};`;
  const bookQuery = await db.get(getBookQuery);
  res.send(bookQuery);
});

// CREATE NEW BOOK
app.post("/books/", async (req, res) => {
  const { name, img, summary } = req.body;
  const createNewBookQuery = `INSERT INTO books (name, img, summary)
                              VALUES ('${name}', '${img}', '${summary}');`;
  await db.run(createNewBookQuery);
  res.send("New book created successfully");
});

// UPDATE BOOK
app.put("/books/:bookId", async (req, res) => {
  const { bookId } = req.params;
  const { name, img, summary } = req.body;
  const updateBookQuery = `UPDATE books
                          SET name = '${name}', img = '${img}', summary = '${summary}'
                          WHERE book_id = ${bookId};`;
  await db.run(updateBookQuery);
  res.send("Book details updated successfully");
});

// DELETE BOOK
app.delete("/books/:bookId", async (req, res) => {
  const { bookId } = req.params;
  const deleteBookQuery = `DELETE FROM books
                          WHERE book_id = ${bookId};`;
  await db.run(deleteBookQuery);
  res.send("Book deleted successfully");
});

module.exports = serverless(app);
