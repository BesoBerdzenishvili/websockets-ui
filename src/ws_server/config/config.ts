import dotenv from "dotenv";
dotenv.config();

export const config = {
  wsPort: process.env.WS_PORT ? parseInt(process.env.WS_PORT) : 3000,
  httpPort: process.env.HTTP_PORT ? parseInt(process.env.HTTP_PORT) : 8181,
  boardSize: 10,
  environment: process.env.NODE_ENV || "development",
};
