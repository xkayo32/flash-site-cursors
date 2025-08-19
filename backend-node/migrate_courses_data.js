// =============================================================================
// MIGRAÇÃO DE DADOS: courses.json → PostgreSQL
// Convertendo UUIDs para IDs inteiros sequenciais
// =============================================================================

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

// Função para gerar slug a partir do título
function generateSlug(title) {
    return title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove acentos
        .replace(/[^a-z0-9\s-]/g, '') // Remove caracteres especiais
        .replace(/\s+/g, '-') // Substitui espaços por hífens
        .replace(/-+/g, '-') // Remove hífens duplicados
        .replace(/^-|-$/g, ''); // Remove hífens no início/fim
}

// Configuração do banco PostgreSQL
const pool = new Pool({
    host: 'localhost',
    port: 5532,
    user: 'estudos_user',
    password: 'estudos_pass',
    database: 'estudos_db'
});

async function migrateCourses() {
    try {
        // Ler dados do JSON
        const jsonPath = path.join(__dirname, 'data', 'courses.json');
        const coursesData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
        
        console.log(`🔄 Iniciando migração de ${coursesData.length} courses...`);
        
        // Obter próximo ID disponível
        const maxIdResult = await pool.query('SELECT COALESCE(MAX(id), 0) + 1 as next_id FROM courses');
        let nextId = parseInt(maxIdResult.rows[0].next_id);
        
        console.log(`📊 Próximo ID disponível: ${nextId}`);
        
        let migratedCount = 0;
        let updatedCount = 0;
        const uuidToIdMap = {};
        
        for (const course of coursesData) {
            try {
                // Verificar se curso já existe pelo título (para evitar duplicatas)
                const existingCourse = await pool.query(
                    'SELECT id FROM courses WHERE title = $1',
                    [course.title]
                );
                
                let courseId;
                
                if (existingCourse.rows.length > 0) {
                    // Atualizar curso existente
                    courseId = existingCourse.rows[0].id;
                    await pool.query(`
                        UPDATE courses SET 
                            description = $1,
                            category = $2,
                            slug = $3,
                            price = $4,
                            instructor = $5,
                            instructor_id = $6,
                            difficulty_level = $7,
                            duration_hours = $8,
                            duration_months = $9,
                            status = $10,
                            visibility = $11,
                            certification_available = $12,
                            requirements = $13,
                            objectives = $14,
                            tags = $15,
                            stats = $16,
                            updated_at = $17
                        WHERE id = $18
                    `, [
                        course.description,
                        course.category,
                        generateSlug(course.title),
                        course.price || 0,
                        JSON.stringify(course.instructor || {}),
                        null, // instructor_id (será NULL pois não temos referência)
                        course.difficulty_level || 'beginner',
                        course.duration_hours || 0,
                        course.duration_months || 1,
                        course.status || 'published',
                        course.visibility || 'public',
                        course.certification_available || false,
                        JSON.stringify(course.requirements || []),
                        JSON.stringify(course.objectives || []),
                        JSON.stringify(course.tags || []),
                        JSON.stringify(course.stats || {}),
                        course.updated_at,
                        courseId
                    ]);
                    updatedCount++;
                    console.log(`✅ Curso atualizado: ${course.title} (ID: ${courseId})`);
                } else {
                    // Inserir novo curso
                    courseId = nextId++;
                    await pool.query(`
                        INSERT INTO courses (
                            id, title, description, category, slug, price, instructor, instructor_id,
                            difficulty_level, duration_hours, duration_months, status, 
                            visibility, certification_available, requirements, objectives, 
                            tags, stats, created_at, updated_at
                        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
                    `, [
                        courseId,
                        course.title,
                        course.description,
                        course.category,
                        generateSlug(course.title),
                        course.price || 0,
                        JSON.stringify(course.instructor || {}),
                        null, // instructor_id (será NULL pois não temos referência)
                        course.difficulty_level || 'beginner',
                        course.duration_hours || 0,
                        course.duration_months || 1,
                        course.status || 'published',
                        course.visibility || 'public',
                        course.certification_available || false,
                        JSON.stringify(course.requirements || []),
                        JSON.stringify(course.objectives || []),
                        JSON.stringify(course.tags || []),
                        JSON.stringify(course.stats || {}),
                        course.created_at,
                        course.updated_at
                    ]);
                    migratedCount++;
                    console.log(`✅ Curso inserido: ${course.title} (ID: ${courseId})`);
                }
                
                // Mapear UUID para ID inteiro para referências futuras
                uuidToIdMap[course.id] = courseId;
                
            } catch (error) {
                console.error(`❌ Erro ao processar curso ${course.title}:`, error.message);
            }
        }
        
        // Salvar mapeamento UUID → ID para uso posterior
        const mappingPath = path.join(__dirname, 'course_uuid_to_id_mapping.json');
        fs.writeFileSync(mappingPath, JSON.stringify(uuidToIdMap, null, 2));
        console.log(`📝 Mapeamento UUID→ID salvo em: ${mappingPath}`);
        
        // Verificar resultado final
        const totalCourses = await pool.query('SELECT COUNT(*) as total FROM courses');
        
        // Estatísticas por categoria
        const categoryStats = await pool.query(`
            SELECT 
                category,
                COUNT(*) as count,
                AVG(price) as avg_price,
                COUNT(CASE WHEN status = 'published' THEN 1 END) as published_count
            FROM courses 
            GROUP BY category 
            ORDER BY count DESC
        `);
        
        console.log(`\n🎉 Migração de courses concluída!`);
        console.log(`📊 Estatísticas:`);
        console.log(`   • Cursos inseridos: ${migratedCount}`);
        console.log(`   • Cursos atualizados: ${updatedCount}`);
        console.log(`   • Total no banco: ${totalCourses.rows[0].total}`);
        console.log(`   • Mapeamentos UUID→ID criados: ${Object.keys(uuidToIdMap).length}`);
        
        console.log(`\n📚 Cursos por Categoria:`);
        categoryStats.rows.forEach(row => {
            console.log(`   • ${row.category}: ${row.count} cursos (${row.published_count} publicados) - Preço médio: R$ ${parseFloat(row.avg_price).toFixed(2)}`);
        });
        
        return { 
            migratedCount, 
            updatedCount, 
            total: totalCourses.rows[0].total,
            mapping: uuidToIdMap 
        };
        
    } catch (error) {
        console.error('❌ Erro na migração de courses:', error);
        throw error;
    } finally {
        await pool.end();
    }
}

// Executar migração se chamado diretamente
if (require.main === module) {
    migrateCourses()
        .then(result => {
            console.log('✅ Migração de courses finalizada com sucesso!');
            process.exit(0);
        })
        .catch(error => {
            console.error('❌ Falha na migração de courses:', error);
            process.exit(1);
        });
}

module.exports = { migrateCourses };