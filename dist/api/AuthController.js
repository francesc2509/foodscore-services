"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
class AuthController {
    constructor() {
        this.router = express_1.Router();
        this.fsOnMount();
    }
    fsOnMount() {
        this.router.get('/login', this.jwt);
        this.router.get('/google', this.google);
        this.router.get('/facebook', this.facebook);
    }
    jwt(req, res) {
        res.send('This is jwt route');
    }
    google(req, res) {
        res.send('This is google route');
    }
    facebook(req, res) {
        res.send('This is facebook route');
    }
    validate(req, res) {
        res.send('This is validate route');
    }
}
exports.default = new AuthController().router;
//# sourceMappingURL=AuthController.js.map