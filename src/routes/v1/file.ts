import express from 'express';
import RequiredProperties from "../../middleware/RequiredProperties.js";
import Reply from "../../classes/Reply/Reply.js";
import ServerErrorReply from "../../classes/Reply/ServerErrorReply.js";
import Database from "../../db.js";
import {isValidObjectId, Types} from "mongoose";
import NotFoundReply from "../../classes/Reply/NotFoundReply.js";
import {fileTypeStream} from "file-type";
import {contentType} from "mime-types";
import multer from "multer";
import fs from "fs";
import * as crypto from "crypto";
import {isArray} from "util";
import BadRequestReply from "../../classes/Reply/BadRequestReply.js";
const router = express.Router();

const database = new Database();

const tmpStorage = multer.diskStorage({
    filename: function (req, file, cb) {
        cb(null, crypto.randomBytes(8).toString("base64url"))
    }
})
const upload = multer({storage: tmpStorage})

router.get("/:fileId", async (req, res) => {
    const download = !!req.query?.download
    req.params.fileId = req.params.fileId.split(".")[0];
    // Read file metadata from file bucket with official driver
    let fileCursor = database.FileBucket.find({"metadata.shortId": req.params.fileId})
    let file
    for await (const doc of fileCursor) {
        file = doc
    }
    if (!file) return res.reply(new NotFoundReply())
    // Create a stream from GridFS with official driver and pipe it to response
    // TODO: Check metadata.private
    let fileStream = database.FileBucket.openDownloadStreamByName(file.filename)
    // Get file type from stream, fallback to filename based, and then octet stream
    fileStream = await fileTypeStream(fileStream);
    let mimeType = fileStream?.fileType?.mime;
    if (!mimeType) {
        // Couldn't detect a mime type, probably a text file not binary
        // Check with mime-types
        mimeType = contentType(file.filename)
    }
    // If mime type still was not detected fall back to octet stream
    res.header("Content-Type", mimeType || "application/octet-stream")
    // If download query is set return as attachment, by default show inline
    res.header("Content-Disposition", `${download ? "attachment" : "inline"}; filename="${file.filename}"`)

    //console.log(typeIdStream.length)
    fileStream.pipe(res);
})


const uploadEndpoint = async (req, res) => {
    // TODO: Auth
    // TODO: Private and persistent files (depends on auth)
    if (!req.files || !Array.isArray(req.files) || req.files.length < 1) return res.reply(new BadRequestReply("Upload at least one file in multipart/form-data request"))
    let uploadPromises : Promise<string>[] = req.files.map(file => new Promise(resolve => {
        let readStream = fs.createReadStream(file.path);
        let shortId = crypto.randomBytes(4).toString("base64url"); // (2^8)^4 = 4294967296
        let uploadStream = database.FileBucket.openUploadStream(file.originalname, {
            metadata: {
                shortId,
                uploadedBy: new Types.ObjectId(0),
                private: false,
                persistent: false
            }
        });
        readStream.pipe(uploadStream);
        uploadStream.on('finish', () => {
            resolve(shortId);
        });
    }))

    let uploads : string[] = await Promise.all(uploadPromises);
    res.reply(new Reply({
        response: {
            message: "Upload complete",
            uploadedFiles: uploads.map(u => `http://localhost:45303/v1/file/${u}`)
        }
    }))
}

// This really should be a PUT imo but backwards compatibility, so it will be a POST
router.post("/upload", upload.any(), uploadEndpoint)
router.put("/", upload.any(), uploadEndpoint)


export default router;