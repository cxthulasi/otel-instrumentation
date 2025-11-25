# Documentation

This folder contains comprehensive documentation for the Coralogix RUM and OpenTelemetry full-stack application.

## Viewing the Documentation

You can view the documentation in several ways:

### 1. Using a Markdown Viewer

The documentation is written in Markdown format, which can be viewed in any Markdown viewer or editor. Popular options include:

- Visual Studio Code with the Markdown Preview extension
- GitHub's web interface
- JetBrains IDEs (IntelliJ, WebStorm, etc.)
- Online Markdown viewers like [Dillinger](https://dillinger.io/) or [StackEdit](https://stackedit.io/)

### 2. Serving as a Static Website

You can serve the documentation as a static website and automatically open it in your default browser:

```bash
# Navigate to the documentation directory
cd documentation

# Run the script to serve and open the documentation
node open-docs.js
```

Or if you just want to serve the documentation without opening the browser:

```bash
# Navigate to the documentation directory
cd documentation

# Run the server script
node serve.js
```

Then manually open your browser and navigate to `http://localhost:3000`.

Alternatively, you can use other tools like:

#### Using `serve` package:

```bash
# Install serve globally
npm install -g serve

# Navigate to the documentation directory
cd documentation

# Serve the documentation
serve
```

#### Using Python's built-in HTTP server:

```bash
# Navigate to the documentation directory
cd documentation

# Start the HTTP server
python -m http.server 8000
```

Then open your browser and navigate to `http://localhost:8000`.

### 3. Converting to HTML

You can convert the Markdown files to HTML for easier viewing:

```bash
# Install markdown-to-html converter
npm install -g markdown-to-html-cli

# Convert all Markdown files to HTML
markdown-to-html --input "*.md" --output html
```

## Documentation Structure

- [index.md](./index.md) - Main documentation page
- [architecture.md](./architecture.md) - Overview of the project architecture
- [frontend.md](./frontend.md) - Frontend documentation
- [backend.md](./backend.md) - Backend documentation
- [trace-correlation.md](./trace-correlation.md) - Documentation on trace correlation
- [deployment.md](./deployment.md) - Deployment instructions

### Diagrams

The `images` folder contains Mermaid diagrams that visualize the architecture and trace correlation flow:

- [architecture-diagram.md](./images/architecture-diagram.md) - Architecture diagram
- [trace-correlation-diagram.md](./images/trace-correlation-diagram.md) - Trace correlation flow
- [coralogix-rum-methods.md](./images/coralogix-rum-methods.md) - Coralogix RUM SDK methods

To view these diagrams, you can use:

1. GitHub's built-in Mermaid renderer
2. [Mermaid Live Editor](https://mermaid.live/)
3. VS Code with the Mermaid extension

## Updating the Documentation

To update the documentation:

1. Edit the relevant Markdown files
2. If adding new diagrams, place them in the `images` folder
3. Update the links in the main documentation files as needed
