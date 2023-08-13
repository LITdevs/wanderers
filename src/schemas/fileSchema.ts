import mongoose from "mongoose";

const schema = new mongoose.Schema({
    originalName: String,
    uploadedBy: String,
    uploadedAt: Date,
    mime: String,
    private: Boolean,
    fileName: String
});

export default schema