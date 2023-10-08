const fs = require("fs");
const csv = require("csv-parser");

let diningHallList = ["Epicuria", "DeNeve", "BruinPlate"];

for (const hall of diningHallList) {
  const csvFilePath = `./data/csv/${hall}.csv`; // Replace with your CSV file path
  const jsonFilePath = `./data/csv/${hall}.json`; // Specify the JSON file path

  const results = [];

  fs.createReadStream(csvFilePath)
    .pipe(csv())
    .on("data", (data) => results.push(data))
    .on("end", () => {
      fs.writeFileSync(jsonFilePath, JSON.stringify(results, null, 2));
      console.log(
        `CSV file '${csvFilePath}' successfully converted to JSON as '${jsonFilePath}'.`
      );
    });
}
