'use strict';

// DONE: Install and require the NPM Postgres package 'pg' into your server.js, and ensure that it is then listed as a dependency in your package.json
const pg = require('pg');
const fs = require('fs');
const express = require('express');

// REVIEW: Require in body-parser for post requests in our server. If you want to know more about what this does, read the docs!
const bodyParser = require('body-parser');
const PORT = process.env.PORT || 3000;
const app = express();

// DONE: Complete the connection string (conString) for the URL that will connect to your local Postgres database.

// Windows and Linux users: You should have retained the user/password from the pre-work for this course.
// Your OS may require that your conString is composed of additional information including user and password.
const conString = 'postgres://postgres:password@localhost:5432/postgres';

// Mac:
// const conString = 'postgres://localhost:5432';


// DONE: Our pg module has a Client constructor that accepts one argument: the conString we just defined.
// This is how it knows the URL and, for Windows and Linux users, our username and password for our database when client.connect() is called below. Thus, we need to pass our conString into our pg.Client() call.

const client = new pg.Client(conString);

// REVIEW: Use the client object to connect to our DB.
client.connect();


// REVIEW: Install the middleware plugins so that our app can use the body-parser module.
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('./public'));


// REVIEW: Routes for requesting HTML resources
app.get('/new', (request, response) => {
  // COMMENTED: What number(s) of the full-stack-diagram.png image correspond to the following line of code? Which method of article.js is interacting with this particular piece of `server.js`? What part of CRUD is being enacted/managed by this particular piece of code?
  // Steps 1, 2, and 5 of the full-stack-diagram
  // There is no link to article.js
  // This is a READ type of command
  response.sendFile('new.html', {root: './public'});
});


// REVIEW: Routes for making API calls to use CRUD Operations on our database
app.get('/articles', (request, response) => {
  // COMMENTED: What number(s) of the full-stack-diagram.png image correspond to the following line of code? Which method of article.js is interacting with this particular piece of `server.js`? What part of CRUD is being enacted/managed by this particular piece of code?
  // Step 3 and 4 of the full-stack-diagram
  // Article.fetchAll() is interacting with line
  // This is a READ type of command
  client.query('SELECT * FROM articles')
    .then(function(result) {
      response.send(result.rows);
    })
    .catch(function(err) {
      console.error(err)
    })
});

app.post('/articles', (request, response) => {
  // COMMENTED: What number(s) of the full-stack-diagram.png image correspond to the following line of code? Which method of article.js is interacting with this particular piece of `server.js`? What part of CRUD is being enacted/managed by this particular piece of code?
  // Step 3 of the full-stack-diagram
  // Article.prototype.insertRecord
  // This is a CREATE type of command
  client.query(
    `INSERT INTO
    articles(title, author, "authorUrl", category, "publishedOn", body)
    VALUES ($1, $2, $3, $4, $5, $6);
    `,
    [
      request.body.title,
      request.body.author,
      request.body.authorUrl,
      request.body.category,
      request.body.publishedOn,
      request.body.body
    ]
  )
    .then(function() {
      response.send('insert complete')
    })
    .catch(function(err) {
      console.error(err);
    });
});

app.put('/articles/:id', (request, response) => {
  // COMMENTED: What number(s) of the full-stack-diagram.png image correspond to the following line of code? Which method of article.js is interacting with this particular piece of `server.js`? What part of CRUD is being enacted/managed by this particular piece of code?
  // Step 3 of the full-stack-diagram
  // Article.prototype.updateRecord
  // This is a UPDATE type of command
  client.query(
    `UPDATE articles
    SET
      title=$1, author=$2, "authorUrl"=$3, category=$4, "publishedOn"=$5, body=$6
    WHERE article_id=$7;
    `,
    [
      request.body.title,
      request.body.author,
      request.body.authorUrl,
      request.body.category,
      request.body.publishedOn,
      request.body.body,
      request.params.id
    ]
  )
    .then(() => {
      response.send('update complete')
    })
    .catch(err => {
      console.error(err);
    });
});

app.delete('/articles/:id', (request, response) => {
  // COMMENTED: What number(s) of the full-stack-diagram.png image correspond to the following line of code? Which method of article.js is interacting with this particular piece of `server.js`? What part of CRUD is being enacted/managed by this particular piece of code?
  // Step 3 of the full-stack-diagram
  // Article.prototype.deleteRecord
  // This is a DELETE type of command
  client.query(
    `DELETE FROM articles WHERE article_id=$1;`,
    [request.params.id]
  )
    .then(() => {
      response.send('Delete complete')
    })
    .catch(err => {
      console.error(err);
    });
});

app.delete('/articles', (request, response) => {
  // COMMENTED: What number(s) of the full-stack-diagram.png image correspond to the following line of code? Which method of article.js is interacting with this particular piece of `server.js`? What part of CRUD is being enacted/managed by this particular piece of code?
  // Step 3 of the full-stack-diagram
  // Article.truncateTable
  // This is a DELETE type of command
  client.query(
    'DELETE FROM articles;'
  )
    .then(() => {
      response.send('Delete complete')
    })
    .catch(err => {
      console.error(err);
    });
});

// COMMENTED: What is this function invocation doing?
// loadDB is a function that creates a new table if it doesnt already exist.
loadDB();

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}!`);
});


//////// ** DATABASE LOADER ** ////////
////////////////////////////////////////
function loadArticles() {
  // COMMENTED: What number(s) of the full-stack-diagram.png image correspond to the following line of code? Which method of article.js is interacting with this particular piece of `server.js`? What part of CRUD is being enacted/managed by this particular piece of code?
  // This line of code is part 3 of the full-stack-diagram. This function is populating the database with data from the JSON file.This function is interacting with the insertRecord method.
  client.query('SELECT COUNT(*) FROM articles')
    .then(result => {
    // REVIEW: result.rows is an array of objects that Postgres returns as a response to a query.
    // If there is nothing on the table, then result.rows[0] will be undefined, which will make count undefined. parseInt(undefined) returns NaN. !NaN evaluates to true.
    // Therefore, if there is nothing on the table, line 158 will evaluate to true and enter into the code block.
      if(!parseInt(result.rows[0].count)) {
        fs.readFile('./public/data/hackerIpsum.json', (err, fd) => {
          JSON.parse(fd.toString()).forEach(ele => {
            client.query(`
              INSERT INTO
              articles(title, author, "authorUrl", category, "publishedOn", body)
              VALUES ($1, $2, $3, $4, $5, $6);
            `,
              [ele.title, ele.author, ele.authorUrl, ele.category, ele.publishedOn, ele.body]
            )
          })
        })
      }
    })
}

function loadDB() {
  // COMMENTED: What number(s) of the full-stack-diagram.png image correspond to the following line of code? Which method of article.js is interacting with this particular piece of `server.js`? What part of CRUD is being enacted/managed by this particular piece of code?
  // Step 3 of the full-stack-diagram.
  // This function also interacts with insertRecord method through the loadArticles call. This is a CREATE type of command.
  client.query(`
    CREATE TABLE IF NOT EXISTS articles (
      article_id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      author VARCHAR(255) NOT NULL,
      "authorUrl" VARCHAR (255),
      category VARCHAR(20),
      "publishedOn" DATE,
      body TEXT NOT NULL);`
  )
    .then(() => {
      loadArticles();
    })
    .catch(err => {
      console.error(err);
    });
}
