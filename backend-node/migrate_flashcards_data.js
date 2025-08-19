// =============================================================================
// MIGRAÇÃO DE DADOS: flashcards.json → PostgreSQL
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

async function migrateFlashcards() {
    try {
        // Ler dados do JSON
        const jsonPath = path.join(__dirname, 'data', 'flashcards.json');
        const flashcardsData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
        
        console.log(`🔄 Iniciando migração de ${flashcardsData.length} flashcards...`);
        console.log(`📊 Tipos encontrados: ${[...new Set(flashcardsData.map(f => f.type))].join(', ')}`);
        
        // Limpar tabela existente
        await pool.query('DELETE FROM flashcards');
        console.log('🗑️ Tabela flashcards limpa para nova migração');
        
        let migratedCount = 0;
        const typeStats = {};
        
        for (const flashcard of flashcardsData) {
            try {
                // Contar tipos
                typeStats[flashcard.type] = (typeStats[flashcard.type] || 0) + 1;
                
                // Inserir flashcard
                await pool.query(`
                    INSERT INTO flashcards (
                        id, type, difficulty, category, subcategory, tags, status,
                        front, back, extra, text, question, options, correct, explanation,
                        statement, answer, hint, image, occlusion_areas,
                        times_studied, times_correct, correct_rate, ease_factor, interval, next_review,
                        author_id, author_name, created_at, updated_at
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30)
                `, [
                    flashcard.id,
                    flashcard.type,
                    flashcard.difficulty,
                    flashcard.category,
                    flashcard.subcategory || null,
                    JSON.stringify(flashcard.tags || []),
                    flashcard.status || 'published',
                    
                    // Campos específicos por tipo
                    flashcard.front || null,
                    flashcard.back || null,
                    flashcard.extra || null,
                    flashcard.text || null,
                    flashcard.question || null,
                    JSON.stringify(flashcard.options || null),
                    flashcard.correct || null,
                    flashcard.explanation || null,
                    flashcard.statement || null,
                    flashcard.answer || null,
                    flashcard.hint || null,
                    flashcard.image || null,
                    JSON.stringify(flashcard.occlusionAreas || flashcard.occlusion_areas || []),
                    
                    // Dados SM-2
                    flashcard.times_studied || 0,
                    flashcard.times_correct || 0,
                    flashcard.correct_rate || 0.0,
                    flashcard.ease_factor || 2.5,
                    flashcard.interval || 0,
                    flashcard.next_review || new Date().toISOString(),
                    
                    // Metadados
                    flashcard.author_id || '1',
                    flashcard.author_name || 'Sistema',
                    flashcard.created_at || new Date().toISOString(),
                    flashcard.updated_at || new Date().toISOString()
                ]);
                
                migratedCount++;
                console.log(`✅ Flashcard migrado: [${flashcard.type}] ${flashcard.front || flashcard.question || flashcard.statement || flashcard.text || flashcard.id}`);
                
            } catch (error) {
                console.error(`❌ Erro ao processar flashcard ${flashcard.id}:`, error.message);
            }
        }
        
        // Verificar resultado final
        const totalInDb = await pool.query('SELECT COUNT(*) as total FROM flashcards');
        
        // Estatísticas por tipo
        const typeStatsDb = await pool.query(`
            SELECT 
                type,
                COUNT(*) as count,
                AVG(correct_rate) as avg_correct_rate,
                COUNT(CASE WHEN status = 'published' THEN 1 END) as published_count
            FROM flashcards 
            GROUP BY type 
            ORDER BY count DESC
        `);
        
        // Estatísticas por categoria
        const categoryStats = await pool.query(`
            SELECT 
                category,
                COUNT(*) as count,
                COUNT(DISTINCT type) as type_variety
            FROM flashcards 
            GROUP BY category 
            ORDER BY count DESC
            LIMIT 10
        `);
        
        console.log(`\n🎉 Migração de flashcards concluída!`);
        console.log(`📊 Estatísticas Gerais:`);
        console.log(`   • Total migrado: ${migratedCount}/${flashcardsData.length}`);
        console.log(`   • Total no banco: ${totalInDb.rows[0].total}`);
        
        console.log(`\n📋 Estatísticas por Tipo:`);
        typeStatsDb.rows.forEach(row => {
            console.log(`   • ${row.type}: ${row.count} cards (${row.published_count} publicados) - Taxa média: ${parseFloat(row.avg_correct_rate).toFixed(1)}%`);
        });
        
        console.log(`\n📚 Top Categorias:`);
        categoryStats.rows.forEach(row => {
            console.log(`   • ${row.category}: ${row.count} cards (${row.type_variety} tipos)`);
        });
        
        // Verificar algoritmo SM-2
        const sm2Stats = await pool.query(`
            SELECT 
                AVG(times_studied) as avg_studied,
                AVG(correct_rate) as avg_correct_rate,
                AVG(ease_factor) as avg_ease_factor,
                COUNT(CASE WHEN next_review > NOW() THEN 1 END) as pending_review
            FROM flashcards 
            WHERE times_studied > 0
        `);
        
        if (sm2Stats.rows[0].avg_studied) {
            console.log(`\n🧠 Estatísticas Algoritmo SM-2:`);
            console.log(`   • Média de estudos: ${parseFloat(sm2Stats.rows[0].avg_studied).toFixed(1)}`);
            console.log(`   • Taxa de acerto média: ${parseFloat(sm2Stats.rows[0].avg_correct_rate).toFixed(1)}%`);
            console.log(`   • Fator de facilidade médio: ${parseFloat(sm2Stats.rows[0].avg_ease_factor).toFixed(2)}`);
            console.log(`   • Cards pendentes para revisão: ${sm2Stats.rows[0].pending_review}`);
        }
        
        return { 
            migrated: migratedCount, 
            total: totalInDb.rows[0].total,
            types: typeStatsDb.rows.length 
        };
        
    } catch (error) {
        console.error('❌ Erro na migração de flashcards:', error);
        throw error;
    } finally {
        await pool.end();
    }
}

// Executar migração se chamado diretamente
if (require.main === module) {
    migrateFlashcards()
        .then(result => {
            console.log('✅ Migração de flashcards finalizada com sucesso!');
            process.exit(0);
        })
        .catch(error => {
            console.error('❌ Falha na migração de flashcards:', error);
            process.exit(1);
        });
}

module.exports = { migrateFlashcards };