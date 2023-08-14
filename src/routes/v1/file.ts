import express from 'express';
import RequiredProperties from "../../middleware/RequiredProperties.js";
import Reply from "../../classes/Reply/Reply.js";
import ServerErrorReply from "../../classes/Reply/ServerErrorReply.js";
import Database from "../../db.js";
import {isValidObjectId} from "mongoose";
import NotFoundReply from "../../classes/Reply/NotFoundReply.js";
import {fileTypeFromStream, fileTypeStream} from "file-type";
import {contentType} from "mime-types";
const router = express.Router();

const database = new Database();

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

export default router;