const express = require('express');
const mockData = require('../libs/mockData');
const numberFormat = require('../libs/numberFormat');

const apiRootPath = '/api/v1';
const router = express.Router()

// Middleware that logs the requests made to the API
router.use(function requestLog(req, res, next) {
  console.log(`${req.method.toUpperCase()} ${req.path} :: status ${res.statusCode}`);
  next();
});

router.get(`${apiRootPath}/consumption/**`, (req, res) => {
  let startTimestamp = req.query.startTimestamp;
  let endTimestamp = req.query.endTimestamp;
  let minuteStep = req.query.minuteStep;
  let minPower = req.query.minPower;
  let maxPower = req.query.maxPower;

  let startDt = new Date(startTimestamp);
  let endDt  = new Date(endTimestamp);

  if (endDt.getTime() - startDt.getTime() < 0) {
    res.status(400).send({ message: 'Invalid period (startTimestamp > endTimestamp).'})
  }

  if (!numberFormat.isPositiveInt(minuteStep)) {
    res.status(400).send({ message: 'The minute step must be a positive integer.'})
  }

  if (maxPower - minPower <= 0) {
    res.status(400).send({ message: 'The maximum power must be greater than the minimum power.'})
  }

  const periodSeries = mockData.generatePowerTimeSeries(
    startTimestamp,
    endTimestamp,
    minuteStep,
    minPower,
    maxPower
  );

  res.status(200).send(periodSeries);
});

module.exports = router;
