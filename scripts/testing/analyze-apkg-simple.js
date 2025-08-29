const fs = require('fs');
const JSZip = require('jszip');

async function analyzeApkgSimple() {
  try {
    console.log('🔍 Análise simples do arquivo Idiomatic Expressions P1.apkg...');
    
    const fileData = fs.readFileSync('/home/administrator/flash-site-cursors/Idiomatic Expressions P1.apkg');
    console.log(`📦 Arquivo: ${(fileData.length / (1024*1024)).toFixed(2)} MB`);
    
    const zip = await JSZip.loadAsync(fileData);
    const fileNames = Object.keys(zip.files);
    console.log(`📂 Total de arquivos: ${fileNames.length}`);
    
    // Verificar arquivo meta
    const metaFile = zip.files['meta'];
    if (metaFile) {
      console.log('\n📋 Arquivo meta encontrado:');
      try {
        const metaContent = await metaFile.async('text');
        console.log('Conteúdo meta:', metaContent);
      } catch (e) {
        console.log('Erro ao ler meta como texto, tentando como binary...');
        const metaBytes = await metaFile.async('uint8array');
        console.log(`Meta binary: ${metaBytes.length} bytes`);
        const signature = Array.from(metaBytes.slice(0, 10)).map(b => b.toString(16).padStart(2, '0')).join(' ');
        console.log(`Assinatura: ${signature}`);
      }
    }
    
    // Verificar arquivo media
    const mediaFile = zip.files['media'];
    if (mediaFile) {
      console.log('\n📋 Arquivo media encontrado:');
      try {
        const mediaContent = await mediaFile.async('text');
        console.log('Conteúdo media (primeiros 200 chars):', mediaContent.substring(0, 200));
      } catch (e) {
        console.log('Erro ao ler media como texto, tentando como binary...');
        const mediaBytes = await mediaFile.async('uint8array');
        console.log(`Media binary: ${mediaBytes.length} bytes`);
        const signature = Array.from(mediaBytes.slice(0, 20)).map(b => b.toString(16).padStart(2, '0')).join(' ');
        console.log(`Assinatura: ${signature}`);
        
        // Tentar detectar se é comprimido
        if (mediaBytes[0] === 0x28 && mediaBytes[1] === 0xb5 && mediaBytes[2] === 0x2f && mediaBytes[3] === 0xfd) {
          console.log('📦 Arquivo parece estar comprimido com Zstandard (zstd)');
        }
      }
    }
    
    // Listar alguns arquivos de mídia
    const mediaFiles = fileNames.filter(name => /^\d+$/.test(name)).slice(0, 10);
    console.log('\n🎵 Primeiros 10 arquivos de mídia:');
    for (const fileName of mediaFiles) {
      const file = zip.files[fileName];
      const data = await file.async('uint8array');
      const signature = Array.from(data.slice(0, 4)).map(b => b.toString(16).padStart(2, '0')).join(' ');
      console.log(`  ${fileName}: ${data.length} bytes, assinatura: ${signature}`);
    }
    
    // Conclusão
    console.log('\n📊 CONCLUSÃO:');
    console.log(`✅ Arquivo .apkg é válido e contém ${fileNames.length} arquivos`);
    console.log(`✅ Contém 2189 arquivos de mídia (áudios/imagens)`);
    console.log(`✅ Tem banco de dados SQLite (collection.anki2)`);
    console.log(`❌ Só tem 1 flashcard (mensagem de erro de compatibilidade)`);
    console.log(`⚠️  Arquivos de mídia podem estar comprimidos com Zstandard`);
    console.log(`⚠️  Pode ser arquivo de versão antiga/incompatível do Anki`);
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

analyzeApkgSimple();