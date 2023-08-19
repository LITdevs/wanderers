import express from 'express';
import RequiredProperties from "../../middleware/RequiredProperties.js";
import Reply from "../../classes/Reply/Reply.js";
import ServerErrorReply from "../../classes/Reply/ServerErrorReply.js";
import Database from "../../db.js";
import fs from "graceful-fs";
import {Types} from "mongoose";
import {Readable} from "stream";
const router = express.Router();

const database = new Database();

/*router.get("/migrate", async (req, res) => {
    await database.File.deleteMany({});
    let oldFiles = await database.OldFile.find({})
    let existingFiles = await database.File.find({})
    let savePromises : Promise<any>[] = [];
    let filesDone = 0;
    existingFiles = existingFiles.map(f => f._id);

    oldFiles = oldFiles.filter(of => !existingFiles.some(ef => ef._id.equals(of._id)))
    oldFiles.forEach(oldFile => {
        savePromises.push(new Promise<void>((resolve) => {
            fs.readFile(process.env.WC_PATH + "/" + oldFile.fileName, async (err, fileData) => {
                if (err) throw err;

                const readableFileStream = new Readable();
                readableFileStream.push(fileData);
                readableFileStream.push(null);
                let uploadStream = database.FileBucket.openUploadStream(oldFile.originalName, {
                    id: oldFile._id,
                    metadata: {
                        shortId: oldFile.shortId || oldFile._id.toString(),
                        uploadedBy: new Types.ObjectId(oldFile.uploadedBy),
                        private: oldFile.private,
                        persistent: oldFile.persistent,
                        tags: [
                            "legacy upload"
                        ]
                    }
                });
                readableFileStream.pipe(uploadStream);

                uploadStream.on('error', () => {
                    throw new Error("Upload fail");
                });

                uploadStream.on('finish', () => {
                    filesDone++;
                    console.log(`Files done ${filesDone}/${oldFiles.length}`)
                    resolve();
                });

            })
        }))
    })
    await Promise.all(savePromises)
    return res.reply(new Reply({
        response: {
            message: "Migrated!"
        }
    }))
})*/

export default router;