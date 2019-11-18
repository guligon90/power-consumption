const lodash = require('lodash');
const dateTime = require('../libs/dateTime');
const numberFormat = require('../libs/numberFormat');

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
 * Function that receives a object containing the filtered
 * query string parameters and checks if each one is valid,
 * returning a list of messages for each format violation.
 * @param {Object} queryParams 
 * @returns {Array} messages
 */
const validateQueryParams = (queryParams) => {
  let messages = [];

  if (queryParams === {}) {
    return { message: 'You must specify the APi parameters in a query string format.' };
  }

  if (!(queryParams.startTimestamp && queryParams.endTimestamp)) {
    messages.push('The start and finish timestamps must be specified.');
  }

  Object.getOwnPropertyNames(queryParams).forEach(
    attribute => {
      let param = queryParams[attribute];
      let rootMsg = `The ${attribute} parameter`;

      switch (attribute) {
        case 'startTimestamp':
        case 'endTimestamp':
          if (!dateTime.isValidTimestamp(param)) {
            messages.push(`${rootMsg} must be in the format YYYY-MM-DD or YYYY-MM-DD HH:MM.`);
          }
          break;
        case 'minuteStep':
          if (param && !numberFormat.isPositiveInt(param)) {
            messages.push(`${rootMsg} must be a positive integer.`);
          }
          break;
        case 'minPower':
        case 'maxPower':
          if (param && !numberFormat.isNumeric(param)) {
            messages.push(`${rootMsg} must be a number.`);
          }
          break;
        default:
          break;
      }
    }
  );

  let startDt = new Date(queryParams.startTimestamp);
  let endDt  = new Date(queryParams.endTimestamp);

  if (endDt.getTime() - startDt.getTime() < 0) {
    messages.push('The ending datetime must be greater than the starting datetime.');
  }

  if (queryParams.maxPower - queryParams.minPower <= 0) {
    messages.push('The maximum power must be greater than the minimum power.');
  }

  return messages;
};

module.exports = {
  getQueryParams,
  validateQueryParams,
};
