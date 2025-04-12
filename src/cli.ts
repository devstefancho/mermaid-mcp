#!/usr/bin/env node

/**
 * CLI entry point for the Mermaid MCP server
 * This file allows the server to be run directly with npx
 */

import { main } from "./index.js";

// Display banner
console.error(`
┌───────────────────────────────────────────┐
│           Mermaid MCP Server              │
│                                           │
│  A Mermaid flowchart generator for Claude │
└───────────────────────────────────────────┘
`);

// Start the server
main().catch((error) => {
  console.error("Fatal error in CLI:", error);
  process.exit(1);
});
