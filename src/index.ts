import dotenv from "dotenv";
dotenv.config();
import express from 'express';
import fs from "fs";
import NotFoundReply from "./classes/Reply/NotFoundReply.js";
import Database from "./db.js";
import { initialize } from 'unleash-client';

const pjson = JSON.parse(fs.readFileSync("package.json").toString());
const ejson = JSON.parse(fs.readFileSync("environment.json").toString());
if (ejson.env === "prod") process.env.NODE_ENV = "production";

export { pjson, ejson }

const database = new Database();
const app = express();

if (!process.env.UNLEASH_TOKEN) {
    console.error("No UNLEASH_TOKEN, exiting.")
    process.exit(5)
}
export const unleash = initialize({
    url: 'https://feature-gacha.litdevs.org/api',
    appName: 'API',
    environment: ejson.environment === "dev" ? "development" : "production",
    // @ts-ignore
    customHeaders: { Authorization: process.env.UNLEASH_TOKEN },
});

// Set up body parsers
app.use(express.json())

// Set up custom middleware
app.use((req, res, next) => {
    // Allow CORS usage
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "*")
    res.header("Access-Control-Allow-Methods", "*")

    // Define reply method, to set status code accordingly
    res.reply = (reply) => {
        res.status(reply.request.status_code).json(reply);
    }

    res.locals.unleashContext = {
        remoteAddress: req.headers["x-forwarded-for"] || req.ip,
    };

    // Continue
    next();
})

// Set up locals
app.locals.pjson = pjson;
app.locals.ejson = ejson;

// Set up routes
import v1_home from "./routes/v1/home.js";
app.use("/v1", v1_home);

// Catch all other requests with 404
app.all("*", async (req, res) => {
    res.reply(new NotFoundReply());
})

// Make sure both the database and feature gacha are ready before starting listening for requests
let unleashReady = false;
let databaseReady = false;
database.events.once("ready", () => {
    databaseReady = true;
    startServer();
});

unleash.on('synchronized', () => {
    console.debug("Feature gacha rolled")
    unleashReady = true;
    startServer();
});

const startServer = () => {
    if (!databaseReady || !unleashReady) return;
    app.listen(process.env.PORT || 13717, async () => {
        console.log(`${await database.Test.countDocuments({})} test documents in database`)
        console.log("Listening on port 13717");
    });
}
