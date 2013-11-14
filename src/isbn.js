var ean = require("ean");


module.exports.clean = function (dirty) {

  var clean = dirty.replace(/[^\dx]/ig, "");

  // isbn10 to isbn13 - see http://www.isbn-13.info/ for algorithm
  if (clean.length == 10) {
    clean = "978" + clean.substr(0, 9);
    clean += ean.checksum(clean.split(""));
  }

  if (clean && ean.isValid(clean)) {
    return clean;
  }

  // Not clean
  return null;

};
