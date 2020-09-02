#!/bin/sh

folder=src/content/articles
files=$(git status -s | grep "^ A ${folder}" | grep "\.md$" | awk '{ print $2 }');
repo=stalniy/freaksidea-pwa

if [ "$files" = "" ]; then
  echo 'Skip issue generation. No new articles found';
  exit 0;
fi

parseYAML='
  const yaml = require("js-yaml");
  const fs = require("fs");
  const rawContent = fs.readFileSync(process.stdin.fd, "utf-8");
  const index = rawContent.indexOf("---", 4);
  const content = yaml.safeLoad(rawContent.slice(4, index));

  if (!content.id) {
    console.log(content.title);
  }
';
updateYAML='
  const fs = require("fs");
  const issue = JSON.parse(fs.readFileSync(process.stdin.fd, "utf-8"));
  const path = process.argv[1];
  const content = fs.readFileSync(path, "utf-8");
  const newContent = `---\nid: ${issue.number} # auto-generated!\n${content.slice(4)}`;
  fs.writeFileSync(path, newContent);
';

for path in $files; do
  title=$(head -40 "$path" | node -e "$parseYAML");

  if [ "$title" = "" ]; then
    echo "Skip '$path', it has been associated with issue before"
  else
    filename=$(basename "$path")
    echo "Create github issue for '$path'..."
    curl -s \
      -X POST \
      -H "Authorization: token $GH_TOKEN" \
      -H "Accept: application/vnd.github.v3+json" \
      -d "{\"title\": \"${title/\"/}\", \"labels\": [\"blogPost\", \"${filename/.md/}\"] }" \
      https://api.github.com/repos/${repo}/issues \
    | node -e "$updateYAML" "$path"
  fi
done
