import mongoose from "mongoose";
import url from 'node:url';
import Token from "../classes/Token/Token.js";

const schema : mongoose.Schema = new mongoose.Schema({
    token: {
        type: String,
        required: true,
        unique: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    persistAll: {
        type: Boolean,
        default: false
    },
    defaultTags: {
        type: Array<string>
    }
});

export default schema;