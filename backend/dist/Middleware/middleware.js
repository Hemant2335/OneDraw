"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.middleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const middleware = (req, res, next) => {
    const token = req.headers["authorization"];
    const data = jsonwebtoken_1.default.verify(token, "secret");
    if (data) {
        req.body.userId = data.id;
        next();
    }
    else {
        res.status(403).json({ error: "Unauthorized" });
    }
};
exports.middleware = middleware;
