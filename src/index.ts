/**
 * Mermaid MCP - Model Context Protocol Server for Flowchart Generation
 *
 * This file implements a server that integrates with the Model Context Protocol (MCP)
 * to provide flowchart analysis and generation capabilities using Mermaid syntax.
 * The server exposes two main tools:
 * 1. analyze-flowchart: Analyzes text descriptions of flowcharts for completeness
 * 2. generate-flowchart: Converts text descriptions into Mermaid flowchart syntax
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
    preview += `${index + 1}. ${step.trim()}\n`;
  });

  return {
    isComplete: missingInfo.length === 0, // Description is complete if no info is missing
    missingInfo, // Array of missing elements
    preview, // Text-based preview of the flowchart
  };
}

/**
 * Escapes special characters in a string for JSON safety
 *
 * @param text - The text to escape
 * @returns Escaped string safe for JSON inclusion
 */
function escapeJsonString(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r")
    .replace(/\t/g, "\\t");
}

/**
 * Generates Mermaid flowchart syntax from a text description
 *
 * @param description - The text description of the flowchart
 * @returns String containing the Mermaid flowchart code
 */
function generateFlowchart(description: string): string {
  // Start with the basic Mermaid flowchart declaration
  // TD indicates top-down direction for the flowchart
  let flowchart = "flowchart TD\n";

  // Parse the description into individual steps
  // Split by periods, commas, and newlines, then clean and filter the results
  const stepTexts = description
    .split(/\.|,|\n/)
    .filter((step) => step.trim().length > 0)
    .map((step) => step.trim());

  // Create node objects with unique IDs and labels from the step texts
  const nodes: { id: string; label: string }[] = [];

  stepTexts.forEach((text, index) => {
    const id = `step${index + 1}`;
    // Clean the label to remove characters that might cause issues in Mermaid
    const cleanedLabel = text.replace(/['"]/g, "");
    nodes.push({ id, label: cleanedLabel });
  });

  // Add node definitions to the flowchart
  // Format: id["label"]
  nodes.forEach((node) => {
    flowchart += `    ${node.id}["${node.label}"]\n`;
  });

  // Connect nodes in sequence, with special handling for conditional statements
  for (let i = 0; i < nodes.length - 1; i++) {
    const current = nodes[i].id;
    const next = nodes[i + 1].id;

    // Check if the current node indicates a decision point
    if (
      nodes[i].label.toLowerCase().includes("if") ||
      nodes[i].label.toLowerCase().includes("decide") ||
      nodes[i].label.toLowerCase().includes("check")
    ) {
      // If it's a decision point, look for the matching "else" case
      let foundElse = false;
      for (let j = i + 1; j < nodes.length; j++) {
        if (
          nodes[j].label.toLowerCase().includes("else") ||
          nodes[j].label.toLowerCase().includes("otherwise")
        ) {
          // Create 'Yes' and 'No' branches for the decision
          flowchart += `    ${current} -->|Yes| ${nodes[i + 1].id}\n`;
          flowchart += `    ${current} -->|No| ${nodes[j].id}\n`;
          foundElse = true;
          break;
        }
      }

      // If no "else" case was found, just create a simple connection
      if (!foundElse) {
        flowchart += `    ${current} --> ${next}\n`;
      }
    } else {
      // For non-decision nodes, create simple connections
      flowchart += `    ${current} --> ${next}\n`;
    }
  }

  return flowchart;
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
 * Register the generate-flowchart tool with the MCP server
 * This tool converts textual descriptions into Mermaid flowchart syntax
 */
server.tool(
  "generate-flowchart", // Tool identifier
  "Generate a Mermaid flowchart from a text description", // Tool description
  {
    // Input parameter schema defined with Zod
    description: z
      .string()
      .describe("The text description of the flowchart to generate"),
  },
  // Handler function for the tool
  async ({ description }) => {
    try {
      // Generate Mermaid syntax from the description
      const mermaidCode = generateFlowchart(description);

      // Use a simpler format for the response to avoid JSON parsing issues
      return {
        content: [
          {
            type: "text",
            text:
              "Here's your Mermaid flowchart code:\n\n```mermaid\n" +
              mermaidCode +
              "\n```\n\nYou can use this code in any Mermaid-compatible tool or editor.",
          },
        ],
      };
    } catch (error) {
      console.error("Error generating flowchart:", error);
      return {
        content: [
          {
            type: "text",
            text:
              "Error generating flowchart: " +
              (error instanceof Error ? error.message : String(error)),
          },
        ],
      };
    }
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
