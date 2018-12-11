const fs = require("fs-extra");

fs.copy("chrome-extension", "build", err => {
  if (err) {
    return console.error(err);
  }
  console.log("success!");
});
