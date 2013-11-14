var _ = require("underscore"),
    assert = require("assert"),
    isbn = require("../src/isbn");

describe( "ISBN", function () {

  describe("cleanup", function () {

    var tests = {
      // valid
      "9780340831496":    "9780340831496",
      "978-0340-831-496": "9780340831496",
      "0340831499":       "9780340831496",
      "020161622X":       "9780201616224",

      // not valid
      "foo":           null,
      "not an isbn":   null,
      "9780340831497": null,
    };

    _.each(
      tests,
      function (expected, dirty) {
        it("should cleanup '" + dirty + "'", function () {
          var clean = isbn.clean(dirty);
          assert.equal(clean, expected);
        });
      }
    );

  });
});
