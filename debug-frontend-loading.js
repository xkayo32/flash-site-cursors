// Debug script para testar o frontend diretamente
// Execute no console do navegador em http://173.208.151.106:5273/previous-exams

console.log("=== DEBUG FRONTEND LOADING ISSUE ===");

// 1. Verificar se há erros JavaScript
console.log("1. Verificando erros JavaScript...");
window.onerror = function(msg, url, line, col, error) {
    console.error("ERRO JAVASCRIPT:", msg, "em", url, "linha", line);
};

// 2. Verificar estado de autenticação
console.log("2. Verificando autenticação...");
const authData = localStorage.getItem('auth-storage');
if (authData) {
    try {
        const parsed = JSON.parse(authData);
        console.log("Auth storage:", parsed);
        console.log("Token existe:", !!parsed.state?.token);
        console.log("User existe:", !!parsed.state?.user);
    } catch (e) {
        console.error("Erro ao parsear auth storage:", e);
    }
} else {
    console.log("❌ Nenhum dado de autenticação encontrado");
}

// 3. Verificar token atual
const token = localStorage.getItem('token');
console.log("Token direto:", token ? "EXISTS" : "NOT FOUND");

// 4. Testar API diretamente
console.log("3. Testando API diretamente...");

async function testAPI() {
    try {
        const authStorage = localStorage.getItem('auth-storage');
        let token = null;
        
        if (authStorage) {
            const parsed = JSON.parse(authStorage);
            token = parsed.state?.token;
        }
        
        if (!token) {
            token = localStorage.getItem('token');
        }
        
        if (!token) {
            console.error("❌ Token não encontrado");
            return;
        }
        
        console.log("Token encontrado, fazendo requisição...");
        
        const response = await fetch('http://173.208.151.106:8182/api/v1/previousexams', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log("Status da resposta:", response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error("❌ Erro na API:", response.status, errorText);
            return;
        }
        
        const data = await response.json();
        console.log("✅ Dados da API:", data);
        console.log("Número de exames:", data.exams?.length || 0);
        
        if (data.exams && data.exams.length > 0) {
            console.log("📋 Exames encontrados:");
            data.exams.forEach((exam, i) => {
                console.log(`  ${i+1}. ${exam.title} (${exam.id})`);
            });
        }
        
    } catch (error) {
        console.error("❌ Erro na requisição:", error);
    }
}

testAPI();

// 5. Verificar elementos da página
console.log("4. Verificando elementos da página...");
setTimeout(() => {
    const loadingElements = document.querySelectorAll('[data-testid*="loading"], .loading, [class*="loading"], [class*="spinner"]');
    console.log("Elementos de loading encontrados:", loadingElements.length);
    loadingElements.forEach((el, i) => {
        console.log(`Loading element ${i+1}:`, el.textContent, el.className);
    });
    
    const errorElements = document.querySelectorAll('[data-testid*="error"], .error, [class*="error"]');
    console.log("Elementos de erro encontrados:", errorElements.length);
    errorElements.forEach((el, i) => {
        console.log(`Error element ${i+1}:`, el.textContent, el.className);
    });
    
    const examElements = document.querySelectorAll('[data-testid*="exam"], [class*="exam"], .card, [class*="card"]');
    console.log("Elementos de exame/card encontrados:", examElements.length);
}, 2000);

// 6. Monitor de requests
console.log("5. Monitorando requests de rede...");
const originalFetch = window.fetch;
window.fetch = function(...args) {
    const url = args[0];
    if (typeof url === 'string' && url.includes('previousexams')) {
        console.log("🌐 Interceptando request previousexams:", url);
        return originalFetch.apply(this, args)
            .then(response => {
                console.log("📥 Resposta previousexams:", response.status, response.ok);
                return response;
            })
            .catch(error => {
                console.error("❌ Erro na request previousexams:", error);
                throw error;
            });
    }
    return originalFetch.apply(this, args);
};

console.log("=== DEBUG SCRIPT CARREGADO - Verificar logs acima ===");
console.log("Execute 'testAPI()' novamente se necessário");