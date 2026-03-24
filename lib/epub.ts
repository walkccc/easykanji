const encoder = new TextEncoder();

function uint16LE(n: number): Uint8Array {
  return new Uint8Array([n & 0xff, (n >> 8) & 0xff]);
}

function uint32LE(n: number): Uint8Array {
  return new Uint8Array([
    n & 0xff,
    (n >> 8) & 0xff,
    (n >> 16) & 0xff,
    (n >> 24) & 0xff,
  ]);
}

let crcTable: Uint32Array | null = null;

function getCrcTable(): Uint32Array {
  if (crcTable) return crcTable;
  crcTable = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    crcTable[i] = c;
  }
  return crcTable;
}

function crc32(data: Uint8Array): number {
  const table = getCrcTable();
  let crc = 0xffffffff;
  for (let i = 0; i < data.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ data[i]) & 0xff];
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function concat(...arrays: Uint8Array[]): Uint8Array {
  const total = arrays.reduce((s, a) => s + a.length, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const a of arrays) {
    out.set(a, offset);
    offset += a.length;
  }
  return out;
}

interface ZipEntry {
  name: string;
  data: Uint8Array;
}

function buildZip(entries: ZipEntry[]): Uint8Array {
  const localParts: Uint8Array[] = [];
  const centralParts: Uint8Array[] = [];
  const entryOffsets: number[] = [];
  let offset = 0;

  for (const entry of entries) {
    const nameBytes = encoder.encode(entry.name);
    const crc = crc32(entry.data);
    const size = entry.data.length;

    const local = concat(
      new Uint8Array([0x50, 0x4b, 0x03, 0x04]),
      uint16LE(20), // version needed
      uint16LE(0), // flags
      uint16LE(0), // compression: store
      uint16LE(0), // mod time
      uint16LE(0), // mod date
      uint32LE(crc),
      uint32LE(size),
      uint32LE(size),
      uint16LE(nameBytes.length),
      uint16LE(0), // extra field length
      nameBytes,
      entry.data,
    );

    entryOffsets.push(offset);
    localParts.push(local);
    offset += local.length;

    centralParts.push(
      concat(
        new Uint8Array([0x50, 0x4b, 0x01, 0x02]),
        uint16LE(20),
        uint16LE(20),
        uint16LE(0),
        uint16LE(0), // compression: store
        uint16LE(0),
        uint16LE(0),
        uint32LE(crc),
        uint32LE(size),
        uint32LE(size),
        uint16LE(nameBytes.length),
        uint16LE(0), // extra length
        uint16LE(0), // comment length
        uint16LE(0), // disk start
        uint16LE(0), // internal attrs
        uint32LE(0), // external attrs
        uint32LE(entryOffsets[entryOffsets.length - 1]),
        nameBytes,
      ),
    );
  }

  const centralSize = centralParts.reduce((s, c) => s + c.length, 0);
  const eocd = concat(
    new Uint8Array([0x50, 0x4b, 0x05, 0x06]),
    uint16LE(0),
    uint16LE(0),
    uint16LE(entries.length),
    uint16LE(entries.length),
    uint32LE(centralSize),
    uint32LE(offset),
    uint16LE(0),
  );

  return concat(...localParts, ...centralParts, eocd);
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function exportEpub(title: string, html: string): void {
  const safeTitle = escapeXml(title.trim() || 'Furioke');
  const uid = `furioke-${Date.now()}`;

  const zip = buildZip([
    {
      name: 'mimetype',
      data: encoder.encode('application/epub+zip'),
    },
    {
      name: 'META-INF/container.xml',
      data: encoder.encode(
        `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`,
      ),
    },
    {
      name: 'OEBPS/content.opf',
      data: encoder.encode(
        `<?xml version="1.0" encoding="UTF-8"?>
<package version="3.0" xmlns="http://www.idpf.org/2007/opf" unique-identifier="uid">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:title>${safeTitle}</dc:title>
    <dc:language>ja</dc:language>
    <dc:identifier id="uid">${uid}</dc:identifier>
  </metadata>
  <manifest>
    <item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>
    <item id="chapter" href="chapter.xhtml" media-type="application/xhtml+xml"/>
    <item id="css" href="style.css" media-type="text/css"/>
  </manifest>
  <spine>
    <itemref idref="chapter"/>
  </spine>
</package>`,
      ),
    },
    {
      name: 'OEBPS/nav.xhtml',
      data: encoder.encode(
        `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" xml:lang="ja">
<head><meta charset="UTF-8"/><title>Navigation</title></head>
<body>
  <nav epub:type="toc">
    <ol><li><a href="chapter.xhtml">${safeTitle}</a></li></ol>
  </nav>
</body>
</html>`,
      ),
    },
    {
      name: 'OEBPS/chapter.xhtml',
      data: encoder.encode(
        `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="ja">
<head>
  <meta charset="UTF-8"/>
  <title>${safeTitle}</title>
  <link rel="stylesheet" href="style.css"/>
</head>
<body>
${title.trim() ? `  <h1>${safeTitle}</h1>\n` : ''}  <div class="lyrics">${html}</div>
</body>
</html>`,
      ),
    },
    {
      name: 'OEBPS/style.css',
      data: encoder.encode(
        `body {
  font-family: 'Hiragino Mincho ProN', 'Yu Mincho', 'Noto Serif JP', serif;
  font-size: 14pt;
  line-height: 2.8;
  color: #000;
  padding: 1rem;
}
h1 { font-size: 20pt; margin-bottom: 1rem; }
ruby rt { font-size: 0.5em; line-height: 1; }
.lyrics { white-space: pre-wrap; }
`,
      ),
    },
  ]);

  const blob = new Blob([zip.buffer as ArrayBuffer], {
    type: 'application/epub+zip',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${title.trim() || 'furioke'}.epub`;
  a.click();
  URL.revokeObjectURL(url);
}
