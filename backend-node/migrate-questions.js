const fs = require('fs');
const { Pool } = require('pg');

// Configuração do PostgreSQL
const pool = new Pool({
  host: 'localhost',
  port: 5532,
  database: 'estudos_db',
  user: 'estudos_user',
  password: 'estudos_pass'
});

async function migrateQuestions() {
  try {
    console.log('🔄 Iniciando migração de questões...');
    
    // Ler dados do JSON
    const questionsData = JSON.parse(fs.readFileSync('./data/questions.json', 'utf8'));
    console.log(`📚 Encontradas ${questionsData.length} questões no JSON`);
    
    // Verificar se já existem questões no banco
    const existingCount = await pool.query('SELECT COUNT(*) FROM questions');
    console.log(`🗄️  Questões existentes no banco: ${existingCount.rows[0].count}`);
    
    if (existingCount.rows[0].count > 0) {
      console.log('⚠️  Limpando questões existentes...');
      await pool.query('DELETE FROM questions');
    }
    
    // Inserir questões uma por uma
    let insertedCount = 0;
    
    for (const question of questionsData) {
      try {
        const query = `
          INSERT INTO questions (
            title, type, subject, topic, category_id, difficulty, status,
            options, correct_answer, correct_boolean, expected_answer,
            explanation, exam_board, exam_year, exam_name, reference, tags,
            created_by
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7,
            $8, $9, $10, $11,
            $12, $13, $14, $15, $16, $17,
            1
          )
        `;
        
        const values = [
          question.title,
          question.type,
          question.subject,
          question.topic,
          question.category_id || null,
          question.difficulty,
          question.status || 'published',
          question.options ? JSON.stringify(question.options) : null,
          question.correct_answer || null,
          question.correct_boolean || null,
          question.expected_answer || null,
          question.explanation || null,
          question.exam_board || null,
          question.exam_year || null,
          question.exam_name || null,
          question.reference || null,
          question.tags ? JSON.stringify(question.tags) : '[]'
        ];
        
        await pool.query(query, values);
        insertedCount++;
        
        if (insertedCount % 10 === 0) {
          console.log(`✅ ${insertedCount} questões migradas...`);
        }
        
      } catch (error) {
        console.error(`❌ Erro ao inserir questão "${question.title}":`, error.message);
      }
    }
    
    console.log(`🎉 Migração concluída! ${insertedCount} questões inseridas no PostgreSQL`);
    
    // Verificar resultado final
    const finalCount = await pool.query('SELECT COUNT(*) FROM questions');
    console.log(`📊 Total de questões no banco: ${finalCount.rows[0].count}`);
    
    // Mostrar algumas estatísticas
    const stats = await pool.query(`
      SELECT 
        type,
        difficulty,
        COUNT(*) as count
      FROM questions 
      GROUP BY type, difficulty 
      ORDER BY type, difficulty
    `);
    
    console.log('\n📈 Estatísticas por tipo e dificuldade:');
    stats.rows.forEach(row => {
      console.log(`   ${row.type} (${row.difficulty}): ${row.count} questões`);
    });
    
  } catch (error) {
    console.error('💥 Erro na migração:', error);
  } finally {
    await pool.end();
  }
}

// Executar migração
migrateQuestions();