const express = require('express');
const lodash = require('lodash');
const mockData = require('../libs/mockData');
const numberFormat = require('../libs/numberFormat');

const apiRootPath = '/api/v1';
const router = express.Router()

const defaultParams = [
  'startTimestamp',
  'endTimestamp',
  'minuteStep',
  'minPower',
  'maxPower',
]

/**
 * Function that receives the request object
 * and retrieve only the necessary API parameters.
 * @param {Object} req 
 * @returns {Object} queryParams
 */
const getQueryParams = (req) => {
  let queryParams = {};

  Object.getOwnPropertyNames(req).forEach(
    attribute => {
      let value = defaultParams.filter(element => element === attribute)[0]
        ? req[attribute]
        : '';
      if (value !== '') {
        lodash.set(queryParams, attribute, value);
      }
    }
  )

  return queryParams;
};

/**
 * Function that takes the parsed query string paramters,
 * validate its content, and return a array containing
 * messages for each format violation committed.
 * @param {Object} queryParams 
 * @returns {Array} messages
 */
function validateQueryParams(queryParams) {
  let messages = [];

  if (queryParams === {}) {
    console.log('passou aqui');
    return [{ queryParams: 'You must specify the APi parameters in a query string format.' }];
  }

  Object.getOwnPropertyNames(queryParams).forEach(
    attribute => {
      switch(attribute) {
        case 'startTimestamp':
          if (!queryParams[attribute]) {
            messages.push({ attribute: 'You must also specify endTimestamp.' });
          };
          break;
        case 'endTimestamp':
          if (!queryParams[attribute]) {
            messages.push({ attribute: 'You must also specify startTimestamp.' });
          }
          break;
        case 'minuteStep':
          if (queryParams[attribute] && !numberFormat.isPositiveInt(queryParams[attribute])) {
            messages.push({ attribute: 'The minute step must be a positive integer.' });
          }
          break;
        default:
          break;
      }
    }
  );

  return messages;
};

// Middleware that logs the requests made to the API
router.use(function requestLog(req, res, next) {
  console.log(`${req.method.toUpperCase()} ${req.path} :: status ${res.statusCode}`);
  next();
});

router.get(`${apiRootPath}/consumption/**`, (req, res) => {
  let queryParams = getQueryParams(req.query);
  let badRequestMessages = validateQueryParams(queryParams);
  console.log(badRequestMessages);

  if (badRequestMessages === []) {
    res.status(400).send({ messages: badRequestMessages });
  }

  let startDt = new Date(queryParams.startTimestamp);
  let endDt  = new Date(queryParams.endTimestamp);

  if (endDt.getTime() - startDt.getTime() < 0) {
    res.status(400).send({ message: 'Invalid period (startTimestamp > endTimestamp).'})
  }

  if (queryParams.maxPower - queryParams.minPower <= 0) {
    res.status(400).send({ message: 'The maximum power must be greater than the minimum power.'})
  }

  const periodSeries = mockData.generatePowerTimeSeries(
    queryParams.startTimestamp,
    queryParams.endTimestamp,
    queryParams.minuteStep,
    queryParams.minPower,
    queryParams.maxPower
  );

  res.status(200).send(periodSeries);
});

module.exports = router;
