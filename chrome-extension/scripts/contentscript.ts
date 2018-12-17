import * as fs from "fs";
import * as path from "path";
import MessageTunnel, { MessageFormat } from "./MessageTunnel";

const extension = require("extensionizer");
const inpageContent = fs
  .readFileSync(path.join(__dirname, "..", "build", "inpage.js"))
  .toString();
const inpageSuffix =
  "//# sourceURL=" + extension.extension.getURL("inpage.js") + "\n";
const inpageBundle = inpageContent + inpageSuffix;

const isEnabled = false;

if (shouldInjectSDK()) {
  injectScript(inpageBundle);
}

function shouldInjectSDK() {
  return (
    doctypeCheck() &&
    suffixCheck() &&
    documentElementCheck() &&
    !blacklistedDomainCheck()
  );
}

function injectScript(content: string) {
  try {
    const container = document.head || document.documentElement!;
    const scriptTag = document.createElement("script");
    scriptTag.setAttribute("async", "false");
    scriptTag.textContent = content;
    container.insertBefore(scriptTag, container.children[0]);
    container.removeChild(scriptTag);
  } catch (e) {
    console.error("CodeChain SDK script injection failed", e);
  }
}

function doctypeCheck() {
  const doctype = window.document.doctype;
  if (doctype) {
    return doctype.name === "html";
  } else {
    return true;
  }
}

function suffixCheck() {
  const prohibitedTypes = [/\.xml$/, /\.pdf$/];
  const currentUrl = window.location.pathname;
  // tslint:disable-next-line:prefer-for-of
  for (let i = 0; i < prohibitedTypes.length; i++) {
    if (prohibitedTypes[i].test(currentUrl)) {
      return false;
    }
  }
  return true;
}

function documentElementCheck() {
  const documentElement = document.documentElement!.nodeName;
  if (documentElement) {
    return documentElement.toLowerCase() === "html";
  }
  return true;
}

function blacklistedDomainCheck() {
  const blacklistedDomains = [
    "uscourts.gov",
    "dropbox.com",
    "webbyawards.com",
    "cdn.shopify.com/s/javascripts/tricorder/xtld-read-only-frame.html",
    "adyen.com",
    "gravityforms.com",
    "harbourair.com",
    "ani.gamer.com.tw",
    "blueskybooking.com",
    "localhost:3000",
    "52.78.210.78:9000"
  ];
  const currentUrl = window.location.href;
  let currentRegex;
  // tslint:disable-next-line:prefer-for-of
  for (let i = 0; i < blacklistedDomains.length; i++) {
    const blacklistedDomain = blacklistedDomains[i].replace(".", "\\.");
    currentRegex = new RegExp(
      `(?:https?:\\/\\/)(?:(?!${blacklistedDomain}).)*$`
    );
    if (!currentRegex.test(currentUrl)) {
      return true;
    }
  }
  return false;
}

const messageTunnel = new MessageTunnel({
  from: "wallet_contentscript",
  to: "wallet_inpage"
});

messageTunnel.addEventHandler(
  async (req: MessageFormat, response: (result: any) => void) => {
    try {
      const responseFromBackground = await sendMessageToBackground<any>({
        type: req.type,
        data: req.body
      });
      response({
        status: "success",
        data: responseFromBackground
      });
    } catch (e) {
      response({
        status: e
      });
    }
  }
);

const sendMessageToBackground = <T>(message: {
  type: string;
  data?: any;
}): Promise<T | null> => {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject("timeout");
    }, 15000);
    chrome.runtime.sendMessage(message, response => {
      clearTimeout(timeout);
      if (!response) {
        reject("invalid response from background script");
      }
      if (response.status === "success") {
        resolve(response.data);
      } else {
        reject(response.status);
      }
    });
  });
};
