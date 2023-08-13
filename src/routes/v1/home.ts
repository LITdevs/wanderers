import express from 'express';
import RequiredProperties from "../../middleware/RequiredProperties.js";
import Reply from "../../classes/Reply/Reply.js";
import ServerErrorReply from "../../classes/Reply/ServerErrorReply.js";
import Database from "../../db.js";
const router = express.Router();

const database = new Database();

router.get("/", async (req, res) => {
    res.reply(new Reply({
        response: {
            message: "OK",
            version: req.app.locals.pjson.version,
            env: req.app.locals.ejson
        }}));
})

export default router;