import winston from "winston";

const fileFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.json() // JSON is industry standard for log files (easy for ELK/Splunk to parse)
);

const logger = winston.createLogger({
  level: "info",
  transports: [
    // 1. Write all logs with level 'error' and below to 'error.log'
    new winston.transports.File({ 
      filename: "logs/error.log", 
      level: "error", 
      format: fileFormat 
    }),
    // 2. Write all logs with level 'info' and below to 'combined.log'
    new winston.transports.File({ 
      filename: "logs/combined.log", 
      format: fileFormat 
    }),
  ],
});

// 3. If we're not in production, also log to the console with colors
if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    })
  );
}

export default logger;