// Teste direto da funcionalidade do categoryService
const API_BASE_URL = 'http://localhost:8180';

async function testCategoryService() {
  console.log('🎯 Testando categoryService...');
  
  try {
    // Simular o que faz o categoryService
    const response = await fetch(`${API_BASE_URL}/api/v1/categories`, {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer admin-token', // Token de teste
        'Content-Type': 'application/json',
      }
    });

    console.log('📡 Status da resposta:', response.status);
    
    if (!response.ok) {
      console.error('❌ Erro HTTP:', response.status, response.statusText);
      return;
    }

    const data = await response.json();
    console.log('📊 Estrutura da resposta:', {
      success: data.success,
      hasCategories: !!data.categories,
      hasData: !!data.data,
      categoriesLength: data.categories?.length || 0,
      dataLength: data.data?.length || 0
    });

    // Verificar se a resposta tem a estrutura esperada
    if (data.success && data.categories) {
      console.log('✅ Resposta válida encontrada!');
      
      // Filtrar categorias principais (sem parent_id)
      const mainCategories = data.categories.filter(cat => !cat.parent_id);
      console.log('📋 Categorias principais:', mainCategories.length);
      
      mainCategories.forEach((cat, index) => {
        console.log(`  ${index + 1}. ${cat.name} (${cat.children_count} subcategorias)`);
      });
      
      // Testar exemplo de subcategorias
      const direito = data.categories.find(cat => cat.name === 'Direito');
      if (direito && direito.children) {
        console.log('📋 Subcategorias de Direito:');
        direito.children.forEach(sub => {
          console.log(`    - ${sub.name}`);
        });
      }
    } else {
      console.error('❌ Estrutura de resposta inválida:', data);
    }
    
  } catch (error) {
    console.error('❌ Erro na requisição:', error.message);
  }
}

testCategoryService();