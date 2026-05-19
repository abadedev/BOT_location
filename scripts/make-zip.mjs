import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Enviar Localização</title>
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
html, body { height: 100%; overflow: hidden; background: #0a0a0a; }
iframe { width: 100%; height: 100vh; border: none; display: block; }
</style>
</head>
<body>
<iframe src="https://bot-location.vercel.app/gps-tracker.html" allow="geolocation *"></iframe>
</body>
</html>`

// Criar ZIP manualmente sem dependências externas
function createZip(filename, content) {
  const data = Buffer.from(content, 'utf8')

  // Local file header
  const nameBytes = Buffer.from(filename, 'utf8')
  const header = Buffer.alloc(30 + nameBytes.length)
  header.writeUInt32LE(0x04034b50, 0) // signature
  header.writeUInt16LE(20, 4) // version needed
  header.writeUInt16LE(0, 6) // flags
  header.writeUInt16LE(0, 8) // compression (stored)
  header.writeUInt16LE(0, 10) // mod time
  header.writeUInt16LE(0, 12) // mod date
  header.writeUInt32LE(crc32(data), 14) // crc32
  header.writeUInt32LE(data.length, 18) // compressed size
  header.writeUInt32LE(data.length, 22) // uncompressed size
  header.writeUInt16LE(nameBytes.length, 26) // filename length
  header.writeUInt16LE(0, 28) // extra length
  nameBytes.copy(header, 30)

  const fileData = data
  const offset = 0

  // Central directory
  const central = Buffer.alloc(46 + nameBytes.length)
  central.writeUInt32LE(0x02014b50, 0) // signature
  central.writeUInt16LE(20, 4) // version made by
  central.writeUInt16LE(20, 6) // version needed
  central.writeUInt16LE(0, 8) // flags
  central.writeUInt16LE(0, 10) // compression
  central.writeUInt16LE(0, 12) // mod time
  central.writeUInt16LE(0, 14) // mod date
  central.writeUInt32LE(crc32(data), 16) // crc32
  central.writeUInt32LE(data.length, 20) // compressed size
  central.writeUInt32LE(data.length, 24) // uncompressed size
  central.writeUInt16LE(nameBytes.length, 28) // filename length
  central.writeUInt16LE(0, 30) // extra length
  central.writeUInt16LE(0, 32) // comment length
  central.writeUInt16LE(0, 34) // disk start
  central.writeUInt16LE(0, 36) // internal attr
  central.writeUInt32LE(0, 38) // external attr
  central.writeUInt32LE(offset, 42) // local header offset
  nameBytes.copy(central, 46)

  const localSize = header.length + fileData.length

  // End of central directory
  const end = Buffer.alloc(22)
  end.writeUInt32LE(0x06054b50, 0) // signature
  end.writeUInt16LE(0, 4) // disk number
  end.writeUInt16LE(0, 6) // disk with central dir
  end.writeUInt16LE(1, 8) // entries on disk
  end.writeUInt16LE(1, 10) // total entries
  end.writeUInt32LE(central.length, 12) // central dir size
  end.writeUInt32LE(localSize, 16) // central dir offset
  end.writeUInt16LE(0, 20) // comment length

  return Buffer.concat([header, fileData, central, end])
}

function crc32(data) {
  let crc = 0xFFFFFFFF
  const table = makeCRCTable()
  for (let i = 0; i < data.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ data[i]) & 0xFF]
  }
  return (crc ^ 0xFFFFFFFF) >>> 0
}

function makeCRCTable() {
  const table = []
  for (let i = 0; i < 256; i++) {
    let c = i
    for (let j = 0; j < 8; j++) {
      c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1
    }
    table[i] = c
  }
  return table
}

const zip = createZip('index.html', html)
const outPath = path.join(__dirname, '../public/bitrix-app.zip')
fs.writeFileSync(outPath, zip)
console.log('ZIP criado em:', outPath)
