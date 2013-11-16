var packageJSON    = require('./package.json'),
    util           = require('util'),
    program        = require('commander'),
    isbn           = require('./src/isbn'),
    async          = require('async'),
    _              = require('underscore'),
    superagent     = require('superagent');

var apiBase = 'http://api.127.0.0.1.xip.io:3000/v1/';
// var apiBase = 'http://api.openbookprices.com/v1/';

var version = packageJSON.version;
var userAgent = util.format("%s v%s", packageJSON.name, packageJSON.version);

function getJSON (url, cb) {
  return superagent
    .get(url)
    .set("User-Agent", userAgent)
    .on("error", function (err) {
      console.error(err);
      process.exit();
    })
    .end(cb);
}


program
  .version(version)
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

getJSON(
  initialURL,
  handleInitialRequest
);


function handleInitialRequest (res) {

  console.log(
    "Fetching prices for '%s' in '%s', shipping to '%s'",
    isbn,
    res.body.request.currency,
    res.body.request.country
  );

  // console.log(res.body);

  async.eachLimit(
    res.body.results,
    6,
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
        getJSON(
          data.request.url,
          function (res) {
            handleVendorRequest(res.body, cb);
          }
        );
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