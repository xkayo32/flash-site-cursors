const fs = require('fs');
const path = '/home/administrator/flash-site-cursors/frontend/src/pages/student/FlashcardsPage.tsx';

// Lê o arquivo
let content = fs.readFileSync(path, 'utf8');

// Remove o código órfão quebrado - tudo entre "        )}" e "{activeTab === 'create-card'"
const regex = /(\s+\)}\n)[\s\S]*?(\s+\{activeTab === 'create-card')/;
const replacement = '$1\n$2';

content = content.replace(regex, replacement);

// Escreve de volta
fs.writeFileSync(path, content);

console.log('Código órfão removido com sucesso!');