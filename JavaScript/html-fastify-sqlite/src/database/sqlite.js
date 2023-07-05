/**
 * Module handles database management
 *
 * Server API calls the methods in here to query and update the SQLite database
 */

// Utilities we need
const fs        = require("fs");
const dbFile    = "./.data/library.db";          // cd .data    rm library.db    ls
const exists    = fs.existsSync(dbFile);
const sqlite3   = require("sqlite3").verbose();
const dbWrapper = require("sqlite");
const crypto    = require("crypto-js");
const random    = require('random');
const data_set  = require('./data_set.json');
var db, dynamic, result;

/* 
We're using the sqlite wrapper so that we can make async / await connections
- https://www.npmjs.com/package/sqlite
*/
dbWrapper.open( {filename: dbFile, driver: sqlite3.Database} )
  .then(async (dBase) => {
    db = dBase;

    // We use try and catch blocks throughout to handle any database errors
    try {
      // Database doesn't exist yet
      if (!exists) {
        // Create users table
          console.log("Creating table users");
          await db.run(`
            CREATE TABLE users (
              id       INTEGER PRIMARY KEY AUTOINCREMENT, 
              user     TEXT NOT NULL UNIQUE CHECK (length(user) >= 4), 
              password TEXT NOT NULL        CHECK (length(password) >= 4)
            )
          `);
        // Add default Admin user to the table
          await db.run(`
            INSERT INTO 
            users (user, password) 
            VALUES ("Admin", "${crypto.AES.encrypt(process.env.ADMIN_PASSWORD, process.env.AES_Salt).toString()}")
          `);
        
        // Create books table
          console.log("Creating table books");
          await db.run(`
            CREATE TABLE books (
              isbn        TEXT    NOT NULL UNIQUE CHECK (length(isbn) = 10),
              name        TEXT    NOT NULL UNIQUE, 
              author      TEXT    NOT NULL, 
              pages       INTEGER NOT NULL        CHECK (pages >= 1),
              quantity    INTEGER NOT NULL        CHECK (quantity >= 0),
              image       TEXT,
              description TEXT
            )
          `); 
        // Add books from data_set to the table
          for( let book of data_set ){
            try{
              await db.run(`
                INSERT INTO books 
                VALUES (
                  "${book.isbn}", 
                  "${book.title}", 
                  "${book.authors.filter(Boolean).join(" && ")}", 
                  ${book.pageCount}, 
                  ${random.int(1, 22)},
                  "${ book.thumbnailUrl != null || book.thumbnailUrl != undefined ? book.thumbnailUrl : "" }",
                  "${ [book.shortDescription, book.longDescription].filter(Boolean)[0] === undefined || [book.shortDescription, book.longDescription].filter(Boolean)[0] === null
                      ? ""
                      : [book.shortDescription, book.longDescription].filter(Boolean)[0] }"
                )
              `);
            } catch {}
          }
          result = await db.all("SELECT COUNT(*) as counter FROM books");
          console.log(`${result[0].counter} books inserted`);
                  
        // Create rents table
          console.log("Creating table rents");
          await db.run(`
            CREATE TABLE rents (
              fk_user  INTEGER NOT NULL CHECK (fk_user > 1),
              isbn     TEXT    NOT NULL CHECK (length(isbn) = 10),
              end_date DATE    NOT NULL
            )
          `);

      // We have a database already - log for info
      } else {
        console.log("Database already exists");
        //console.log( await db.all("SELECT * FROM users") );
        //console.log( await db.all("SELECT * FROM books") );
        //console.log( await db.all("SELECT * FROM rents") );
      }
      
    } catch (dbError) {
      console.error(dbError);
    } 
  
  });

