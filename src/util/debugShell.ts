// noinspection all

/**
 * This file implements a really stupid debug shell because i needed to generate a token without implementing login
 * Please never reuse this for anything
 * I shouldnt even have done this for my use, its way too overkill
 */
import {ejson} from "../index.js";
import Database from "../db.js";
import AccessToken from "../classes/Token/AccessToken.js";
import RefreshToken from "../classes/Token/RefreshToken.js";

const database = new Database();

export default async function (data : Buffer) {
    try {
        // Received a command
        let dataSplit = data.toString().split(" ");
        let command = dataSplit[0].trim();
        let args = dataSplit;
        args.splice(0, 1); // Yoink the command
        args = args.map(a => a.trim()); // Remove any stupid \r\n bullshit
        switch (command) {
            case "token":
                if (args.length !== 1) {
                    console.log("Usage: token [userId]");
                    break;
                }
                let tokenDocument = new database.Token({
                    access: new AccessToken(new Date(Date.now() +  + 60 * 60 * 60 * 1000)),
                    refresh: new RefreshToken(),
                    user: args[0]
                })
                await tokenDocument.save()
                console.log(tokenDocument)
                break;
            /*case "eval":
                // Arbitrary code execution!
                // type in `eval (async () => {console.log(await (database.Token.find()))})()` for funnies
                eval(args.join(" "))
                break;*/
            default:
                if (command.length < 1) break;
                console.log(`\x1b[31mCommand ${data.toString().trimEnd()} not found.\x1b[0m`);
                break;
        }
    } catch (e) {
        console.error(e)
    }

    process.stdout.write(`\x1b[92mwanderers${ejson.env === "prod" ? "" : "phoenix"}$\x1b[0m `);
}