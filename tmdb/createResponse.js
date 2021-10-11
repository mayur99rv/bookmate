"use strict";
module.exports = (intent, items, author = [], index) => {
  // Extract movie data
  {
    // console.log("inside" + JSON.stringify(items[i].volumeInfo));
    let { title, description, publishedDate, imageLinks } =
      items[index].volumeInfo;

    // Extract release year
    // let releaseYear = release_date.slice(0, 4);
    let authorname = items[index].volumeInfo.authors[0];

    // Create response based on intent
    if (intent === "bookinfo") {
      let str = `${title} (${publishedDate}):
    description: ${description}`.substring(0, 640);
      return {
        txt: str,
        img: `${imageLinks.thumbnail}`,
      };
    } else if (intent === "getauthor") {
      let str =
        `${title} (${publishedDate}) was authored by ${authorname}.`.substring(
          0,
          640
        );
      return {
        txt: str,
        img: `${imageLinks.thumbnail}`,
      };
    } else if (intent === "category") {
      let str = `${title} was released in ${publishedDate}`;
      return {
        txt: str,
        img: null,
      };
    }
  }
};
