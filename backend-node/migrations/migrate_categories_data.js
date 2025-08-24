// =============================================================================
// MIGRAÇÃO DE DADOS: categories.json → PostgreSQL
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

async function insertCategoryRecursive(category, parentId = null) {
    try {
        // Inserir categoria principal
        await pool.query(`
            INSERT INTO categories (
                id, name, type, description, parent_id, content_count, created_at, updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            ON CONFLICT (id) DO UPDATE SET
                name = EXCLUDED.name,
                type = EXCLUDED.type,
                description = EXCLUDED.description,
                parent_id = EXCLUDED.parent_id,
                content_count = EXCLUDED.content_count,
                updated_at = EXCLUDED.updated_at
        `, [
            category.id,
            category.name,
            category.type,
            category.description || null,
            parentId,
            JSON.stringify(category.contentCount || {}),
            category.created_at,
            category.updated_at
        ]);
        
        console.log(`✅ Categoria inserida/atualizada: ${category.name} (ID: ${category.id})`);
        
        // Inserir sub-categorias recursivamente
        if (category.children && category.children.length > 0) {
            for (const child of category.children) {
                await insertCategoryRecursive(child, category.id);
            }
        }
        
        return 1;
    } catch (error) {
        console.error(`❌ Erro ao processar categoria ${category.name}:`, error.message);
        return 0;
    }
}

async function migrateCategories() {
    try {
        // Ler dados do JSON
        const jsonPath = path.join(__dirname, 'data', 'categories.json');
        const categoriesData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
        
        console.log(`🔄 Iniciando migração de categorias hierárquicas...`);
        console.log(`📊 Total de categorias principais: ${categoriesData.length}`);
        
        // Limpar tabela existente para evitar conflitos
        await pool.query('DELETE FROM categories');
        console.log('🗑️ Tabela categories limpa para nova migração');
        
        let totalMigrated = 0;
        
        // Processar cada categoria raiz
        for (const category of categoriesData) {
            const count = await insertCategoryRecursive(category);
            totalMigrated += count;
            
            // Contar subcategorias recursivamente
            function countSubcategories(cat) {
                let count = 0;
                if (cat.children) {
                    count += cat.children.length;
                    cat.children.forEach(child => count += countSubcategories(child));
                }
                return count;
            }
            
            totalMigrated += countSubcategories(category);
        }
        
        // Verificar resultado final
        const totalInDb = await pool.query('SELECT COUNT(*) as total FROM categories');
        const categoriesHierarchy = await pool.query(`
            SELECT 
                type,
                parent_id IS NULL as is_root,
                COUNT(*) as count
            FROM categories 
            GROUP BY type, (parent_id IS NULL)
            ORDER BY type, is_root DESC
        `);
        
        console.log(`\n🎉 Migração de categorias concluída!`);
        console.log(`📊 Estatísticas:`);
        console.log(`   • Total de categorias migradas: ${totalInDb.rows[0].total}`);
        console.log(`   • Estrutura hierárquica:`);
        
        categoriesHierarchy.rows.forEach(row => {
            const level = row.is_root ? 'Raiz' : 'Subcategoria';
            console.log(`     - ${row.type} (${level}): ${row.count} itens`);
        });
        
        // Verificar estrutura hierárquica
        const hierarchyCheck = await pool.query(`
            SELECT 
                c1.name as parent_name,
                COUNT(c2.id) as children_count
            FROM categories c1
            LEFT JOIN categories c2 ON c1.id = c2.parent_id
            WHERE c1.parent_id IS NULL
            GROUP BY c1.id, c1.name
            ORDER BY c1.name
        `);
        
        console.log(`\n🌳 Estrutura das categorias raiz:`);
        hierarchyCheck.rows.forEach(row => {
            console.log(`   • ${row.parent_name}: ${row.children_count} subcategorias`);
        });
        
        return { total: totalInDb.rows[0].total };
        
    } catch (error) {
        console.error('❌ Erro na migração de categorias:', error);
        throw error;
    } finally {
        await pool.end();
    }
}

// Executar migração se chamado diretamente
if (require.main === module) {
    migrateCategories()
        .then(result => {
            console.log('✅ Migração de categorias finalizada com sucesso!');
            process.exit(0);
        })
        .catch(error => {
            console.error('❌ Falha na migração de categorias:', error);
            process.exit(1);
        });
}

module.exports = { migrateCategories };