# @devstefancho/mermaid-mcp

An MCP server that helps create and analyze Mermaid flowcharts for use with Claude.

## Overview

This MCP server provides two tools:

1. `analyze-flowchart`: Analyzes a flowchart description for completeness and provides a preview
2. `generate-flowchart`: Converts a text description into a Mermaid flowchart

## Installation

### Using npx (Recommended)

The easiest way to use this tool is with npx, which comes with npm:

```bash
npx @devstefancho/mermaid-mcp
```

This will download and run the latest version of the Mermaid MCP server.

### Global Installation

You can also install the package globally:

```bash
npm install -g @devstefancho/mermaid-mcp
```

Then you can run it from anywhere:

```bash
mermaid-mcp
```

### Local Installation

For local development or integration:

```bash
# Install in your project
npm install @devstefancho/mermaid-mcp

# Run from your project
npx @devstefancho/mermaid-mcp
```

## Usage

### In Claude for Desktop

1. Open your Claude for Desktop configuration file:
   ```bash
   # macOS
   code ~/Library/Application\ Support/Claude/claude_desktop_config.json
   # Windows
   code %APPDATA%\Claude\claude_desktop_config.json
   ```

2. Add this server to your configuration:
   ```json
   {
     "mcpServers": {
       "mermaid-mcp": {
         "command": "npx",
         "args": ["-y", "@devstefancho/mermaid-mcp"]
       }
     }
   }
   ```

3. Restart Claude for Desktop

### Tools

#### Analyze Flowchart

Analyze your flowchart description for completeness and get a preview.

Usage example:
```
[Flowchart] First I check if the user is logged in. If yes, I show the dashboard. Otherwise, I redirect to the login page.
```

#### Generate Flowchart

Create a Mermaid flowchart from your text description.

Usage example:
```
[Flowchart] Start with user input. Then validate the input. If validation passes, process the data and show success message. Otherwise, show error message and return to user input.
```

## Development

### Running Locally

To run the server in development mode:

```bash
npm run dev
```

### Building the Project

```bash
npm run build
```

### Publishing to npm

To publish a new version to npm:

1. Update the version in `package.json`
2. Run the publish script:
   ```bash
   npm run publish
   ```

## License

MIT
