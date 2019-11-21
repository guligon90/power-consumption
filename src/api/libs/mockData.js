const lodash = require("lodash");
const dateTime = require("./dateTime");
const numberFormat = require("./numberFormat");

const generatePowerValue = (minPower, maxPower) => {
  const min = Math.ceil(minPower);
  const max = Math.floor(maxPower);
  let value = Math.random() * (max - min + 1) + min;

  if (value > max) {
    value = Math.floor(value);
  }

  if (value < min) {
    value = Math.ceil(value);
  }

  return numberFormat.roundToDecimals(value);
};

const buildDateTimeRange = (startTimestamp, endTimestamp) => {
  const start =
    startTimestamp.length === 10
      ? new Date(`${startTimestamp} ${process.env.TYPICAL_DAY_START_TIME}`)
      : new Date(startTimestamp);

  const end =
    endTimestamp.length === 10
      ? new Date(`${endTimestamp} ${process.env.TYPICAL_DAY_END_TIME}`)
      : new Date(endTimestamp);

  return {
    startDateTime: start,
    endDateTime: end
  };
};

const generateDailyPowerTimeSeries = (
  startTimestamp,
  endTimestamp,
  minuteStep,
  minPower,
  maxPower
) => {
  const dailyPowerTimeSeries = [];

  // Build datetime range
  const period = buildDateTimeRange(startTimestamp, endTimestamp);

  // Starting time in minutes
  const startTimeInMins = dateTime.convertTimeToMinutes(period.startDateTime);

  // Ending time in minutes
  const endTimeInMins = dateTime.convertTimeToMinutes(period.endDateTime);

  // Loop to increment the time and push results in array
  for (
    let timeInMins = startTimeInMins;
    timeInMins <= endTimeInMins;
    timeInMins += parseInt(minuteStep)
  ) {
    const hours = Math.floor(timeInMins / 60); // Getting hours of day in 0-24 format
    const minutes = timeInMins % 60; // Getting minutes of the hour in 0-55 format

    // Creating time series item, e.g., {'12:37': 0.45}
    const item = {};
    const key = ("0" + hours).slice(-2) + ":" + ("0" + minutes).slice(-2);
    item[key] = generatePowerValue(minPower, maxPower);

    // Pushing item into time series
    dailyPowerTimeSeries.push(item);
  }

  return dailyPowerTimeSeries;
};

const generateDailyConsumptionKWh = (hours, powerValues, minuteStep) => {
  const kWhArray = [];
  let cumulativeKWh = 0.0;
  const cumulativeKWhArray = [];
  const hourStep = minuteStep / 60;

  hours.forEach(hour => {
    const kWhItem = {};
    const cumulativekWhItem = {};
    let kiloWattHour = 0.0;
    const hourPowerValues = [];

    powerValues.array.forEach(item => {
      if (Object.keys(item)[0].startsWith(hour)) {
        hourPowerValues.push(item);
      }
    });

    // Trapezoidal rule for the power values of the hour
    for (let i = 1; i < hourPowerValues.length; i++) {
      const previousPower = Object.values(hourPowerValues[i - 1])[0];
      const actualPower = Object.values(hourPowerValues[i])[0];
      kiloWattHour +=
        0.001 * (1 / 2) * hourStep * (previousPower + actualPower);
    }

    // Push the total energy  for the hour in kWh
    kWhItem[`${hour}:00`] = numberFormat.roundToDecimals(kiloWattHour);
    kWhArray.push(kWhItem);

    // Push the accumulated energy in kWh
    cumulativeKWh += kiloWattHour;
    cumulativekWhItem[`${hour}:00`] = numberFormat.roundToDecimals(
      cumulativeKWh
    );
    cumulativeKWhArray.push(cumulativekWhItem);
  });

  return {
    hourly: kWhArray,
    cumulative: cumulativeKWhArray
  };
};

const generatePowerTimeSeries = (
  startTimestamp,
  endTimestamp,
  minuteStep = process.env.DEFAULT_MINUTE_STEP,
  minPower = process.env.DEFAULT_MIN_POWER_WATTS,
  maxPower = process.env.DEFAULT_MAX_POWER_WATTS
) => {
  const powerTimeSeries = [];
  const periodDays = dateTime.generatePeriodDays(startTimestamp, endTimestamp);

  if (periodDays.length > 0) {
    let count = 1;

    periodDays.forEach(date => {
      let start = startTimestamp;
      let finish = endTimestamp;

      switch (count) {
        case 1:
          finish = `${date} ${process.env.TYPICAL_DAY_END_TIME}`;
          break;
        case periodDays.length:
          start = `${date} ${process.env.TYPICAL_DAY_START_TIME}`;
          break;
        default:
          start = `${date} ${process.env.TYPICAL_DAY_START_TIME}`;
          finish = `${date} ${process.env.TYPICAL_DAY_END_TIME}`;
          break;
      }

      const item = {};
      const dailyHours = dateTime.getDailyHours(start, finish);
      const dailyPower = generateDailyPowerTimeSeries(
        start,
        finish,
        parseInt(minuteStep),
        minPower,
        maxPower
      );
      const kWhValues = generateDailyConsumptionKWh(
        dailyHours,
        dailyPower,
        minuteStep
      );

      lodash.set(item, `${date}.powerValues`, dailyPower);
      lodash.set(item, `${date}.kWhValues`, kWhValues);

      powerTimeSeries.push(item);
      count += 1;
    });
  }

  return powerTimeSeries;
};

const modules = {
  generatePowerValue,
  generatePowerTimeSeries,
  generateDailyConsumptionKWh,
  generateDailyPowerTimeSeries
};

module.exports = modules;
