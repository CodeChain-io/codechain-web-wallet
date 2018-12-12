var SDK = require("codechain-sdk");

console.warn("Injecting CodeChain-SDK to the window object");

window.codechainSDK = SDK;
