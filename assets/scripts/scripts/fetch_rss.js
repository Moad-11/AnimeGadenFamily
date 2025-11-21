const fs = require('fs');
const path = require('path');
const Parser = require('rss-parser');
const parser = new Parser();

const feeds = JSON.parse(fs.readFileSync('scripts/feeds.json', 'utf8'));

const postsDir = '_posts';
if (!fs.existsSync(postsDir)) fs.mkdirSync(postsDir);

function slugify(text){
  return text.toLowerCase().replace(/[^a-z0-9\u0600-\u06FF]+/g,'-').replace(/^-+|-+$/g,'').slice(0,80);
}

(async () => {
  for (const f of feeds){
    try {
      const feed = await parser.parseURL(f.url);

      for (const item of feed.items.slice(0,10)) {
        const date = item.isoDate || item.pubDate || new Date().toISOString();
        const yyyy = new Date(date).toISOString().slice(0,10);
        const slug = slugify(item.title || 'post');
        const filename = `${yyyy}-${slug}.md`;
        const filepath = path.join(postsDir, filename);

        if (fs.existsSync(filepath)) continue;

        const excerpt = item.contentSnippet
          ? item.contentSnippet.substring(0,200).replace(/\n/g,' ')
          : '';

        const md = `---
layout: post
title: "${item.title.replace(/"/g,'\\"')}"
date: ${new Date(date).toISOString()}
excerpt: "${excerpt.replace(/"/g,'\\"')}"
data_source: "${f.name}"
data_source_url: "${item.link}"
---
${excerpt}

[اقرأ المقال الأصلي](${item.link})
`;

        fs.writeFileSync(filepath, md);
        console.log("Created", filepath);
      }

    } catch (err){
      console.error("Error in feed:", f.url, err.message);
    }
  }
})();
