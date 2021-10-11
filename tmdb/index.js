"use strict";
// const request = require('request');
const axios = require("axios");
const TMDB = require("../config").TMDB;
const createResponse = require("./createResponse");
const MAX_CONFIDENCE = 0.7;

const extractEntity = (nlp, entity) => {
  console.log(nlp);
  let obj = nlp[entity] && nlp[entity][0];
  if (obj && obj.confidence > MAX_CONFIDENCE) {
    return obj.value;
  } else {
    return null;
  }
};

const getBookData = async ({ bookname = null, author = null }) => {
  let uri;
  console.log(bookname);
  if (bookname)
    uri = `https://www.googleapis.com/books/v1/volumes?q=intitle:${bookname}`;
  else uri = `https://www.googleapis.com/books/v1/volumes?q=`;
  let qs = {
    inauthor: "",
    q: bookname,
  };

  if (author) {
    if (bookname) qs.inauthor = `+inauthor:${author}`;
    else qs.inauthor = `inauthor:${author}`;
    // qs.inauthor = `+inauthor:${author}`;
    uri += qs.inauthor;
  }
  const add = `&download=epub&langRestrict="en"&key=${TMDB}`;
  uri += add;
  try {
    var res = await axios.get(uri);
  } catch (e) {
    console.log(e);
  }
  return new Promise((resolve, reject) => {
    if (res) {
      //   console.log(res.data.items);
      resolve(res.data.items);
    } else {
      //   console.log(e);
      reject(e);
    }
  });
};

const getAuthor = async (bookname) => {
  let uri = `https://www.googleapis.com/books/v1/volumes?q=+intitle:${bookname}`;
  const add = `&download=epub&langRestrict="en"&key=${TMDB}`;
  uri += add;
  try {
    var res = await axios.get(uri);
  } catch (e) {
    console.log(e);
  }
  return new Promise((resolve, reject) => {
    if (res) {
      resolve(res.data.items[0].volumeInfo.authors);
    } else {
      //   console.log(e);
      reject(e);
    }
  });
};
module.exports = (nlpData) => {
  return new Promise(async function (resolve, reject) {
    let intent = extractEntity(nlpData, "intent"); // intent has become name
    // resolve(intent);
    var response;
    if (intent) {
      var book = extractEntity(nlpData, "book");
      console.log(book, intent);
      var authors = null;
      var bookdata;
      switch (intent) {
        case "bookinfo":
          let obj = {};
          var author = extractEntity(nlpData, "author");
          if (author != null && book != null) {
            obj.author = author;
            obj.bookname = book;
            bookdata = await getBookData(obj);
          } else if (author == null) {
            obj.bookname = book;
            bookdata = await getBookData(obj);
          } else if (book == null) {
            obj.author = author;
            bookdata = await getBookData(obj);
          }
          // console.log(bookdata, author);
          let arr = [];
          if (author != null) arr.push(author);
          // for(let i = 0; i< 3; i++)
          response = createResponse(intent, bookdata, arr, 0);
          break;
        case "category":
          break;
        case "getauthor":
          // here response is an array of authors
          book = extractEntity(nlpData, "getauthor");
          console.log(book);
          let obj2 = {};
          obj2.bookname = book;

          bookdata = await getBookData(obj2);
          // authors = await getAuthor(book);
          // console.log(authors);

          response = createResponse(intent, bookdata, authors, 0);
          break;
      }

      // Get data (including id) about the movie
      // Get director(s) using the id
      // Create a response and resolve back to the user
      try {
        // let director = await getDirector(movieData.id);
        resolve(response);
      } catch (error) {
        reject(error);
      }
    } else {
      resolve({
        txt: "I'm not sure I understand you!",
        img: null,
      });
    }
  });
};
