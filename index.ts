import express from "express";
import path from "path";
import fs from "fs";
import { IncomingMessage } from "http";
import { ui } from "./ui";

const app = express();
const port = 3000;

const assetsDir = process.env.ASSETS_DIR!;
// Set the path to the directory where your video file is located
const getVideoPath = (p: string) => path.join(__dirname, "..", "assets", p);

// Function to get video file stats (size and range)
const getVideoFileStats = (request: IncomingMessage, path: string) => {
  const stat = fs.statSync(path);
  const fileSize = stat.size;
  const range = request.headers.range;

  if (range) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunkSize = end - start + 1;
    const file = fs.createReadStream(path, { start, end });
    const headers = {
      "Content-Range": `bytes ${start}-${end}/${fileSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": chunkSize,
      "Content-Type": "video/mp4",
    };

    return { headers, file };
  } else {
    const headers = {
      "Content-Length": fileSize,
      "Content-Type": "video/mp4",
    };

    return { headers, file: fs.createReadStream(path) };
  }
};

app.get("/video/:path", (request, response) => {
  const videoPath = getVideoPath(request.params.path);
  const { headers, file } = getVideoFileStats(request, videoPath);
  response.writeHead(206, headers);
  file.pipe(response);
});

function findMP4Files(directoryPath: string, mp4Files: string[] = []) {
  const files = fs.readdirSync(directoryPath);

  files.forEach((file) => {
    const filePath = path.join(directoryPath, file);
    const fileStat = fs.statSync(filePath);

    if (fileStat.isDirectory()) {
      // If the current item is a directory, recursively search for mp4 files inside it
      findMP4Files(filePath, mp4Files);
    } else {
      // If the current item is a file and ends with .mp4, add it to the result array
      if (path.extname(filePath).toLowerCase() === ".mp4") {
        mp4Files.push(filePath);
      }
    }
  });

  return mp4Files.map((p) => p.replace(assetsDir, ""));
}

app.get("/home", (request, response) => {
  const list = findMP4Files(assetsDir);
  response.send(ui(list));
});

app.get("/watch/:path", (req, res) => {
  const videoPath = path.join(assetsDir, req.params.path);
  const { headers, file } = getVideoFileStats(req, videoPath);
  res.writeHead(206, headers);
  file.pipe(res);
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
