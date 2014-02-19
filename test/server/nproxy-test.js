var nproxy = require('nproxy');

nproxy(8989, {
    "responderListFilePath": "nproxy_list.js",
    "timeout": 3,
    "debug": true
});