import React, { useState } from "react";
import data from "./../backend/data/json/data.json";

function RecipeList() {
  const [showDetails, setShowDetails] = useState({});

  const toggleDetails = (recipeName) => {
    setShowDetails((prevShowDetails) => ({
      ...prevShowDetails,
      [recipeName]: !prevShowDetails[recipeName],
    }));
  };

  // Create a new array that starts from the second element (index 1)
  const dataWithoutFirstObject = data.slice(1);

  return (
    <div>
      {dataWithoutFirstObject.map((item, index) => (
        <div key={index}>
          <h3>{item["Recipe Name"]}</h3>
          <button onClick={() => toggleDetails(item["Recipe Name"])}>
            {showDetails[item["Recipe Name"]] ? "Hide Details" : "Show Details"}
          </button>
          {showDetails[item["Recipe Name"]] && (
            <div>
              <p>
                {Object.entries(item)
                  .filter(([key]) => key !== "Recipe Name") // Exclude "Recipe Name"
                  .map(([key, value]) => (
                    <span key={key}>
                      <strong>{key}:</strong> {value}
                      <br />
                    </span>
                  ))}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default RecipeList;
