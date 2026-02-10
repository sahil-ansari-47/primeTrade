import dotenv from "dotenv";

dotenv.config();

export const env = {
  port: process.env.PORT || "4000",
  jwtSecret: process.env.JWT_SECRET || "change_me_in_production",
  mongoUri: process.env.MONGO_URI || "",
};

