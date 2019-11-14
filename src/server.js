const express = require('express');
const api = express();

api.use(require('./api/v1/routes'));

api.listen(
  () => {
    const port = process.env.PORT;
    console.log("Power consumption API listening at port %s", port);
  }
);
