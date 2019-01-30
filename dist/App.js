"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const api_1 = require("./api");
class App {
    constructor() {
        this.express = express();
        this.mountRoutes();
    }
    mountRoutes() {
        this.app.get('/', (req, res) => res.send('tsLint configured!'));
        this.app.use('/auth', api_1.auth);
    }
    get app() {
        return this.express;
    }
}
exports.default = new App().app;
//# sourceMappingURL=App.js.map