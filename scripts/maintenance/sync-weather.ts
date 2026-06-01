import dotenv from "dotenv";

import { GoogleSheetsStore } from "../../lib/adapters/googleSheets";
import { syncOpenMeteoWeather } from "../../lib/adapters/weather";

dotenv.config({ path: ".env.local" });
dotenv.config();

syncOpenMeteoWeather(new GoogleSheetsStore())
  .then((result) => {
    console.log(JSON.stringify(result));
  })
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
