const express = require('express');
const mockData = require('../libs/mockData');
const validation = require('./validation');

const apiRootPath = '/api/v1';
const router = express.Router()

// Middleware that logs the requests made to the API
router.use(function requestLog(req, res, next) {
  console.log(`${req.method.toUpperCase()} ${req.path} :: status ${res.statusCode}`);
  next();
});

router.get(`${apiRootPath}/consumption/**`, (req, res) => {
  let queryParams = validation.getQueryParams(req.query);
  let messages = validation.validateQueryParams(queryParams);

  if (messages.length > 0) {
    res.status(400).send({ api_warnings: messages });
  } else {
    const periodSeries = mockData.generatePowerTimeSeries(
      queryParams.startTimestamp,
      queryParams.endTimestamp,
      queryParams.minuteStep,
      queryParams.minPower,
      queryParams.maxPower
    );
  
    res.status(200).send(periodSeries);
  }
});

module.exports = router;
