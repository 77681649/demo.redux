require("babel-register")();

const argv = process.argv;

if (argv[2]) {
  require("./src/" + argv[2]);
}