// Our server script will call these methods to connect to the db
module.exports = {
  
  // Find user in the database
  getUser: async(user) => {
    console.log("exec db getUser");
    // We use a try catch block in case of db errors
    try {
      result = db.all(`
        SELECT * 
        FROM users 
        WHERE user="${user}"
      `);
      return result;
      
    } catch (dbError) {
      // Database connection error
      console.error(dbError);
    }
  },
  
  // Get all users in the database
  getUsers: async() => {
    console.log("exec db getUsers");
    // We use a try catch block in case of db errors
    try {
      result = db.all(`
        SELECT * 
        FROM users 
      `);
      return result;
      
    } catch (dbError) {
      // Database connection error
      console.error(dbError);
    }
  },
  
  // Create a new user in the database
  createUser: async(user, password) => {
    console.log("exec db createUser");
    // We use a try catch block in case of db errors
    try {
      await db.run(`
        INSERT INTO 
        users (user, password) 
        VALUES ("${user}", "${password}")
      `);
      
    } catch (dbError) {
      // Database connection error
      console.error(dbError);
      throw(dbError);
    }
  },
  
  // Update password of user in the database
  updatePassword: async(id, user, password) => {
    console.log("exec db deleteUser");
    // We use a try catch block in case of db errors
    try {
      await db.run(`
        UPDATE users 
        SET password="${password}"
        WHERE 
          id=${id} AND
          user="${user}"
      `);
      
    } catch (dbError) {
      // Database connection error
      console.error(dbError);
      throw(dbError);
    }
  },
  
  // Delete a user in the database
  deleteUser: async(id, user) => {
    console.log("exec db deleteUser");
    // We use a try catch block in case of db errors
    try {
      await db.run(`
        DELETE FROM users 
        WHERE 
          id = ${id} AND 
          user = "${user}"
      `);
      
    } catch (dbError) {
      // Database connection error
      console.error(dbError);
      throw(dbError);
    }
  },
  
  // Get a book by isbn in the database
  getBook: async(isbn) => {
    console.log("exec db getBook");
    // We use a try catch block in case of db errors
    try {
      result = await db.all(`
        SELECT * 
        FROM books 
        WHERE isbn="${isbn}"
      `);
      return result;
      
    } catch (dbError) {
      // Database connection error
      console.error(dbError);
    }
  },
  
  // Get a book by name in the database
  getBookName: async(name) => {
    console.log("exec db getBookName");
    // We use a try catch block in case of db errors
    try {
      result = await db.all(`
        SELECT * 
        FROM books 
        WHERE lower(name)=lower("${name}")
      `);
      return result;
      
    } catch (dbError) {
      // Database connection error
      console.error(dbError);
    }
  },
  
  // Get all books in the database
  getBooks: async() => {
    console.log("exec db getBooks");
    // We use a try catch block in case of db errors
    try {
      result = await db.all(`
        SELECT * 
        FROM books 
        WHERE quantity > 0 
        ORDER BY name
      `);
      return result;
      
    } catch (dbError) {
      // Database connection error
      console.error(dbError);
    }
  },
  
  // Get all books with no inventory in the database
  getBooks0: async() => {
    console.log("exec db getBooks0");
    // We use a try catch block in case of db errors
    try {
      result = await db.all(`
        SELECT * 
        FROM books 
        WHERE quantity = 0 
        ORDER BY name
      `);
      return result;
      
    } catch (dbError) {
      // Database connection error
      console.error(dbError);
    }
  },
  
  // Update book quantity in the database
  updateBook: async(isbn, name, author, pages, quantity, image, description) => {
    console.log("exec db updateBook");
    // We use a try catch block in case of db errors
    try {
      await db.run(`
        UPDATE books 
        SET 
          name="${name}",
          author="${author}",
          pages=${pages},
          quantity=${quantity},
          image="${image}",
          description="${description}"
        WHERE isbn="${isbn}"
      `);
      
    } catch (dbError) {
      // Database connection error
      console.error(dbError);
      throw(dbError);
    }
  },
  
  // Create book in the database
  createBook: async(isbn, name, author,pages, quantity, image, description) => {
    console.log("exec db createBook");
    // We use a try catch block in case of db errors
    try {
      await db.run(`
        INSERT INTO books 
        VALUES (
          "${isbn}", 
          "${name}", 
          "${author}",
          ${pages},
          ${quantity},
          "${image}",
          "${description}"
        )
      `);
            
    } catch (dbError) {
      // Database connection error
      console.error(dbError);
      throw(dbError);
    }
  },
  
  // Delete a book in the database
  deleteBook: async(isbn, name) => {
    console.log("exec db deleteRent");
    // We use a try catch block in case of db errors
    try {
      await db.run(`
        DELETE FROM books 
        WHERE 
          isbn = ${isbn} AND 
          name = "${name}"
      `);
      
    } catch (dbError) {
      // Database connection error
      console.error(dbError);
      throw(dbError);
    }
  },
  
  // Create a rent in the database
  createRent: async(id_user, isbn, days) => {
    console.log("exec db createRent");
    // We use a try catch block in case of db errors
    try {
      await db.run(`
        INSERT INTO rents 
        VALUES (
          ${id_user}, 
          "${isbn}", 
          date('now', '+${days} day')
        )
      `);
      
    } catch (dbError) {
      // Database connection error
      console.error(dbError);
      throw(dbError);
    }
  },
  
  // Find duplicate rent in the database
  duplicatedRent: async(user, isbn) => {
    console.log("exec db duplicatedRent");
    // We use a try catch block in case of db errors
    try {
      result = await db.all(`
        SELECT * 
        FROM rents r 
        JOIN users u ON 
          r.fk_user = u.id
        WHERE 
          u.user = "${user}" AND 
          r.isbn = "${isbn}"
      `);
      return result;
      
    } catch (dbError) {
      // Database connection error
      console.error(dbError);
    }
  },
  
  // Delete a rent in the database
  deleteRent: async(id_user, isbn) => {
    console.log("exec db deleteRent");
    // We use a try catch block in case of db errors
    try {
      await db.run(`
        DELETE FROM rents 
        WHERE 
          fk_user = ${id_user} AND 
          isbn = "${isbn}"
      `);
      
    } catch (dbError) {
      // Database connection error
      console.error(dbError);
      throw(dbError);
    }
  },
  
  // Get all rents from user in the database
  getUserRents: async(user) => {
    console.log("exec db getUserRents");
    // We use a try catch block in case of db errors
    try {
      user != "Admin"
        ? dynamic = `WHERE u.user = "${user}" ORDER BY end_date`      // User  = User rents
        : dynamic = "ORDER BY end_date";                              // Admin = All rents
      result = await db.all(`
        SELECT 
          b.name, 
          r.isbn, 
          STRFTIME('%d/%m/%Y', r.end_date) as end_date, 
          u.user 
        FROM rents r 
        JOIN books b ON 
          r.isbn = b.isbn 
        JOIN users u ON 
          r.fk_user = u.id
        ${dynamic}
      `);
      return result;
      
    } catch (dbError) {
      // Database connection error
      console.error(dbError);
    }
  }
  
};