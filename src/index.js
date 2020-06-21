"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.importFromUrl = void 0;
const axios_1 = require("axios");
const cp = require("child_process");
const fs = require("fs");
const importFromUrl = async (url, options = {}) => {
    let old_url;
    if (!url.startsWith("https://github.com"))
        throw new Error("url must start with github");
    old_url = url;
    url = url.replace("https://github.com", "https://raw.githubusercontent.com");
    let result;
    try {
        result = await axios_1.default({
            method: "GET",
            url: `${url}/${options.branch ?? "master"}/package.json`
        });
    }
    catch (e) {
        console.log(`Failed installing from url: ${e.message}`);
        process.exit();
    }
    ;
    if (fs.existsSync(`${__dirname}/node_modules/${result.data.name}`)) {
        console.log(`Found ${result.data.name} dir in node_modules. Removing...`);
        fs.rmdirSync(`${__dirname}/node_modules/${result.data.name}`, { recursive: true });
    }
    if (result.data) {
        console.log(`Found: ${result.data.name}, installing v${result.data.version} via ${options.useNpm ? "npm" : "git"}.`);
        try {
            if (options.useNpm) {
                cp.execSync(`npm install ${result.data.name}@${result.data.version}`);
                console.log(`successfully installed ${result.data.name}@${result.data.version}`);
            }
            else {
                throw new Error('');
            }
        }
        catch (error) {
            if (error.message.length > 0)
                console.log(`npm failed, will try git instead.`);
            cp.exec(`git clone ${old_url}.git node_modules/${result.data.name}`, (error, out) => {
                if (error)
                    throw new Error(`failed installing ${result.data.name}@${result.data.version}\nMessage: ${error.message}`);
                console.log(`successfully installed ${result.data.name}@${result.data.version}`);
                if (result.data.scripts.install) {
                    console.log(`Found "install" script. Will use as well.`);
                    console.log("Installing dependencies...");
                    let deps = "npm install ";
                    for (let i of Object.entries(result.data.dependencies)) {
                        deps += `${i[0]}@${i[1]} `;
                    }
                    cp.execSync(deps, { cwd: `${__dirname}/node_modules/${result.data.name}` });
                    cp.exec(result.data.scripts.install, { cwd: `${__dirname}/node_modules/${result.data.name}` }, (error) => {
                        if (error) {
                            console.log(`Error: ${error.message}`);
                            process.exit();
                        }
                        console.log(`successfully installed ${result.data.name}@${result.data.version}`);
                    });
                }
            });
        }
        ;
    }
};
exports.importFromUrl = importFromUrl;
//# sourceMappingURL=index.js.map
