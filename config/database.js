const fs = require("fs");

const mysql = require("mysql2/promise");

const config = JSON.parse(fs.readFileSync("config.json", "utf8"));

// Set environment variables
process.env.DB_HOST = config.DB_HOST;
process.env.DB_USER = config.DB_USER;
process.env.DB_PASSWORD = config.DB_PASSWORD;
process.env.DB_DATABASE = config.DB_DATABASE;
process.env.SECRET_KEY = config.SECRET_KEY;
process.env.RAZORPAY_KEY_ID = config.RAZORPAY_KEY_ID;
process.env.RAZORPAY_KEY_SECRET = config.RAZORPAY_KEY_SECRET;
process.env.STRIPE_SECRET_KEY = config.STRIPE_SECRET_KEY;
process.env.BINANCE_API_KEY = config.BINANCE_API_KEY;
process.env.BINANCE_API_SECRET = config.BINANCE_API_SECRET;
process.env.APP_BASE_URL = config.APP_BASE_URL;
process.env.AWS_ACCESS_KEY_ID = config.AWS_ACCESS_KEY_ID;
process.env.AWS_SECRET_ACCESS_KEY = config.AWS_SECRET_ACCESS_KEY;
process.env.AWS_REGION = config.AWS_REGION;
process.env.AWS_S3_BUCKET_NAME = config.AWS_S3_BUCKET_NAME;
process.env.REDIS_HOST = config.REDIS_HOST;
process.env.REDIS_PORT = config.REDIS_PORT;
process.env.REDIS_USERNAME = config.REDIS_USERNAME;
process.env.REDIS_PASSWORD = config.REDIS_PASSWORD;
process.env.EMAIL_HOST = config.EMAIL_HOST;
process.env.EMAIL_PORT = config.EMAIL_PORT;
process.env.EMAIL_USERNAME = config.EMAIL_USERNAME;
process.env.EMAIL_PASSWORD = config.EMAIL_PASSWORD;
process.env.EMAIL_FROM = config.EMAIL_FROM;
process.env.APP_PASSWORD = config.APP_PASSWORD;
process.env.SENDGRID_API_KEY = config.SENDGRID_API_KEY;
process.env.SENDGRID_FROM_EMAIL = config.SENDGRID_FROM_EMAIL;
process.env.SENDGRID_SMTP_HOST = config.SENDGRID_SMTP_HOST;
process.env.SENDGRID_PORT = config.SENDGRID_PORT;
process.env.SENDGRID_USERNAME = config.SENDGRID_USERNAME;
process.env.SENDGRID_PASSWORD = config.SENDGRID_PASSWORD;
process.env.SMTP_HOST = config.SMTP_HOST;
process.env.SMTP_PORT = config.SMTP_PORT;
process.env.SMTP_USERNAME = config.SMTP_USERNAME;
process.env.SMTP_PASSWORD = config.SMTP_PASSWORD;
process.env.SITE_URL = config.SITE_URL;
process.env.MASTER_PASSWORD = config.MASTER_PASSWORD;

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

const secretKey = process.env.SECRET_KEY;

module.exports = { pool, secretKey };
