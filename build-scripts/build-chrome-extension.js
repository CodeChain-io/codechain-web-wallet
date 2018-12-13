const fs = require("fs-extra");
const browserify = require("browserify");
const path = require("path");

const buildFiles = ["inpage", "contentscript", "background"];
const extensionRoot = path.join(__dirname, "..", "chrome-extension");
const scriptRoot = path.join(extensionRoot, "scripts");
const resourcesRoot = path.join(extensionRoot, "resources");
const buildScriptRoot = path.join(extensionRoot, "build");
const outpointRoot = path.join(__dirname, "..", "build");

function buildScript(buildFile) {
  return new Promise((resolve, reject) => {
    console.log(`Building ${buildFile} file`);
    browserify(path.join(scriptRoot, `${buildFile}.ts`))
      .plugin("tsify", {
        project: path.join(__dirname, "tsconfig.chrome.json")
      })
      // .plugin("tinyify")
      .transform("brfs")
      .bundle((err, data) => {
        if (err) {
          console.log(err);
          reject(err);
          return;
        }
        fs.outputFile(
          path.join(buildScriptRoot, `${buildFile}.js`),
          data,
          err => {
            if (err) {
              console.log(err);
              reject(err);
              return;
            }
            resolve();
            console.log(`Build success ${buildFile}`);
          }
        );
      });
  });
}

async function copyFiles() {
  console.log("Copy resources for chrome extension");
  await fs.copy(resourcesRoot, outpointRoot);
  console.log("Copy scripts for chrome extension");
  await fs.copy(buildScriptRoot, outpointRoot);
}

async function start() {
  await buildFiles.reduce((promiseChain, buildFile) => {
    return promiseChain.then(() => buildScript(buildFile).then());
  }, Promise.resolve([]));
  await copyFiles();
  console.log("success");
}

start();
