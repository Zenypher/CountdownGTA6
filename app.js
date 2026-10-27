const express = require("express");
const path = require("path");

const app = express();
const port = Number(process.env.PORT || 5000);

app.disable("x-powered-by");

app.use(express.static(path.join(__dirname, "public"), {
  setHeaders(res, filePath) {
    const versionedImage = /\.v\d+\.(webp|avif)$/.test(filePath);

    res.setHeader("Cache-Control", versionedImage ? "public, max-age=31536000, immutable" : "no-cache",);
  },
}));

app.listen(port, (error) => {
  if(error) {
    console.error("Failed to start server:", error.message);
    process.exitCode = 1;
    return;
  }

  console.log(`Server is listening at http://localhost:${port}`);
});
