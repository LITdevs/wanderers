import express from 'express';
import RequiredProperties from "../../middleware/RequiredProperties.js";
import Reply from "../../classes/Reply/Reply.js";
import ServerErrorReply from "../../classes/Reply/ServerErrorReply.js";
import Database from "../../db.js";
import {isValidObjectId} from "mongoose";
import NotFoundReply from "../../classes/Reply/NotFoundReply.js";
const router = express.Router();

const database = new Database();

router.get("/:fileId", async (req, res) => {
    // Read file metadata from file bucket with official driver
    let fileCursor = database.FileBucket.find({"metadata.shortId": req.params.fileId})
    let file
    for await (const doc of fileCursor) {
        file = doc
    }
    if (!file) return res.reply(new NotFoundReply())
    // Create a stream from GridFS with official driver and pipe it to response
    // TODO: Mime type and headers and stuff :(
    database.FileBucket.openDownloadStreamByName(file.filename).pipe(res)

})

export default router;