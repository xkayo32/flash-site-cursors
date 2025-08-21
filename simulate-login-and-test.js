// Simular completamente o fluxo de login e acesso à página de resumos
const API_BASE_URL = 'http://localhost:8180';

async function simulateFullFlow() {
  console.log('🎯 Simulando fluxo completo: Login + Acesso às categorias');
  
  try {
    // 1. Fazer login como admin
    console.log('🔐 Passo 1: Fazendo login...');
    const loginResponse = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@studypro.com',
        password: 'Admin@123'
      })
    });

    if (!loginResponse.ok) {
      console.error('❌ Falha no login:', loginResponse.status);
      return;
    }

    const loginData = await loginResponse.json();
    console.log('✅ Login realizado com sucesso');
    console.log('👤 Usuário:', loginData.user.name, '-', loginData.user.role);
    
    const token = loginData.token;
    console.log('🔑 Token obtido:', token.substring(0, 50) + '...');

    // 2. Simular armazenamento no localStorage (como faria o frontend)
    console.log('\n🔐 Passo 2: Simulando armazenamento no localStorage...');
    console.log('localStorage.setItem("token", token)');
    console.log('authStore.setAuth(user, token)');

    // 3. Testar acesso às categorias (como faria o SummaryForm)
    console.log('\n📋 Passo 3: Acessando categorias como SummaryForm...');
    
    const categoriesResponse = await fetch(`${API_BASE_URL}/api/v1/categories`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });

    console.log('📡 Status da requisição categorias:', categoriesResponse.status);
    console.log('📡 Response OK:', categoriesResponse.ok);

    if (!categoriesResponse.ok) {
      console.error('❌ Falha ao buscar categorias:', categoriesResponse.status, categoriesResponse.statusText);
      return;
    }

    const categoriesData = await categoriesResponse.json();
    console.log('✅ Categorias obtidas com sucesso!');
    console.log('📊 Estrutura:', {
      success: categoriesData.success,
      totalCategories: categoriesData.categories?.length || 0,
      hasData: !!categoriesData.data,
      hasCategories: !!categoriesData.categories
    });

    // 4. Processar como o SummaryForm processaria
    console.log('\n🔧 Passo 4: Processando como SummaryForm...');
    
    if (categoriesData.success && (categoriesData.data || categoriesData.categories)) {
      const categories = categoriesData.data || categoriesData.categories || [];
      console.log('✅ Categorias encontradas:', categories.length);
      
      // Filtrar categorias principais (sem parent_id)
      const mainCategories = categories.filter(cat => !cat.parent_id);
      console.log('📋 Categorias principais (matérias):', mainCategories.length);
      
      console.log('\n📝 OPTIONS que apareceriam no SELECT:');
      mainCategories.forEach((cat, index) => {
        console.log(`  ${index + 1}. <option value="${cat.name}">${cat.name.toUpperCase()}</option>`);
      });
      
      // Testar subcategorias
      console.log('\n📝 Exemplo de SUBCATEGORIAS (Direito):');
      const direito = categories.find(cat => cat.name === 'Direito' && !cat.parent_id);
      if (direito) {
        const subcategorias = categories.filter(cat => cat.parent_id === direito.id);
        subcategorias.forEach((sub, index) => {
          console.log(`    ${index + 1}. <option value="${sub.name}">${sub.name.toUpperCase()}</option>`);
        });
      }
      
      console.log('\n✅ SUCESSO: O fluxo está funcionando perfeitamente!');
      console.log('🔍 Se as categorias não aparecem no frontend, o problema pode ser:');
      console.log('   1. Token não está sendo salvo no localStorage');
      console.log('   2. AuthStore não está persistindo o estado');
      console.log('   3. Problemas de CORS no browser');
      console.log('   4. Componente não está renderizando as opções');
      
    } else {
      console.error('❌ Estrutura de resposta inválida');
    }

  } catch (error) {
    console.error('❌ Erro no fluxo:', error.message);
  }
}

// Executar simulação
simulateFullFlow();