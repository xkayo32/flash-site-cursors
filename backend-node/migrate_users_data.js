// =============================================================================
// MIGRAÇÃO DE DADOS: users.json → PostgreSQL
// =============================================================================

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

// Configuração do banco PostgreSQL
const pool = new Pool({
    host: 'localhost',
    port: 5532,
    user: 'estudos_user',
    password: 'estudos_pass',
    database: 'estudos_db'
});

async function migrateUsers() {
    try {
        // Ler dados do JSON
        const jsonPath = path.join(__dirname, 'data', 'users.json');
        const usersData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
        
        console.log(`🔄 Iniciando migração de ${usersData.length} usuários...`);
        
        let migratedCount = 0;
        let updatedCount = 0;
        
        for (const user of usersData) {
            try {
                // Verificar se usuário já existe
                const existingUser = await pool.query(
                    'SELECT id FROM users WHERE id = $1',
                    [user.id]
                );
                
                if (existingUser.rows.length > 0) {
                    // Atualizar usuário existente com novos campos
                    await pool.query(`
                        UPDATE users SET 
                            name = $1,
                            email = $2,
                            password = $3,
                            role = $4,
                            status = $5,
                            phone = $6,
                            avatar = $7,
                            email_verified = $8,
                            subscription = $9,
                            last_login = $10,
                            updated_at = $11
                        WHERE id = $12
                    `, [
                        user.name,
                        user.email,
                        user.password,
                        user.role,
                        user.status,
                        user.phone || null,
                        user.avatar || null,
                        user.emailVerified || false,
                        JSON.stringify(user.subscription || null),
                        user.lastLogin || null,
                        user.updated_at,
                        user.id
                    ]);
                    updatedCount++;
                    console.log(`✅ Usuário atualizado: ${user.name} (ID: ${user.id})`);
                } else {
                    // Inserir novo usuário
                    await pool.query(`
                        INSERT INTO users (
                            id, name, email, password, role, status, phone, avatar,
                            email_verified, subscription, last_login, created_at, updated_at
                        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
                    `, [
                        user.id,
                        user.name,
                        user.email,
                        user.password,
                        user.role,
                        user.status,
                        user.phone || null,
                        user.avatar || null,
                        user.emailVerified || false,
                        JSON.stringify(user.subscription || null),
                        user.lastLogin || null,
                        user.createdAt,
                        user.updated_at
                    ]);
                    migratedCount++;
                    console.log(`✅ Usuário inserido: ${user.name} (ID: ${user.id})`);
                }
            } catch (error) {
                console.error(`❌ Erro ao processar usuário ${user.name}:`, error.message);
            }
        }
        
        // Verificar resultado final
        const totalUsers = await pool.query('SELECT COUNT(*) as total FROM users');
        
        console.log(`\n🎉 Migração de usuários concluída!`);
        console.log(`📊 Estatísticas:`);
        console.log(`   • Usuários inseridos: ${migratedCount}`);
        console.log(`   • Usuários atualizados: ${updatedCount}`);
        console.log(`   • Total no banco: ${totalUsers.rows[0].total}`);
        
        return { migratedCount, updatedCount, total: totalUsers.rows[0].total };
        
    } catch (error) {
        console.error('❌ Erro na migração de usuários:', error);
        throw error;
    } finally {
        await pool.end();
    }
}

// Executar migração se chamado diretamente
if (require.main === module) {
    migrateUsers()
        .then(result => {
            console.log('✅ Migração de usuários finalizada com sucesso!');
            process.exit(0);
        })
        .catch(error => {
            console.error('❌ Falha na migração de usuários:', error);
            process.exit(1);
        });
}

module.exports = { migrateUsers };