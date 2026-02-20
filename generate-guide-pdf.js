const fs = require('fs');
const path = require('path');

// Read the markdown
const md = fs.readFileSync(path.join(__dirname, 'IGNITE_User_Guide.md'), 'utf8');

function convertMarkdownToHtml(markdown) {
    const lines = markdown.split('\n');
    const output = [];
    let i = 0;
    let inList = false;
    let listType = null;

    function closeList() {
        if (inList) {
            output.push(listType === 'ol' ? '</ol>' : '</ul>');
            inList = false;
            listType = null;
        }
    }

    function processInline(text) {
        // Bold
        text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
        // Italic
        text = text.replace(/(?<!\*)\*([^*]+?)\*(?!\*)/g, '<em>$1</em>');
        // Inline code
        text = text.replace(/`([^`]+)`/g, '<code class="inline">$1</code>');
        // Links
        text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
        // Emoji shortcodes are already unicode, keep as-is
        return text;
    }

    while (i < lines.length) {
        const line = lines[i];
        const trimmed = line.trim();

        // Empty line
        if (trimmed === '') {
            closeList();
            i++;
            continue;
        }

        // Horizontal rule
        if (trimmed === '---') {
            closeList();
            output.push('<hr>');
            i++;
            continue;
        }

        // Headers
        const headerMatch = trimmed.match(/^(#{1,4})\s+(.+)$/);
        if (headerMatch) {
            closeList();
            const level = headerMatch[1].length;
            const text = processInline(headerMatch[2]);
            output.push(`<h${level}>${text}</h${level}>`);
            i++;
            continue;
        }

        // Table detection: line starts with | and next line is separator
        if (trimmed.startsWith('|') && i + 1 < lines.length && lines[i + 1].trim().match(/^\|[\s\-:|]+\|$/)) {
            closeList();
            // Parse header row
            const headerCells = trimmed.split('|').slice(1, -1).map(c => processInline(c.trim()));
            i++; // skip separator line
            i++;

            // Parse body rows
            const bodyRows = [];
            while (i < lines.length && lines[i].trim().startsWith('|')) {
                const cells = lines[i].trim().split('|').slice(1, -1).map(c => processInline(c.trim()));
                bodyRows.push(cells);
                i++;
            }

            // Generate table HTML
            output.push('<table>');
            output.push('<thead><tr>');
            headerCells.forEach(cell => output.push(`<th>${cell}</th>`));
            output.push('</tr></thead>');
            output.push('<tbody>');
            bodyRows.forEach(row => {
                output.push('<tr>');
                row.forEach(cell => output.push(`<td>${cell}</td>`));
                output.push('</tr>');
            });
            output.push('</tbody></table>');
            continue;
        }

        // Blockquote
        if (trimmed.startsWith('> ')) {
            closeList();
            const quoteLines = [];
            while (i < lines.length && lines[i].trim().startsWith('> ')) {
                quoteLines.push(processInline(lines[i].trim().substring(2)));
                i++;
            }
            output.push(`<blockquote>${quoteLines.join('<br>')}</blockquote>`);
            continue;
        }

        // Checkbox list items
        if (trimmed.match(/^- \[([ x])\] /)) {
            closeList();
            if (!inList) {
                output.push('<ul class="checklist">');
                inList = true;
                listType = 'ul';
            }
            const checked = trimmed[3] === 'x';
            const text = processInline(trimmed.substring(6));
            output.push(`<li class="checkbox ${checked ? 'checked' : ''}">${checked ? '☑' : '☐'} ${text}</li>`);
            i++;
            continue;
        }

        // Unordered list
        if (trimmed.match(/^[-*]\s/)) {
            if (!inList || listType !== 'ul') {
                closeList();
                output.push('<ul>');
                inList = true;
                listType = 'ul';
            }
            const text = processInline(trimmed.replace(/^[-*]\s+/, ''));
            output.push(`<li>${text}</li>`);
            i++;
            continue;
        }

        // Ordered list
        if (trimmed.match(/^\d+\.\s/)) {
            if (!inList || listType !== 'ol') {
                closeList();
                output.push('<ol>');
                inList = true;
                listType = 'ol';
            }
            const text = processInline(trimmed.replace(/^\d+\.\s+/, ''));
            output.push(`<li>${text}</li>`);
            i++;
            continue;
        }

        // Regular paragraph
        closeList();
        output.push(`<p>${processInline(trimmed)}</p>`);
        i++;
    }

    closeList();
    return output.join('\n');
}

const htmlBody = convertMarkdownToHtml(md);

const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>IGNITE V2 — Complete User Guide</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

  * { margin: 0; padding: 0; box-sizing: border-box; }

  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    color: #1a1a2e;
    line-height: 1.75;
    background: #fff;
    font-size: 11pt;
  }

  .container {
    max-width: 820px;
    margin: 0 auto;
    padding: 40px 50px;
  }

  /* Cover Page */
  .cover {
    text-align: center;
    padding: 100px 40px 80px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    margin: -40px -50px 40px -50px;
    page-break-after: always;
  }
  .cover .fire { font-size: 64pt; margin-bottom: 16px; display: block; }
  .cover h1 {
    font-size: 42pt; font-weight: 800; margin: 0 0 8px 0;
    letter-spacing: -1.5px; border: none; padding: 0; color: white;
  }
  .cover .subtitle {
    font-size: 16pt; font-weight: 300; opacity: 0.9; margin-bottom: 24px;
  }
  .cover .desc {
    font-size: 11pt; opacity: 0.8; line-height: 1.8; max-width: 500px; margin: 0 auto;
  }
  .cover .version {
    font-size: 10pt; opacity: 0.6; margin-top: 50px;
  }

  /* Typography */
  h1 {
    font-size: 22pt;
    font-weight: 800;
    color: #1a1a2e;
    margin: 44px 0 14px 0;
    padding-bottom: 8px;
    border-bottom: 3px solid #667eea;
    page-break-after: avoid;
  }

  h2 {
    font-size: 15pt;
    font-weight: 700;
    color: #2d2d5e;
    margin: 32px 0 12px 0;
    padding-bottom: 5px;
    border-bottom: 1.5px solid #e4e4e4;
    page-break-after: avoid;
  }

  h3 {
    font-size: 12pt;
    font-weight: 600;
    color: #4a4a8a;
    margin: 22px 0 8px 0;
    page-break-after: avoid;
  }

  h4 {
    font-size: 11pt;
    font-weight: 600;
    color: #555;
    margin: 16px 0 6px 0;
  }

  p {
    margin: 7px 0;
    color: #333;
  }

  strong { color: #1a1a2e; }

  a { color: #667eea; text-decoration: none; }

  /* Blockquotes */
  blockquote {
    border-left: 4px solid #667eea;
    background: #f4f4ff;
    padding: 14px 18px;
    margin: 16px 0;
    border-radius: 0 8px 8px 0;
    color: #444;
  }
  blockquote p { margin: 4px 0; }

  /* Tables */
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 14px 0;
    font-size: 10pt;
    page-break-inside: auto;
    border: 1px solid #d0d0e0;
    border-radius: 6px;
    overflow: hidden;
  }

  thead {
    background: linear-gradient(135deg, #667eea, #764ba2);
  }

  th {
    color: white;
    padding: 10px 14px;
    text-align: left;
    font-weight: 600;
    font-size: 9.5pt;
    text-transform: uppercase;
    letter-spacing: 0.3px;
    border: none;
  }

  td {
    padding: 9px 14px;
    border-bottom: 1px solid #eaeaf0;
    color: #333;
    vertical-align: top;
  }

  tbody tr:nth-child(even) td { background: #f8f8fc; }
  tbody tr:last-child td { border-bottom: none; }

  /* Lists */
  ul, ol {
    margin: 8px 0 8px 28px;
    color: #333;
  }

  li {
    margin: 5px 0;
    padding-left: 4px;
  }

  ul.checklist {
    list-style: none;
    margin-left: 8px;
  }

  li.checkbox {
    padding: 3px 0 3px 0;
    color: #555;
  }

  li.checkbox.checked { color: #2d8a4e; }

  /* Code */
  code.inline {
    background: #eeeeff;
    color: #5b4fcf;
    padding: 2px 7px;
    border-radius: 4px;
    font-size: 9.5pt;
    font-family: 'Consolas', 'Monaco', monospace;
  }

  hr {
    border: none;
    border-top: 2px solid #e4e4e4;
    margin: 32px 0;
  }

  /* Print */
  @media print {
    body { font-size: 10pt; }
    .container { padding: 15px 25px; max-width: 100%; }
    .cover { margin: -15px -25px 25px -25px; padding: 70px 30px 60px; }
    .cover h1 { font-size: 34pt; }
    h1 { font-size: 18pt; margin-top: 32px; }
    h2 { font-size: 13pt; margin-top: 24px; }
    h3 { font-size: 11pt; }
    table { font-size: 9pt; }
    th { padding: 7px 10px; }
    td { padding: 6px 10px; }
    a { color: #333; }
    h1, h2, h3, h4 { page-break-after: avoid; }
    table, blockquote { page-break-inside: avoid; }
    .no-print { display: none !important; }
  }

  /* Print button */
  .print-btn {
    position: fixed;
    top: 20px;
    right: 20px;
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: white;
    border: none;
    padding: 14px 28px;
    border-radius: 10px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    box-shadow: 0 4px 15px rgba(102,126,234,0.4);
    z-index: 100;
    transition: all 0.2s;
    font-family: inherit;
  }
  .print-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(102,126,234,0.5);
  }
</style>
</head>
<body>

<button class="print-btn no-print" onclick="window.print()">📄 Save as PDF (Ctrl+P)</button>

<div class="container">

<!-- Cover Page -->
<div class="cover">
  <span class="fire">🔥</span>
  <h1>IGNITE V2</h1>
  <div class="subtitle">Complete User Guide</div>
  <p class="desc">Your step-by-step guide to running events with IGNITE.<br>Every button, every click, explained in detail.</p>
  <div class="version">Version 2.0 &bull; February 2026 &bull; For Users & Testers</div>
</div>

${htmlBody}

</div>
</body>
</html>`;

fs.writeFileSync(path.join(__dirname, 'IGNITE_User_Guide.html'), fullHtml, 'utf8');
console.log('✅ Generated IGNITE_User_Guide.html with proper tables');
