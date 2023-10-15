"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// index.ts
var import_express = __toESM(require("express"));
var import_path = __toESM(require("path"));
var import_fs = __toESM(require("fs"));
var app = (0, import_express.default)();
var port = 3e3;
var getVideoPath = (p) => import_path.default.join(__dirname, "assets", p);
var getVideoFileStats = (request, path2) => {
  const videoPath = getVideoPath(path2);
  const stat = import_fs.default.statSync(videoPath);
  const fileSize = stat.size;
  const range = request.headers.range;
  if (range) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunkSize = end - start + 1;
    const file = import_fs.default.createReadStream(videoPath, { start, end });
    const headers = {
      "Content-Range": `bytes ${start}-${end}/${fileSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": chunkSize,
      "Content-Type": "video/mp4"
    };
    return { headers, file };
  } else {
    const headers = {
      "Content-Length": fileSize,
      "Content-Type": "video/mp4"
    };
    return { headers, file: import_fs.default.createReadStream(videoPath) };
  }
};
app.get("/video/:path", (request, response) => {
  const { headers, file } = getVideoFileStats(request, request.params.path);
  response.writeHead(206, headers);
  file.pipe(response);
});
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
