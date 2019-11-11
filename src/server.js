const express = require('express');
const api = express();
const port = process.argv.slice(2)[0];

api.use(require('./api/v1/routes'));

api.listen(
  port,
  () => {
    console.log("Power consumption API listening at port %s", port);
  }
);
