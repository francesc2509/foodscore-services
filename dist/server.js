"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const App_1 = require("./App");
App_1.default.listen(App_1.default.get('port'), () => console.log(`Server running on http://${App_1.default.get('host')}:${App_1.default.get('port')}`));
//# sourceMappingURL=server.js.map