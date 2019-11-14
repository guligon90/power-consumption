const express = require('express');
const api = express();
const port = process.env.NODE_PORT;

api.use(require('./api/v1/routes'));

api.listen(
  port,
  () => console.log("Power consumption API listening at port %s", port)
);
