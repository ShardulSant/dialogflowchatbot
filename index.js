const express = require("express");
const axios = require("axios");
const { Client } = require('pg');
const cors = require("cors"); // Import CORS package

const app = express();
const port = 3000;

const dbConfig = {
    user: 'dialogflowdatabase_user', // Replace with your DB username
    host: 'dpg-ctn61952ng1s73bhfdag-a.oregon-postgres.render.com', // Your PostgreSQL hostname
    database: 'dialogflowdatabase', // Your database name
    password: 'TrJYUFQ1fZrtB1r3GBm27CXxGvcmdnVc', // Your DB password
    port: 5432, 
    ssl: {
        rejectUnauthorized: false, // This is important to avoid SSL verification issues
    },// PostgreSQL port
};

// Create a new client instance
const dbClient = new Client(dbConfig);

// Connect to the PostgreSQL database and create the table if it doesn't exist
dbClient.connect()
    .then(() => {
        console.log("Connected to PostgreSQL database");

        // Create the table if it doesn't exist
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                phone_number VARCHAR(20),
                user_name VARCHAR(100),
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `;
        return dbClient.query(createTableQuery);
    })
    .then(() => {
        console.log('Table created or already exists');
    })
    .catch((err) => {
        console.error("Error connecting to PostgreSQL:", err);
    });

// Middleware to parse JSON bodies
app.use(express.json());
app.use(cors());

// POST endpoint for Dialogflow fulfillment webhook
app.post("/webhook", (req, res) => {
    const body = req.body;

    // Extract the necessary parameters from Dialogflow's request
    const userData = body.queryResult.parameters; // The parameters Dialogflow sends
    const aiSensyMessage = JSON.parse(req.body.originalDetectIntentRequest.payload.AiSensyMessage);
    
    // Extract the phone_number from AiSensyMessage
    const phoneNumber = aiSensyMessage.phone_number;
    const userName = aiSensymessage.userName || "demo"; // Default to "demo" if not provided
    const timestamp = new Date().toISOString();

    console.log("Request Body: ", JSON.stringify(req.body, null, 2));

    // Insert data into PostgreSQL
    const insertQuery = `
        INSERT INTO users (phone_number, user_name, timestamp) 
        VALUES ($1, $2, $3) RETURNING *;
    `;

    dbClient.query(insertQuery, [phoneNumber, userName, timestamp])
        .then((result) => {
            console.log("Data saved to PostgreSQL:", result.rows[0]);
            res.json({
                fulfillmentText: `Data for ${userName} has been saved successfully!`,
            });
        })
        .catch((error) => {
            console.error("Error writing to PostgreSQL:", error);
            res.json({
                fulfillmentText: `Sorry, there was an error saving your data.`,
            });
        });
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
