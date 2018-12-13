import { SDK } from "codechain-sdk";

console.warn("Injecting CodeChain-SDK to the window object");

(window as any).codechainSDK = SDK;
