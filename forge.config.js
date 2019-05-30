const path = require('path');

module.exports = {
  "make_targets": {
    "win32": [
      "squirrel"
    ],
    "darwin": [
      "zip"
    ],
    "linux": [
      "deb",
      "rpm"
    ]
  },
  "electronPackagerConfig": {
    "packageManager": "yarn",
    "asar": true,
    // "icon": path.resolve(__dirname, "./src/react_part/public/images/icons/logo.ico"),
    "platform": ["win32", "darwin"],
    "arch": ["ia32", "x64"],
    "ignore": [
      ".idea",
      ".git"
    ]
  },
  "electronWinstallerConfig": {
    "name": "gaitsys",
  },
  "electronInstallerDebian": {},
  "electronInstallerRedhat": {},
  "github_repository": {
    "owner": "",
    "name": ""
  },
  "windowsStoreConfig": {
    "packageName": "",
    "name": "gaitsys"
  }
}