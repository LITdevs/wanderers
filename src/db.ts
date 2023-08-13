import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import EventEmitter from "events";
import testSchema from "./schemas/testSchema.js";


export default class Database {

    private static _instance: Database;
    connected: boolean = false;

    db: any;
    events: EventEmitter = new EventEmitter();

    Test;

    constructor() {
        if (typeof Database._instance === "object") return Database._instance;
        Database._instance = this;

        // Connect to the database
        const DB_URI : string | undefined = process.env.MONGODB_URI
        if (typeof DB_URI === "undefined") {
            console.error("\nMONGODB_URI not found, Exiting...");
            process.exit(2);
        }

        this.db = mongoose.createConnection(DB_URI);

        this.db.once("open", () => {
            this.#onOpen();
            this.connected = true;
        })
    }

    #onOpen() {
        console.log("Database connection established");
        this.Test = this.db.model('test', testSchema);
        this.events.emit("ready");
    }
}