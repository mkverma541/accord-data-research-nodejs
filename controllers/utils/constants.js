// Period units in seconds
 const PERIOD_UNITS_IN_SECONDS = {
  seconds: 1,
  minutes: 60,
  hours: 60 * 60,
  days: 60 * 60 * 24,
  weeks: 60 * 60 * 24 * 7,
  months: 60 * 60 * 24 * 30,
  years: 60 * 60 * 24 * 365,
};

// Bandwidth units in bytes
const BANDWIDTH_UNITS_IN_BYTES = {
  Bytes: 1,
  KB: 1024,
  MB: 1024 * 1024,
  GB: 1024 * 1024 * 1024,
  TB: 1024 * 1024 * 1024 * 1024,
};


const ITEM_TYPE = {
  1 : 'Digital Product',
  2 : 'Physical Product',
  3 : 'Subscription',
  4 : 'Courses',
}

module.exports = {
  PERIOD_UNITS_IN_SECONDS,
  BANDWIDTH_UNITS_IN_BYTES,
  ITEM_TYPE,
};