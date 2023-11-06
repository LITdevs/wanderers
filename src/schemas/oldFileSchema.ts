import mongoose from "mongoose";

const schema = new mongoose.Schema({
    originalName: String,
    uploadedBy: String,
    uploadedAt: Date,
    mime: String,
    private: Boolean,
    fileName: String,
    shortId: String,
    persistent: Boolean
});

export default schema