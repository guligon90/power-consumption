const roundToDecimals = (value, decimals = 4) => {
  return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);
};

const isPositiveInt = (number) => {
  return !isNaN(parseInt(number)) && isFinite(number) && parseInt(number) > 0;
};

module.exports = {
  isPositiveInt,
  roundToDecimals
};
