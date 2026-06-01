import dotenv from "dotenv";

import { syncGbifOccurrences } from "../../lib/adapters/gbif";
import { GoogleSheetsStore } from "../../lib/adapters/googleSheets";

dotenv.config({ path: ".env.local" });
dotenv.config();

syncGbifOccurrences(new GoogleSheetsStore())
  .then((result) => {
    console.log(JSON.stringify(result));
  })
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
