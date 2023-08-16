import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import EventEmitter from "events";
import oldFileSchema from "./schemas/oldFileSchema.js";
import tokenSchema from "./schemas/tokenSchema.js";


export default class Database {

    private static _instance: Database;
    connected: boolean = false;

    db: any;
    events: EventEmitter = new EventEmitter();

    OldFile;
    FileBucket;

    Token;

    mongoose;


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
        this.mongoose = mongoose;

        this.db.once("open", () => {
            this.#onOpen();
            this.connected = true;
        })
    }

    #onOpen() {
        this.FileBucket = new this.mongoose.mongo.GridFSBucket(this.db, {
            bucketName: "fileBucket",

        })
        console.log("Database connection established");
        this.OldFile = this.db.model('old_file', oldFileSchema);
        this.Token = this.db.model('token', tokenSchema);
        this.events.emit("ready");
    }
}