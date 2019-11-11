const lodash = require('lodash');
const dateTime = require('./dateTime');
const numberFormat = require('./numberFormat');

const typicalDayStartTime = process.env.TYPICAL_DAY_START_TIME
  ? process.env.TYPICAL_DAY_START_TIME
  : '00:00';

const typicalDayFinishTime = process.env.TYPICAL_DAY_END_TIME
  ? process.env.TYPICAL_DAY_END_TIME
  : '23:59';

const generatePowerValue = (minPower, maxPower) => {
  let min = Math.ceil(minPower);
  let max = Math.floor(maxPower);
  let value = Math.random() * (max - min + 1) + min;

  if (value > max) {
    value = Math.floor(value)
  }

  if (value < min) {
    value = Math.ceil(value)
  }

  return numberFormat.roundToDecimals(value);
};

const getDailyCumulativekWh = (hours, powerValues, minuteStep) => {
  var kWhArray = []
  var cumulativeKWh = 0.0;
  const hourStep = minuteStep/60;

  hours.map(hour => {
    let kWhItem = {}
    let kiloWattHour = 0.0;
    let hourPowerValues = [];

    // Get the power values for a specific hour.
    powerValues.map(item => {
      if (Object.keys(item)[0].startsWith(hour)) {
        hourPowerValues.push(item)
      }
    })

    // Trapezoidal rule for the power values of the hour
    for (i=1; i<hourPowerValues.length; i++) {
      let previousPower = Object.values(hourPowerValues[i-1])[0];
      let actualPower = Object.values(hourPowerValues[i])[0];
      kiloWattHour += (0.001)*(1/2)*hourStep*(previousPower + actualPower);
    }

    // Accumulate the energy in kWh
    // and push the result into an array.
    cumulativeKWh += kiloWattHour;
    kWhItem[`${hour}:00`] = cumulativeKWh;
    kWhArray.push(kWhItem);
  })

  return kWhArray;
};

const generateDailyPowerTimeSeries = (
  startTimestamp,
  endTimestamp,
  minuteStep,
  minPower,
  maxPower
) => {
  const startDateTime = new Date(startTimestamp);
  const endDateTime = new Date(endTimestamp);
  let dailyPowerTimeSeries = [];

  // Starting time in minutes
  let startTimeInMins = dateTime.convertTimeToMinutes(startDateTime);

  // Ending time in minutes
  const endTimeInMins = dateTime.convertTimeToMinutes(endDateTime);

  // Loop to increment the time and push results in array
  for (let timeInMins=startTimeInMins; timeInMins <= endTimeInMins; timeInMins += parseInt(minuteStep)) {
    let hours = Math.floor(timeInMins/60);     // Getting hours of day in 0-24 format
    let minutes = (timeInMins % 60);           // Getting minutes of the hour in 0-55 format

    // Creating time series item, e.g., {'12:37': 0.45}
    let item = {}
    let key = ("0" + hours).slice(-2) + ':' + ("0" + minutes).slice(-2);
    item[key] = generatePowerValue(minPower, maxPower);

    // Pushing item into time series
    dailyPowerTimeSeries.push(item);
  }

  return dailyPowerTimeSeries;
};

const generatePowerTimeSeries = (
  startTimestamp,
  endTimestamp,
  minuteStep = process.env.DEFAULT_MINUTE_STEP,
  minPower = process.env.DEFAULT_MIN_POWER_WATTS,
  maxPower = process.env.DEFAULT_MAX_POWER_WATTS
) => {
  var powerTimeSeries = [];
  const periodDays = dateTime.generatePeriodDays(startTimestamp, endTimestamp);

  if (periodDays.length > 0) {
    var count = 1;

    periodDays.map(date => {
      let start = startTimestamp;
      let finish = endTimestamp;

      switch(count) {
        case 1:
          finish = `${date} ${typicalDayFinishTime}`;
          break;
        case (periodDays.length):
          start = `${date} ${typicalDayStartTime}`;
          break;
        default:
          start = `${date} ${typicalDayStartTime}`;
          finish = `${date} ${typicalDayFinishTime}`;
          break;
      }

      let item = {};
      let dailyHours = dateTime.getDailyHours(start, finish);
      let dailyPower = generateDailyPowerTimeSeries(start, finish, parseInt(minuteStep), minPower, maxPower);
      let dailyCumulativeKWh = getDailyCumulativekWh(dailyHours, dailyPower, minuteStep);

      lodash.set(item,`${date}.powerValues`, dailyPower);
      lodash.set(item, `${date}.cumulativeKWh`, dailyCumulativeKWh);

      powerTimeSeries.push(item);
      count += 1;
    })
  }

  return powerTimeSeries;
};

module.exports = {
  generatePowerValue,
  generatePowerTimeSeries,
  getDailyCumulativekWh,
  generateDailyPowerTimeSeries,
};
