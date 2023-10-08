const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");

async function scrapeMenu(diningHall) {
  const csvDirectory = path.join(__dirname, "data", "csv");

  // Create the directory if it doesn't exist
  if (!fs.existsSync(csvDirectory)) {
    fs.mkdirSync(csvDirectory, { recursive: true });
  }

  // Create the CSV file and open it in append mode
  const csvStream = fs.createWriteStream(
    path.join(csvDirectory, `${diningHall}.csv`),
    {
      flags: "a",
    }
  );

  try {
    // Write the header row to the CSV file if it's a new file
    if (fs.statSync(path.join(csvDirectory, `${diningHall}.csv`)).size === 0) {
      csvStream.write(
        "Recipe Name,Calories,Total Fat,Saturated Fat,Trans Fat,Cholesterol,Sodium,Total Carbohydrate,Dietary Fiber,Sugars,Protein\n"
      );
    }

    // Launch a headless browser
    const browser = await puppeteer.launch({ headless: false });

    // Create a new page
    const page = await browser.newPage();

    // List of URLs
    await page.goto(`https://menu.dining.ucla.edu/Menus/${diningHall}`);

    // Wait for the page to load completely (You can adjust the wait time as needed)
    await page.waitForSelector(".menu-item");

    // Extract the links within <li> elements with class 'menu-item'
    const links = await page.evaluate(() => {
      const linkElements = Array.from(
        document.querySelectorAll(".menu-item a.recipelink")
      );
      return linkElements.map((linkElement) => linkElement.href);
    });

    // Iterate through the list of URLs and perform actions for each URL
    for (const url of links) {
      // Navigate to the URL you want to scrape
      await page.goto(url);

      // Wait for the page to load completely (You can adjust the wait time as needed)
      await page.waitForSelector("span.nfcaltxt");
      await page.waitForSelector("p.nfnutrient");
      await page.waitForSelector("h2"); // Wait for the h2 element with class 'recipecontainer'

      // Extract the text content from the h2 element with class 'recipecontainer'
      const recipeName = await page.$eval("h2", (element) => {
        return `"${element.textContent.trim()}"`;
      });

      // Extract the numeric value from the element with class "nfcal"
      const calories = await page.$eval("p.nfcal", (element) => {
        // Split the text by spaces and get the last part as it contains the numeric value
        const parts = element.textContent.trim().split(" ");
        return parts[parts.length - 1];
      });

      // Extract the nutrient information as in your existing code
      const nutrientElements = await page.$$eval("p.nfnutrient", (elements) => {
        return elements.map((element) => element.textContent);
      });

      const result = {};

      nutrientElements.forEach((item) => {
        const match = item.match(/([A-Za-z\s]+)\s([\d.]+[A-Za-z]*)/);
        if (match) {
          const letter = match[1].trim();
          const value = match[2].trim();
          result[letter] = value;
        }
      });

      // Extract values for specific columns as in your existing code
      const columns = [
        "Total Fat",
        "Saturated Fat",
        "Trans Fat",
        "Cholesterol",
        "Sodium",
        "Total Carbohydrate",
        "Dietary Fiber",
        "Sugars",
        "Protein",
      ];

      const values = columns.map((column) => result[column] || "");

      // Insert the 'Calories' value after 'Recipe Name'
      values.splice(0, 0, recipeName);
      values.splice(1, 0, calories); // Insert the calories value here

      // Create a CSV formatted string with one row and ten columns
      const csvRow = `${values.join(",")}\n`;

      // Write the CSV row to the file in append mode
      csvStream.write(csvRow);

      console.log(`Processed URL: ${url}`);
    }

    console.log("All URLs processed.");
  } catch (error) {
    console.error("Error:", error);
  } finally {
    if (csvStream) {
      // Close the CSV file stream
      csvStream.end();
    }

    // Close the page after processing all URLs
    await page.close();

    // Close the browser when done
    await browser.close();
  }
}

(async () => {
  let diningHallList = ["Epicuria", "DeNeve", "BruinPlate"];

  for (const hall of diningHallList) {
    await scrapeMenu(hall);
  }
})();
