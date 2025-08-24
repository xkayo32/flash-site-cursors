// Script para testar exatamente o comportamento do settings store
const API_BASE_URL = 'http://173.208.151.106:8180';

async function testSettingsUpdate() {
    console.log('🧪 Testando exatamente como o frontend faz...');
    
    // 1. Login primeiro
    console.log('\n1️⃣ Fazendo login...');
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
    
    const loginData = await loginResponse.json();
    console.log('Login response:', loginData);
    const token = loginData.token;
    
    // 2. Fetch current settings
    console.log('\n2️⃣ Buscando settings atuais...');
    const currentResponse = await fetch(`${API_BASE_URL}/api/v1/settings`, {
        headers: {
            'Authorization': `Bearer ${token}`,
        }
    });
    
    const currentSettings = await currentResponse.json();
    console.log('Current settings:', JSON.stringify(currentSettings, null, 2));
    
    // 3. Simular exatamente o que o frontend faz
    console.log('\n3️⃣ Simulando update exatamente como o frontend...');
    
    const payload = {
        ...currentSettings,
        general: { 
            ...currentSettings.general, 
            site_name: 'Debug Frontend Test',
            site_tagline: 'Testando comportamento do frontend' 
        }
    };
    
    console.log('Payload que será enviado:', JSON.stringify(payload, null, 2));
    
    const updateResponse = await fetch(`${API_BASE_URL}/api/v1/settings`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
    });
    
    console.log('\n4️⃣ Response status:', updateResponse.status);
    console.log('Response headers:', Object.fromEntries(updateResponse.headers));
    
    const updateData = await updateResponse.json();
    console.log('Update response:', JSON.stringify(updateData, null, 2));
    
    // 5. Verificar se realmente salvou
    console.log('\n5️⃣ Verificando se salvou...');
    await new Promise(resolve => setTimeout(resolve, 500)); // Mesmo delay do frontend
    
    const verifyResponse = await fetch(`${API_BASE_URL}/api/v1/settings`);
    const verifyData = await verifyResponse.json();
    
    const savedSiteName = verifyData.general.site_name;
    console.log('Site name salvo:', savedSiteName);
    
    if (savedSiteName === 'Debug Frontend Test') {
        console.log('✅ SALVOU CORRETAMENTE!');
    } else {
        console.log('❌ NÃO SALVOU CORRETAMENTE');
        console.log('Esperado: "Debug Frontend Test"');
        console.log('Obtido:', savedSiteName);
    }
}

testSettingsUpdate().catch(console.error);