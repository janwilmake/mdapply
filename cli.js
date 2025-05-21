#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

// Simple markdown parser for code blocks and inline code
class MarkdownParser {
  constructor(markdown) {
    this.markdown = markdown;
    this.fileContents = [];
  }

  parse() {
    // Find all code blocks with their positions
    const codeBlockRegex = /```(\w*)\n([\s\S]*?)```/g;
    const codeBlocks = [];
    let match;

    while ((match = codeBlockRegex.exec(this.markdown)) !== null) {
      codeBlocks.push({
        language: match[1],
        content: match[2],
        position: match.index,
      });
    }

    // Find all inline code blocks with their positions
    const inlineCodeRegex = /`([^`\n]+)`/g;
    const inlineCodes = [];

    while ((match = inlineCodeRegex.exec(this.markdown)) !== null) {
      inlineCodes.push({
        content: match[1],
        position: match.index,
      });
    }

    // Match code blocks with preceding inline code blocks
    for (let i = 0; i < codeBlocks.length; i++) {
      const codeBlock = codeBlocks[i];
      let prevBlockEnd =
        i > 0
          ? codeBlocks[i - 1].position + codeBlocks[i - 1].content.length + 7
          : 0; // +7 for the markdown code block syntax

      // Find the closest inline code before this code block but after the previous code block
      let filename = null;
      let closestInline = null;

      for (const inlineCode of inlineCodes) {
        if (
          inlineCode.position < codeBlock.position &&
          inlineCode.position > prevBlockEnd
        ) {
          if (!closestInline || inlineCode.position > closestInline.position) {
            closestInline = inlineCode;
            filename = inlineCode.content;
          }
        }
      }

      // If we found a filename, add it to our results
      if (filename) {
        this.fileContents.push({
          filename: filename,
          content: codeBlock.content,
          language: codeBlock.language,
        });
      }
    }

    return this.fileContents;
  }
}

// Main function
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error("Error: Please provide a markdown file path");
    console.log("Usage: mdapply <markdown-file>");
    process.exit(1);
  }

  const filePath = args[0];

  try {
    // Read the markdown file
    const markdown = fs.readFileSync(filePath, "utf8");

    // Parse the markdown to extract file contents
    const parser = new MarkdownParser(markdown);
    const fileContents = parser.parse();

    // Write files to disk
    console.log(
      `Found ${fileContents.length} code blocks with associated filenames`,
    );

    for (const file of fileContents) {
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
