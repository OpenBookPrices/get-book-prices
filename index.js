var program = require('commander');

program
  .version('0.0.1')
  .usage('[options] <isbn>')
  .parse(process.argv);

if (program.args.length == 0) {
  program.help();
}
