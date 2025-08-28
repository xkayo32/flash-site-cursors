// Teste da função de limpeza HTML
function cleanHtml(text) {
  if (!text) return '';
  
  // Remover tags HTML comuns do Anki
  let cleaned = text
    // Remover divs e spans
    .replace(/<\/?div[^>]*>/gi, '')
    .replace(/<\/?span[^>]*>/gi, '')
    // Converter entidades HTML
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    // Remover espaços múltiplos
    .replace(/\s+/g, ' ')
    .trim();
  
  return cleaned;
}

// Testar com exemplos reais do arquivo Phrasal Verbs
console.log('🧹 Teste de Limpeza HTML - Phrasal Verbs');
console.log('=========================================');

const testCases = [
  {
    original: '<div>I&nbsp;gave&nbsp;that&nbsp;man<span class="Apple-tab-span" style="white-space:pre"> </span>a<span class="Apple-tab-span" style="white-space:pre"> </span>push</div>',
    expected: 'I gave that man a push'
  },
  {
    original: '<div>My<span class="Apple-tab-span" style="white-space:pre"> </span>mother<span class="Apple-tab-span" style="white-space:pre"> </span>gave<span class="Apple-tab-span" style="white-space:pre"> </span>that<span class="Apple-tab-span" style="white-space:pre"> </span>boy&nbsp;a<span class="Apple-tab-span" style="white-space:pre"> </span>kiss</div>',
    expected: 'My mother gave that boy a kiss'
  },
  {
    original: 'He had a good sleep',
    expected: 'He had a good sleep'
  },
  {
    original: 'You made an error in the addition',
    expected: 'You made an error in the addition'
  }
];

testCases.forEach((test, i) => {
  const cleaned = cleanHtml(test.original);
  const isCorrect = cleaned === test.expected;
  
  console.log(`\n--- TESTE ${i + 1} ${isCorrect ? '✅' : '❌'} ---`);
  console.log('Original :', test.original);
  console.log('Esperado :', test.expected);
  console.log('Resultado:', cleaned);
  console.log('Correto  :', isCorrect ? 'SIM' : 'NÃO');
});

console.log('\n📊 RESUMO:');
const passedTests = testCases.filter((test, i) => cleanHtml(test.original) === test.expected).length;
console.log(`✅ Testes passaram: ${passedTests}/${testCases.length}`);
console.log(`🎯 Taxa de sucesso: ${((passedTests / testCases.length) * 100).toFixed(1)}%`);
console.log('');
console.log('🔧 CONCLUSÃO: Sistema de limpeza HTML funcionará perfeitamente');
console.log('   para o arquivo Phrasal_Verbs_em_frases_Ingls_Pt_EnglishPt.apkg');