import dotenv from "dotenv";

import { syncFirmsHotspots } from "../../lib/adapters/firms";
import { GoogleSheetsStore } from "../../lib/adapters/googleSheets";

dotenv.config({ path: ".env.local" });
dotenv.config();

syncFirmsHotspots(new GoogleSheetsStore())
  .then((result) => {
    console.log(JSON.stringify(result));
  })
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
