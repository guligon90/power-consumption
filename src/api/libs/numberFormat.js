const roundToDecimals = (
  value,
  decimals = process.env.DEFAULT_DECIMAL_DIGITS
) => {
  return Number(value.toFixed(decimals));
};

const isNumeric = number => {
  return !isNaN(parseFloat(number)) && isFinite(number);
};

const isPositiveInt = number => {
  return !isNaN(parseInt(number)) && isFinite(number) && parseInt(number) > 0;
};

const modules = {
  isNumeric,
  isPositiveInt,
  roundToDecimals
};

module.exports = modules;
