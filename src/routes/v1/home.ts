import express from 'express';
import Reply from "../../classes/Reply/Reply.js";
import Database from "../../db.js";
import fs from "graceful-fs";
import {Types} from "mongoose";
import {Readable} from "stream";
import UnauthorizedReply from "../../classes/Reply/UnauthorizedReply.js";
const router = express.Router();

const database = new Database();

router.get("/migrate", async (req, res) => {
    if (!process.env.MIGRATION_KEY || req.query.key !== process.env.MIGRATION_KEY) return res.reply(new UnauthorizedReply());
    console.log("Started migration");
    let oldFiles = await database.OldFile.find({})
    console.log(`Migrating ${oldFiles.length} files`)
    let savePromises : Promise<any>[] = [];
    let filesDone = 0;

    const oldFileChunks = oldFiles.reduce((resultArray, item, index) => {
        const chunkIndex = Math.floor(index/(req.query.chunk || 250))

        if(!resultArray[chunkIndex]) {
            resultArray[chunkIndex] = [] // start a new chunk
        }

        resultArray[chunkIndex].push(item)

        return resultArray
    }, [])

    let totalFiles = oldFiles.length;
    let totalChunks = oldFileChunks.length;
    let chunksDone = 0;
    console.log(`Old files split into ${totalChunks} chunks`);

    for (const oldFiles of oldFileChunks) {
        console.log(`Starting new chunk (${oldFiles.length})`)
        let chunkFilesDone = 0;
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

                    uploadStream.on('error', (e) => {
                        console.error(e)
                        throw new Error("Upload fail");
                    });

                    uploadStream.on('finish', () => {
                        chunkFilesDone++;
                        filesDone++;
                        let percent = filesDone / totalFiles * 100;
                        console.log(`CD ${chunkFilesDone}/${oldFiles.length} T(${filesDone}/${totalFiles}) C(${chunksDone}/${totalChunks}) ${percent.toFixed(2)}%`)
                        resolve();
                    });

                })
            }))
        })
        await Promise.all(savePromises)
        chunksDone++
        console.log(`Chunks ${chunksDone}/${totalChunks}`)
    }
    return res.reply(new Reply({
        response: {
            message: "Migrated!"
        }
    }))
})

export default router;