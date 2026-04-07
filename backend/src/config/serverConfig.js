'use strict';

require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 3000,
  ENV: process.env.NODE_ENV || 'development',
  MONGO_URI: process.env.MONGO_URI
};
