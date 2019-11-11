
const convertTimeToMinutes = (dateTimeObj) => {
  return (dateTimeObj.getHours()*60) 
    + (dateTimeObj.getSeconds()/60)
    + dateTimeObj.getMinutes();
};
  
const getLocalISODateTimeString = (dateTimeObj, format = '') => {
  const tzOffset = (dateTimeObj).getTimezoneOffset() * 60000; // Timezone offset in milliseconds
  const dtWithoutTimezone = (new Date(dateTimeObj - tzOffset)).toISOString().slice(0, -1);

  let output = '';

  switch(format) {
    case 'onlyDate':
      output = dtWithoutTimezone.slice(0, 10);
      break;
    case 'onlyTime':
      output = dtWithoutTimezone.slice(11, 16);
      break;
    default:
      output = dtWithoutTimezone;
  }

  return output;
};

const getDailyHours = (startTimestamp, endTimestamp) => {
  let hours = [];
  const start = new Date(startTimestamp);
  const end = new Date(endTimestamp);

  for (dt=start; dt<=end; dt.setHours(dt.getHours()+1)) {
    const hour = (dt.getHours() < 10) ? `0${dt.getHours()}` : dt.getHours();
    hours.push(hour);
  }

  return hours;
};

const generatePeriodDays = (startTimestamp, endTimestamp) => {
  let periodArray = []
  const start = new Date(startTimestamp);
  const end = new Date(endTimestamp);

  if (start.toDateString() === end.toDateString()) {
    periodArray.push(start.toISOString().slice(0,10));
  } else if (start < end) {
    for (dt=start; dt<=end; dt.setDate(dt.getDate()+1)) {
      periodArray.push(dt.toISOString().slice(0,10));
    }
  }

  return periodArray;
};

module.exports = {
  getLocalISODateTimeString,
  convertTimeToMinutes,
  generatePeriodDays,
  getDailyHours,
};
