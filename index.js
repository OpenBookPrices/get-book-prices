var program = require('commander'),
    isbn    = require('./src/isbn'),
    async   = require('async'),
    _       = require('underscore'),
    request = require('superagent');

var apiBase = 'http://api.127.0.0.1.xip.io:3000/v1/';
// var apiBase = 'http://api.openbookprices.com/v1/';

program
  .version('0.0.1')
  .usage('[options] <isbn>')
  .parse(process.argv);

if (program.args.length == 0) {
  program.help();
}

var isbn = isbn.clean(program.args[0]);
if (!isbn ) {
  console.error("The ISBN provided is not valid: '%s'", program.args[0]);
  process.exit(1);
}

var initialURL = apiBase + "books/" + isbn + "/prices";

request
  .get(initialURL)
  .on("error", function (err) {
    console.error(err);
    process.exit();
  })
  .end(handleInitialRequest);


function handleInitialRequest (res) {

  console.log(
    "Fetching prices for '%s' in '%s', shipping to '%s'",
    isbn,
    res.body.request.currency,
    res.body.request.country
  );

  // console.log(res.body);

  async.each(
    res.body.results,
    handleVendorRequest,
    allDone
  );

}

function handleVendorRequest (data, cb) {

  // console.log(data);

  if (data.meta.retryDelay) {
    // console.log("Retrying in %s", data.meta.retryDelay);
    setTimeout(
      function () {
        // console.log("GET %s", data.request.url);

        request
          .get(data.request.url)
          .on('error', function (err) {
            console.warn(err);
            cb();
          })
          .end(function (res) {
            handleVendorRequest(res.body, cb);
          });
      },
      data.meta.retryDelay * 1000
    );
  } else {
    _.each(data.offers, function (offer, condition) {
      console.log(
        "%s (%s) from %s: %s",
        offer.total,
        condition,
        data.vendor.name,
        offer.url || data.vendor.url
      );
    });
    cb();
  }
}

function allDone (err) {
  console.log("all done!");
}