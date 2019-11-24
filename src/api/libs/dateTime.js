const numberFormat = require("./numberFormat");

const convertTimeToMinutes = dateTimeObj => {
  return (
    dateTimeObj.getHours() * 60 +
    dateTimeObj.getSeconds() / 60 +
    dateTimeObj.getMinutes()
  );
};

const isValidTimestamp = timestamp => {
  const time = new Date(timestamp).getTime();
  return numberFormat.isNumeric(time);
};

const buildDateTimeRange = (startTimestamp, endTimestamp, toString = false) => {
  // If only the date is informed, the default initial time is added
  const start =
    startTimestamp.trim().length === 10
      ? `${startTimestamp} ${process.env.TYPICAL_DAY_START_TIME}`
      : startTimestamp;

  // If only the date is informed, the default ending time is added
  const end =
    endTimestamp.trim().length === 10
      ? `${endTimestamp} ${process.env.TYPICAL_DAY_END_TIME}`
      : endTimestamp;

  const output = toString
    ? { startDateTime: start, endDateTime: end }
    : { startDateTime: new Date(start), endDateTime: new Date(end) };

  return output;
};

const getDailyHours = (startTimestamp, endTimestamp) => {
  const hours = [];
  const start = new Date(startTimestamp);
  const end = new Date(endTimestamp);

  for (let dt = start; dt <= end; dt.setHours(dt.getHours() + 1)) {
    const hour =
      dt.getHours() < 10 ? `0${dt.getHours()}` : dt.getHours().toString();
    hours.push(hour);
  }

  return hours;
};

const generatePeriodDays = (startTimestamp, endTimestamp) => {
  const periodArray = [];
  // Create Date object with just the date substrings
  const start = new Date(startTimestamp.slice(0, 10));
  const end = new Date(endTimestamp.slice(0, 10));

  if (start.toDateString() === end.toDateString()) {
    periodArray.push(start.toISOString().slice(0, 10));
  } else if (start < end) {
    for (let dt = start; dt <= end; dt.setDate(dt.getDate() + 1)) {
      periodArray.push(dt.toISOString().slice(0, 10));
    }
  }

  return periodArray;
};

const modules = {
  convertTimeToMinutes,
  buildDateTimeRange,
  generatePeriodDays,
  isValidTimestamp,
  getDailyHours
};

module.exports = modules;
