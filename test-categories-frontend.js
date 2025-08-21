// Teste das categorias no frontend
console.log('🎯 Testando carregamento das categorias...');

fetch('http://localhost:8180/api/v1/categories')
  .then(response => response.json())
  .then(data => {
    console.log('✅ Categorias carregadas da API:');
    
    // Categorias principais (matérias)
    const mainCategories = data.categories.filter(cat => !cat.parent_id);
    console.log('\n📋 MATÉRIAS DISPONÍVEIS:');
    mainCategories.forEach(cat => {
      console.log(`• ${cat.name.toUpperCase()} (${cat.children_count} subcategorias)`);
    });
    
    // Exemplo de subcategorias
    const direito = data.categories.find(cat => cat.name === 'Direito');
    if (direito && direito.children.length > 0) {
      console.log('\n📋 EXEMPLO - SUBCATEGORIAS DE DIREITO:');
      direito.children.forEach(sub => {
        console.log(`  - ${sub.name.toUpperCase()}`);
      });
    }
    
    console.log('\n✨ Integração funcionando corretamente!');
    console.log('▶️  Acesse: http://localhost:5173/admin/summaries/new');
  })
  .catch(error => {
    console.error('❌ Erro ao carregar categorias:', error);
  });