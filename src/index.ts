import dotenv from "dotenv";
dotenv.config();
import express from 'express';
import fs from "fs";
import NotFoundReply from "./classes/Reply/NotFoundReply.js";
import Database from "./db.js";
import debugShell from "./util/debugShell.js";

const pjson = JSON.parse(fs.readFileSync("package.json").toString());
const ejson = JSON.parse(fs.readFileSync("environment.json").toString());
if (ejson.env === "prod") process.env.NODE_ENV = "production";

export { pjson, ejson }

const database = new Database();
const app = express();


app.get("/test", (req, res) => {
    res.sendStatus(200)
})

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

    // Continue
    next();
})

// Set up locals
app.locals.pjson = pjson;
app.locals.ejson = ejson;

// Set up routes
import v1_home from "./routes/v1/home.js";
import v1_file from "./routes/v1/file.js";

/*app.use("/", (req, res, next) => {
    console.log(req.originalUrl);
    next()
})*/
app.use("/", v1_file);
app.use("/v1", v1_home);

// Catch all other requests with 404
app.all("*", async (req, res) => {
    res.reply(new NotFoundReply());
})

// Make sure both the database is ready before starting listening for requests
let databaseReady = false;
database.events.once("ready", () => {
    databaseReady = true;
    startServer();
});

const startServer = () => {
    if (!databaseReady) return;
    app.listen(process.env.PORT || 45303, async () => {
        console.log(`Listening on port ${process.env.PORT || 45303}`);
        // Debug console lol
        process.stdout.write(`\x1b[92mwanderers${ejson.env === "prod" ? "" : "phoenix"}$\x1b[0m `);
        process.stdin.on("data", debugShell)
    });
}
