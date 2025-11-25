const { exec } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const PORT = 3000;

// Function to open URL in the default browser
function openBrowser(url) {
  let command;
  
  switch (os.platform()) {
    case 'darwin': // macOS
      command = `open "${url}"`;
      break;
    case 'win32': // Windows
      command = `start "" "${url}"`;
      break;
    default: // Linux and others
      command = `xdg-open "${url}"`;
      break;
  }
  
  exec(command, (error) => {
    if (error) {
      console.error(`Failed to open browser: ${error}`);
    }
  });
}

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.md': 'text/markdown',
};

const server = http.createServer((req, res) => {
  console.log(`${req.method} ${req.url}`);

  // Normalize URL to prevent directory traversal attacks
  let filePath = path.normalize(path.join(__dirname, req.url === '/' ? 'index.html' : req.url));

  // Check if file exists
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      res.statusCode = 404;
      res.end(`File ${filePath} not found!`);
      return;
    }

    // Check if it's a directory
    fs.stat(filePath, (err, stats) => {
      if (err) {
        res.statusCode = 500;
        res.end(`Error: ${err}`);
        return;
      }

      if (stats.isDirectory()) {
        filePath = path.join(filePath, 'index.html');
      }

      // Read file
      fs.readFile(filePath, (err, data) => {
        if (err) {
          res.statusCode = 500;
          res.end(`Error: ${err}`);
          return;
        }

        // Get the file extension
        const extname = path.extname(filePath);
        const contentType = MIME_TYPES[extname] || 'application/octet-stream';

        // Send response
        res.setHeader('Content-Type', contentType);
        res.end(data);
      });
    });
  });
});

server.listen(PORT, () => {
  console.log(`Documentation server running at http://localhost:${PORT}/`);
  console.log(`Opening documentation in your default browser...`);
  console.log(`Press Ctrl+C to stop the server`);
  
  // Open the browser after a short delay to ensure the server is ready
  setTimeout(() => {
    openBrowser(`http://localhost:${PORT}/`);
  }, 1000);
});
