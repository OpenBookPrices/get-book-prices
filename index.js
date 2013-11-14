var program = require('commander'),
    isbn    = require('./src/isbn'),
    request = require('superagent');

var apiBase = 'http://api.127.0.0.1.xip.io:3000/v1/';

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

  console.log(res.body);

}