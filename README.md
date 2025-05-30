# mdapply

[![](https://b.lmpify.com)](https://www.lmpify.com/consider-this-result-fwdb1a0)

A CLI tool to extract code blocks from markdown files and create actual files from them.

## Usage

```bash
npx mdapply <markdown-file-or-url>
```

## Supported Code Block Formats

The tool looks for code blocks with file path parameters:

### Using `path` parameter:

````md
```js path="src/index.js"
console.log("Hello, world!");
```
````

You can also use `name` or `title`

## Features

- Supports both local markdown files and URLs
- Creates directory structure automatically
- Uses the `marked` library for robust markdown parsing
- Supports multiple parameter names (`path`, `name`, `title`)
- Handles quoted and unquoted parameter values

## Flow

1. Make a post on X with code examples
2. Use xymake URL and a prompt to generate files
3. Use `npx mdapply {url}` to extract and create the files locally
4. Test and iterate on the generated code

## Example

Given a markdown file with:

````md
```js path="package.json"
{
  "name": "my-project",
  "version": "1.0.0"
}
```

```js path="src/index.js"
console.log("Starting application...");
```
````

Running `npx mdapply example.md` will create:

- `package.json`
- `src/index.js`
