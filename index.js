const express = require("express");
const axios = require("axios");
const app = express();
const port = 3000;
const cors = require("cors"); // Import CORS package



// Middleware to parse JSON bodies
app.use(express.json());
app.use(cors());
// Firebase Database URL and API Key
const databaseURL = "https://asdad-d1423-default-rtdb.firebaseio.com";
const apiKey = "AIzaSyC54xDhOr7tcTM5eI7uijppprWkcODRb2I";

// POST endpoint for Dialogflow fulfillment webhook
app.post("/webhook", (req, res) => {
    const body = req.body;

    // Extract the necessary parameters from Dialogflow's request
    const userData = body.queryResult.parameters; // The parameters Dialogflow sends

    // Example: Get the 'name' parameter from Dialogflow (ensure the parameter is defined in your intent)
    const userName = userData.name;

    // Prepare the data for Firebase
    const data = {
        name: userName, // Store the extracted parameter (e.g., 'name')
        timestamp: new Date().toISOString(),
    };

    // Write data to Firebase Realtime Database
    axios.put(`${databaseURL}/users/1.json?auth=${apiKey}`, data)
        .then((response) => {
            // Respond to Dialogflow with a success message
            res.json({
                fulfillmentText: `Data for ${userName} has been saved successfully!${userData}`,
            });
        })
        .catch((error) => {
            console.error("Error writing data:", error);
            // Respond with an error message if there is an issue
            res.json({
                fulfillmentText: `Sorry, there was an error saving your data. ${userData}`,
            });
        });
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
