// file: transform-package.js
import fs from "fs";

// Baca file package.json
const raw = fs.readFileSync("package.json", "utf-8");
const pkg = JSON.parse(raw);

// Buat struktur baru
const newPkg = {
  name: pkg.name,
  version: pkg.version,
  type: pkg.type,
  files: pkg.files,
  "directus:extension": {
    type: pkg["directus:extension"].type,
    path: {
      app: "./app.js",
      api: "./api.js",
    },
    entries: pkg["directus:extension"].entries,
    host: pkg["directus:extension"].host,
  },
};

// Tulis hasil ke package.json (overwrite)
fs.writeFileSync("./dist/package.json", JSON.stringify(newPkg, null, 2));

console.log("✅ package.json berhasil diubah!");
