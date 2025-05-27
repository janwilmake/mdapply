#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { marked } = require("marked");

// Custom renderer to extract code blocks with file paths
class FileExtractorRenderer extends marked.Renderer {
  constructor() {
    super();
    this.files = [];
  }

  code(code, infostring, escaped) {
    if (infostring) {
      // Parse the info string to extract language and parameters
      const parts = infostring.split(/\s+/);
      const language = parts[0] || "";

      // Look for path, name, or title parameters
      let filepath = null;

      for (let i = 1; i < parts.length; i++) {
        const part = parts[i];
        const pathMatch = part.match(
          /^(?:path|name|title)=["']?([^"']+)["']?$/,
        );
        if (pathMatch) {
          filepath = pathMatch[1];
          break;
        }
      }

      // If we found a filepath, store the file
      if (filepath) {
        this.files.push({
          filename: filepath,
          content: code,
          language: language,
        });
      }
    }

    // Return empty string since we're just extracting, not rendering
    return "";
  }
}

// Function to extract files from markdown
function extractFilesFromMarkdown(markdown) {
  const renderer = new FileExtractorRenderer();

  // Configure marked to use our custom renderer
  marked.setOptions({
    renderer: renderer,
    gfm: true,
    breaks: false,
  });

  // Parse the markdown (this will populate renderer.files)
  marked(markdown);

  return renderer.files;
}

// Main function
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error("Error: Please provide a markdown file path or URL");
    console.log("Usage: mdapply <markdown-file-or-url>");
    process.exit(1);
  }

  const input = args[0];
  let markdown;

  try {
    // Check if input is a URL
    if (input.startsWith("http://") || input.startsWith("https://")) {
      console.log(`Fetching markdown from: ${input}`);
      const response = await fetch(input);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      markdown = await response.text();
    } else {
      // Read local file
      console.log(`Reading markdown from: ${input}`);
      markdown = fs.readFileSync(input, "utf8");
    }

    // Extract files from markdown
    const files = extractFilesFromMarkdown(markdown);

    // Write files to disk
    console.log(`Found ${files.length} code blocks with file paths`);

    if (files.length === 0) {
      console.log("No code blocks with path/name/title parameters found.");
      console.log('Expected format: ```js path="filename.js"');
      return;
    }

    for (const file of files) {
      try {
        const fullPath = path.join(process.cwd(), file.filename);

        // Create directory if it doesn't exist
        const directory = path.dirname(fullPath);
        if (!fs.existsSync(directory)) {
          fs.mkdirSync(directory, { recursive: true });
        }

        // Write file
        fs.writeFileSync(fullPath, file.content);
        console.log(`Created: ${file.filename}`);
      } catch (err) {
        console.error(`Error creating ${file.filename}: ${err.message}`);
      }
    }

    console.log("Done!");
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
}

// Run the main function
main().catch((err) => {
  console.error(`Unhandled error: ${err.message}`);
  process.exit(1);
});
