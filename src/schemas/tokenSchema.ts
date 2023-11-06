import mongoose from "mongoose";
import url from 'node:url';
import Token from "../classes/Token/Token.js";

const schema : mongoose.Schema = new mongoose.Schema({
    access: {
        type: String,
        required: true,
        unique: true,
        validate: {
            message: props => `${props.value} is not a valid token`,
            validator: function(v) {
                try {
                    Token.parse(v)
                    return true
                } catch (e) {
                    return false
                }
            }
        }
    },
    refresh: {
        type: String,
        required: true,
        unique: true,
        validate: {
            message: props => `${props.value} is not a valid token`,
            validator: function(v) {
                try {
                    Token.parse(v)
                    return true
                } catch (e) {
                    return false
                }
            }
        }
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        //ref: "user", Skipping the ref here, users come from an external source
        required: true
    }
});

export default schema;