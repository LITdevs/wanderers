import ForbiddenReply from "../classes/Reply/ForbiddenReply.js";
import {unleash} from "../index.js";

/**
 * Generates middleware for checking a required unleash feature flag is present
 * @example
 * app.get("/protected/endpoint", FeatureFlag("endpointFlag"), (req, res) => {
 *     res.sendStatus(200);
 * })
 * // Request with endpointFlag in Unleash -> 200 OK
 * // Request without endpointFlag in Unleash -> 403 Forbidden
 * @param flagName
 * @returns {Function} Returns an express middleware function
 */
export default function FeatureFlag (flagName : string) : Function {
    return function (req, res, next) {
        if (unleash.isEnabled(flagName, res.locals.unleashContext)) return next();
        res.reply(new ForbiddenReply("You are not permitted to access this endpoint"))
    }
}