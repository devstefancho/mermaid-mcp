/**
 * Mermaid MCP - Model Context Protocol Server for Flowchart Generation
 *
 * This file implements a server that integrates with the Model Context Protocol (MCP)
 * to provide flowchart analysis and generation capabilities using Mermaid syntax.
 * The server exposes the following tools:
 * 1. analyze-flowchart: Analyzes text descriptions of flowcharts for completeness
 * 2. convert-quotes: Converts double quotes to single quotes in flowchart descriptions
 * 3. generate-flowchart: Converts text descriptions into Mermaid flowchart syntax
 */

// Import required dependencies
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"; // Core MCP server functionality
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js"; // Transport layer for I/O
import { z } from "zod"; // Schema validation library

// Create a new MCP server instance with configuration
const server = new McpServer({
  name: "mermaid-mcp", // Server name identifier
  version: "1.0.0", // Server version
  capabilities: {
    resources: {}, // No specific resources defined
    tools: {}, // Tools will be registered later
  },
});

/**
 * Analyzes a flowchart description for completeness and generates a simple preview
 *
 * @param description - The text description of the flowchart
 * @returns Object containing analysis results:
 *   - isComplete: Boolean indicating if the description contains all necessary elements
 *   - missingInfo: Array of strings describing missing elements
 *   - preview: String containing a simple representation of the flowchart
 */
function analyzeFlowchartDescription(description: string): {
  isComplete: boolean;
  missingInfo: string[];
  preview: string;
} {
  const missingInfo: string[] = [];

  // Check if the description contains a starting point
  // This is essential for any flowchart to have a clear beginning
  if (
    !description.toLowerCase().includes("start") &&
    !description.toLowerCase().includes("begin") &&
    !description.toLowerCase().includes("first")
  ) {
    missingInfo.push("Starting point of the flowchart");
  }

  // Check if the description includes connections between steps
  // These words indicate relationships between different nodes
  const connectionWords = [
    "then",
    "next",
    "after",
    "followed by",
    "goes to",
    "leads to",
    "connects to",
    "->",
  ];
  const hasConnections = connectionWords.some((word) =>
    description.toLowerCase().includes(word),
  );
  if (!hasConnections) {
    missingInfo.push(
      "Connections between steps (use words like 'then', 'next', 'after', etc.)",
    );
  }

  // Check if the description contains decision points
  // These are important for branching logic in flowcharts
  const decisionWords = [
    "if",
    "else",
    "otherwise",
    "when",
    "case",
    "condition",
    "decision",
  ];
  const hasDecisions = decisionWords.some((word) =>
    description.toLowerCase().includes(word),
  );
  if (!hasDecisions) {
    missingInfo.push("Decision points (if any are needed in this flowchart)");
  }

  // Generate a simple text-based preview by splitting the description into steps
  // Uses periods, commas, and newlines as delimiters to identify separate steps
  const steps = description
    .split(/\.|,|\n/)
    .filter((step) => step.trim().length > 0);
  let preview = "Flow preview:\n";

  steps.forEach((step, index) => {
    preview += `${index + 1}. ${step.replace(/"/g, "").trim()}\n`;
  });

  return {
    isComplete: missingInfo.length === 0, // Description is complete if no info is missing
    missingInfo, // Array of missing elements
    preview, // Text-based preview of the flowchart
  };
}

/**
 * Register the analyze-flowchart tool with the MCP server
 * This tool checks flowchart descriptions for completeness and provides feedback
 */
server.tool(
  "analyze-flowchart", // Tool identifier
  "Analyze a flowchart description for completeness and provide a preview", // Tool description
  {
    // Input parameter schema defined with Zod
    description: z
      .string()
      .describe("The text description of the flowchart to analyze"),
  },
  // Handler function for the tool
  async ({ description }) => {
    // Analyze the provided description
    const analysis = analyzeFlowchartDescription(description);

    // Build the response text starting with the preview
    let responseText = analysis.preview + "\n\n";

    // Provide feedback based on analysis results
    if (analysis.isComplete) {
      // Positive feedback if the description is complete
      responseText +=
        "✅ Your flowchart description appears to be complete! You can now generate a Mermaid flowchart.";
    } else {
      // Constructive feedback if information is missing
      responseText +=
        "⚠️ Your flowchart description might be missing some information:\n";
      analysis.missingInfo.forEach((info) => {
        responseText += `- ${info}\n`;
      });
      responseText += "\nConsider adding more details for a better flowchart.";
    }

    // Return response in the expected MCP format
    return {
      content: [
        {
          type: "text",
          text: responseText,
        },
      ],
    };
  },
);

/**
 * Converts double quotes to single quotes in flowchart descriptions
 * This helps prevent syntax errors in Mermaid code generation
 *
 * @param description - The text description containing double quotes
 * @returns Object containing the converted description with single quotes
 */
function convertDoubleToSingleQuotesInsideText(description: string): {
  convertedDescription: string;
  replacementCount: number;
} {
  // Count how many replacements will be made
  const doubleQuoteCount = (description.match(/"/g) || []).length;

  // Replace double quotes with single quotes
  const convertedDescription = `"${description.replace(/"/g, "")}"`;

  return {
    convertedDescription,
    replacementCount: doubleQuoteCount,
  };
}

/**
 * Register the convert-quotes tool with the MCP server
 * This tool converts double quotes to single quotes in flowchart descriptions
 */
server.tool(
  "convert-quotes", // Tool identifier
  "Converts double quotes to single quotes in flowchart descriptions to prevent Mermaid syntax errors", // Tool description
  {
    // Input parameter schema defined with Zod
    description: z
      .string()
      .describe("The text description containing double quotes to convert"),
  },
  // Handler function for the tool
  async ({ description }) => {
    // Convert double quotes to single quotes
    const result = convertDoubleToSingleQuotesInsideText(description);

    // Build the response text
    let responseText = `Converted ${result.replacementCount} double quote(s) to single quotes.\n\n`;
    responseText += `Original description: ${description}\n\n`;
    responseText += `Converted description: ${result.convertedDescription}`;

    // Return response in the expected MCP format
    return {
      content: [
        {
          type: "text",
          text: responseText,
        },
      ],
    };
  },
);

/**
 * Main function to initialize and run the MCP server
 * Exported to be used by the CLI
 */
export async function main() {
  // Create a transport layer using standard input/output streams
  // This allows the server to communicate with clients via stdio
  const transport = new StdioServerTransport();

  // Connect the server to the transport and start handling requests
  await server.connect(transport);
}

// Execute the main function when this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error("Fatal error in main():", error);
    process.exit(1); // Exit with error code on failure
  });
}
