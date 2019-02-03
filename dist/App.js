"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const auth_controller_1 = require("./auth/auth.controller");
const restaurant_controller_1 = require("./restaurants/restaurant.controller");
const user_controller_1 = require("./users/user.controller");
const errors_1 = require("./errors");
class App {
    constructor() {
        this.express = express();
        console.log(`${__dirname}`);
        this.express.set('host', 'localhost');
        this.express.set('port', 3000);
        this.express.use(cors({ credentials: true, origin: true }));
        this.express.use(express.static(`${__dirname}/..`));
        this.express.use(bodyParser.json());
        this.mountRoutes();
        this.express.use(this.errorHandler);
    }
    mountRoutes() {
        this.app.get('/', (req, res) => res.send('Hello World!'));
        this.app.use('/auth', auth_controller_1.auth);
        this.app.use('/restaurants', restaurant_controller_1.restaurant);
        this.app.use('/users', user_controller_1.user);
    }
    get app() {
        return this.express;
    }
    errorHandler(err, req, res, next) {
        console.log('mundo!');
        if (res.headersSent) {
            return next(err);
        }
        let statusCode = 500;
        switch (true) {
            case err instanceof errors_1.BadRequest:
                statusCode = 400;
                break;
            case err instanceof errors_1.NotFound:
                statusCode = 404;
                break;
        }
        res.status(statusCode);
        res.send({ error: err.message });
    }
}
exports.default = new App().app;
//# sourceMappingURL=App.js.map