const dateTime = require("../libs/dateTime");
const numberFormat = require("../libs/numberFormat");

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

const generateDailyPowerTimeSeries = (
  startTimestamp,
  endTimestamp,
  minuteStep,
  minPower,
  maxPower
) => {
  const dailyPowerTimeSeries = [];

  // Build datetime range
  const period = dateTime.buildDateTimeRange(startTimestamp, endTimestamp);

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

    powerValues.forEach(item => {
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

const convergeDailyData = (day, period, minPower, maxPower, minuteStep) => {
  const dailyHours = dateTime.getDailyHours(
    period.startDateTime,
    period.endDateTime
  );

  const dailyPower = generateDailyPowerTimeSeries(
    period.startDateTime,
    period.endDateTime,
    parseInt(minuteStep),
    minPower,
    maxPower
  );

  const { hourly, cumulative } = generateDailyConsumptionKWh(
    dailyHours,
    dailyPower,
    minuteStep
  );

  return {
    date: day,
    hourlyConsumption: hourly,
    cumulativeConsumption: cumulative
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

  switch (periodDays.length) {
    case 0:
      break;
    case 1: {
      const day = startTimestamp.slice(0, 10);
      const period = dateTime.buildDateTimeRange(
        startTimestamp,
        endTimestamp,
        true
      );
      powerTimeSeries.push(
        convergeDailyData(day, period, minPower, maxPower, minuteStep)
      );
      break;
    }
    default: {
      let count = 1;

      periodDays.forEach(day => {
        const period = dateTime.buildDateTimeRange(
          startTimestamp,
          endTimestamp,
          true
        );

        switch (count) {
          case 1:
            period.endDateTime = `${day} ${process.env.TYPICAL_DAY_END_TIME}`;
            break;
          case periodDays.length:
            period.startDateTime = `${day} ${process.env.TYPICAL_DAY_START_TIME}`;
            break;
          default:
            period.startDateTime = `${day} ${process.env.TYPICAL_DAY_START_TIME}`;
            period.endDateTime = `${day} ${process.env.TYPICAL_DAY_END_TIME}`;
            break;
        }

        const dailyData = convergeDailyData(
          day,
          period,
          minPower,
          maxPower,
          minuteStep
        );
        powerTimeSeries.push(dailyData);

        count += 1;
      });
      break;
    }
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
