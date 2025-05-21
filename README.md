[![](https://b.lmpify.com)](https://www.lmpify.com/consider-this-result-fwdb1a0)

Proposed flow: 1. make post on X, 2. use xymake url and a prompt, 3. now get resulting files and a cli to paste them into cwd: `npx mdapply {url}`. All I need is a nice function to fetch the url, parse the codeblocks and belonging filenames (either in codeblock variable or use the above backtick-code as filename).

It should then simply write these files into the cwd, which allows testing and seeing what was made. If this works, a button to find this command would be useful!
