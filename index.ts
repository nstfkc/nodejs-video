import express from "express";
import path from "path";
import fs from "fs";
import { IncomingMessage } from "http";

const app = express();
const port = 3000;

// Set the path to the directory where your video file is located
const getVideoPath = (p: string) => path.join(__dirname, "assets", p);

// Function to get video file stats (size and range)
const getVideoFileStats = (request: IncomingMessage, path: string) => {
  const videoPath = getVideoPath(path);
  const stat = fs.statSync(videoPath);
  const fileSize = stat.size;
  const range = request.headers.range;

  if (range) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunkSize = end - start + 1;
    const file = fs.createReadStream(videoPath, { start, end });
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

    return { headers, file: fs.createReadStream(videoPath) };
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
