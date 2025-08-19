// =============================================================================
// MIGRAÇÃO COMPLETA DE TODOS OS DADOS JSON RESTANTES PARA POSTGRESQL
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

// =============================================================================
// MIGRAÇÃO: SUMMARIES
// =============================================================================
async function migrateSummaries() {
    try {
        const jsonPath = path.join(__dirname, 'data', 'summaries.json');
        if (!fs.existsSync(jsonPath)) {
            console.log('⚠️ Arquivo summaries.json não encontrado');
            return { migrated: 0 };
        }
        
        const summariesData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
        console.log(`🔄 Migrando ${summariesData.length} summaries...`);
        
        let migrated = 0;
        for (const summary of summariesData) {
            try {
                await pool.query(`
                    INSERT INTO summaries (
                        id, title, subject, content, summary_type, difficulty,
                        estimated_reading_time, tags, sections, ref_sources,
                        visibility, shared_with, statistics, status, created_by,
                        created_at, updated_at, published_at
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
                    ON CONFLICT (id) DO UPDATE SET
                        title = EXCLUDED.title,
                        content = EXCLUDED.content,
                        updated_at = EXCLUDED.updated_at
                `, [
                    summary.id,
                    summary.title,
                    summary.subject || null,
                    summary.content,
                    summary.summary_type || 'text',
                    summary.difficulty || 'basic',
                    summary.estimated_reading_time || 5,
                    JSON.stringify(summary.tags || []),
                    JSON.stringify(summary.sections || []),
                    JSON.stringify(summary.references || []),
                    summary.visibility || 'public',
                    JSON.stringify(summary.shared_with || []),
                    JSON.stringify(summary.statistics || {}),
                    summary.status || 'draft',
                    summary.created_by || '1',
                    summary.created_at,
                    summary.updated_at,
                    summary.published_at || null
                ]);
                migrated++;
                console.log(`✅ Summary: ${summary.title}`);
            } catch (error) {
                console.error(`❌ Erro em summary ${summary.id}:`, error.message);
            }
        }
        return { migrated };
    } catch (error) {
        console.error('❌ Erro na migração de summaries:', error.message);
        return { migrated: 0 };
    }
}

// =============================================================================
// MIGRAÇÃO: PREVIOUS EXAMS
// =============================================================================
async function migratePreviousExams() {
    try {
        const jsonPath = path.join(__dirname, 'data', 'previousexams.json');
        if (!fs.existsSync(jsonPath)) {
            console.log('⚠️ Arquivo previousexams.json não encontrado');
            return { migrated: 0 };
        }
        
        const examsData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
        console.log(`🔄 Migrando ${examsData.length} previous exams...`);
        
        let migrated = 0;
        for (const exam of examsData) {
            try {
                await pool.query(`
                    INSERT INTO previous_exams (
                        id, title, organization, exam_board, position, year, 
                        total_questions, status, created_at, updated_at
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                    ON CONFLICT (id) DO UPDATE SET
                        title = EXCLUDED.title,
                        total_questions = EXCLUDED.total_questions,
                        updated_at = EXCLUDED.updated_at
                `, [
                    exam.id,
                    exam.title,
                    exam.organization,
                    exam.exam_board,
                    exam.position,
                    exam.year,
                    exam.total_questions || 0,
                    exam.status || 'published',
                    new Date().toISOString(),
                    new Date().toISOString()
                ]);
                migrated++;
                console.log(`✅ Previous Exam: ${exam.title}`);
            } catch (error) {
                console.error(`❌ Erro em previous exam ${exam.id}:`, error.message);
            }
        }
        return { migrated };
    } catch (error) {
        console.error('❌ Erro na migração de previous exams:', error.message);
        return { migrated: 0 };
    }
}

// =============================================================================
// MIGRAÇÃO: LEGISLATION
// =============================================================================
async function migrateLegislation() {
    try {
        const jsonPath = path.join(__dirname, 'data', 'legislation.json');
        if (!fs.existsSync(jsonPath)) {
            console.log('⚠️ Arquivo legislation.json não encontrado');
            return { migrated: 0 };
        }
        
        const legislationData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
        console.log(`🔄 Migrando ${legislationData.length} legislation items...`);
        
        let migrated = 0;
        for (const legislation of legislationData) {
            try {
                await pool.query(`
                    INSERT INTO legislation (
                        id, title, type, category, year, status, authority, 
                        description, chapters, created_at, updated_at
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
                    ON CONFLICT (id) DO UPDATE SET
                        title = EXCLUDED.title,
                        description = EXCLUDED.description,
                        chapters = EXCLUDED.chapters,
                        updated_at = EXCLUDED.updated_at
                `, [
                    legislation.id,
                    legislation.title,
                    legislation.type,
                    legislation.category,
                    legislation.year,
                    legislation.status || 'vigente',
                    legislation.authority || null,
                    legislation.description || null,
                    JSON.stringify(legislation.chapters || []),
                    new Date().toISOString(),
                    new Date().toISOString()
                ]);
                migrated++;
                console.log(`✅ Legislation: ${legislation.title}`);
            } catch (error) {
                console.error(`❌ Erro em legislation ${legislation.id}:`, error.message);
            }
        }
        return { migrated };
    } catch (error) {
        console.error('❌ Erro na migração de legislation:', error.message);
        return { migrated: 0 };
    }
}

// =============================================================================
// MIGRAÇÃO: ENROLLMENTS
// =============================================================================
async function migrateEnrollments() {
    try {
        const jsonPath = path.join(__dirname, 'data', 'enrollments.json');
        if (!fs.existsSync(jsonPath)) {
            console.log('⚠️ Arquivo enrollments.json não encontrado');
            return { migrated: 0 };
        }
        
        const enrollmentsData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
        console.log(`🔄 Migrando ${enrollmentsData.length} enrollments...`);
        
        let migrated = 0;
        for (const enrollment of enrollmentsData) {
            try {
                // Verificar se course_id existe (assumindo que seja UUID)
                const courseCheck = await pool.query('SELECT id FROM courses WHERE id::text = $1', [enrollment.course_id]);
                if (courseCheck.rows.length === 0) {
                    console.log(`⚠️ Curso não encontrado: ${enrollment.course_id}`);
                    continue;
                }
                
                await pool.query(`
                    INSERT INTO enrollments_json (
                        id, user_id, course_id, status, progress, enrolled_at, 
                        updated_at, completion_date, certificate_issued, tactical_notes
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                    ON CONFLICT (id) DO UPDATE SET
                        status = EXCLUDED.status,
                        progress = EXCLUDED.progress,
                        updated_at = EXCLUDED.updated_at
                `, [
                    enrollment.id,
                    enrollment.user_id,
                    courseCheck.rows[0].id,
                    enrollment.status,
                    JSON.stringify(enrollment.progress || {}),
                    enrollment.enrolled_at,
                    enrollment.updated_at,
                    enrollment.completion_date || null,
                    enrollment.certificate_issued || false,
                    JSON.stringify(enrollment.tactical_notes || [])
                ]);
                migrated++;
                console.log(`✅ Enrollment: User ${enrollment.user_id} in course ${enrollment.course_id}`);
            } catch (error) {
                console.error(`❌ Erro em enrollment ${enrollment.id}:`, error.message);
            }
        }
        return { migrated };
    } catch (error) {
        console.error('❌ Erro na migração de enrollments:', error.message);
        return { migrated: 0 };
    }
}

// =============================================================================
// MIGRAÇÃO: USER PROFILES
// =============================================================================
async function migrateProfiles() {
    try {
        const jsonPath = path.join(__dirname, 'data', 'profiles.json');
        if (!fs.existsSync(jsonPath)) {
            console.log('⚠️ Arquivo profiles.json não encontrado');
            return { migrated: 0 };
        }
        
        const profilesData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
        console.log(`🔄 Migrando ${Object.keys(profilesData).length} profiles...`);
        
        let migrated = 0;
        for (const [userId, profile] of Object.entries(profilesData)) {
            try {
                await pool.query(`
                    INSERT INTO user_profiles_json (
                        user_id, name, email, phone, bio, avatar, role, created_at, updated_at
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                    ON CONFLICT (user_id) DO UPDATE SET
                        name = EXCLUDED.name,
                        phone = EXCLUDED.phone,
                        bio = EXCLUDED.bio,
                        avatar = EXCLUDED.avatar,
                        updated_at = EXCLUDED.updated_at
                `, [
                    parseInt(userId),
                    profile.name,
                    profile.email,
                    profile.phone || null,
                    profile.bio || null,
                    profile.avatar || null,
                    profile.role,
                    profile.created_at,
                    profile.updated_at
                ]);
                migrated++;
                console.log(`✅ Profile: ${profile.name}`);
            } catch (error) {
                console.error(`❌ Erro em profile ${userId}:`, error.message);
            }
        }
        return { migrated };
    } catch (error) {
        console.error('❌ Erro na migração de profiles:', error.message);
        return { migrated: 0 };
    }
}

// =============================================================================
// MIGRAÇÃO: SYSTEM SETTINGS
// =============================================================================
async function migrateSettings() {
    try {
        const jsonPath = path.join(__dirname, 'data', 'settings.json');
        if (!fs.existsSync(jsonPath)) {
            console.log('⚠️ Arquivo settings.json não encontrado');
            return { migrated: 0 };
        }
        
        const settingsData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
        console.log(`🔄 Migrando system settings...`);
        
        let migrated = 0;
        for (const [section, settings] of Object.entries(settingsData)) {
            for (const [key, value] of Object.entries(settings)) {
                try {
                    let dataType = 'string';
                    let valueStr = value;
                    
                    if (typeof value === 'boolean') {
                        dataType = 'boolean';
                        valueStr = value.toString();
                    } else if (typeof value === 'number') {
                        dataType = 'number';
                        valueStr = value.toString();
                    } else if (typeof value === 'object') {
                        dataType = 'json';
                        valueStr = JSON.stringify(value);
                    }
                    
                    await pool.query(`
                        INSERT INTO system_settings_json (
                            section, key, value, data_type, created_at, updated_at
                        ) VALUES ($1, $2, $3, $4, $5, $6)
                        ON CONFLICT (section, key) DO UPDATE SET
                            value = EXCLUDED.value,
                            updated_at = EXCLUDED.updated_at
                    `, [
                        section,
                        key,
                        valueStr,
                        dataType,
                        new Date().toISOString(),
                        new Date().toISOString()
                    ]);
                    migrated++;
                    console.log(`✅ Setting: ${section}.${key}`);
                } catch (error) {
                    console.error(`❌ Erro em setting ${section}.${key}:`, error.message);
                }
            }
        }
        return { migrated };
    } catch (error) {
        console.error('❌ Erro na migração de settings:', error.message);
        return { migrated: 0 };
    }
}

// =============================================================================
// MIGRAÇÃO: SCHEDULE DATA
// =============================================================================
async function migrateSchedule() {
    try {
        const jsonPath = path.join(__dirname, 'data', 'schedule.json');
        if (!fs.existsSync(jsonPath)) {
            console.log('⚠️ Arquivo schedule.json não encontrado');
            return { migrated: 0 };
        }
        
        const scheduleData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
        console.log(`🔄 Migrando schedule data...`);
        
        let migrated = 0;
        
        // Migrar tasks
        if (scheduleData.tasks) {
            for (const task of scheduleData.tasks) {
                try {
                    await pool.query(`
                        INSERT INTO schedule_tasks (
                            id, user_id, title, description, type, priority, status,
                            date, time, duration, subject, created_at, updated_at,
                            completed_at, notes
                        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
                        ON CONFLICT (id) DO UPDATE SET
                            status = EXCLUDED.status,
                            updated_at = EXCLUDED.updated_at
                    `, [
                        task.id,
                        task.user_id,
                        task.title,
                        task.description || null,
                        task.type,
                        task.priority || 'medium',
                        task.status || 'pending',
                        task.date,
                        task.time || null,
                        task.duration || 60,
                        task.subject || null,
                        task.created_at,
                        task.updated_at,
                        task.completed_at || null,
                        task.notes || null
                    ]);
                    migrated++;
                    console.log(`✅ Task: ${task.title}`);
                } catch (error) {
                    console.error(`❌ Erro em task ${task.id}:`, error.message);
                }
            }
        }
        
        // Migrar events
        if (scheduleData.events) {
            for (const event of scheduleData.events) {
                try {
                    await pool.query(`
                        INSERT INTO schedule_events (
                            id, user_id, title, description, type, date, start_time,
                            end_time, all_day, color, course_id, exam_id, location,
                            created_at, updated_at
                        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
                        ON CONFLICT (id) DO UPDATE SET
                            updated_at = EXCLUDED.updated_at
                    `, [
                        event.id,
                        event.user_id,
                        event.title,
                        event.description || null,
                        event.type || null,
                        event.date,
                        event.start_time || null,
                        event.end_time || null,
                        event.all_day || false,
                        event.color || null,
                        event.course_id || null,
                        event.exam_id || null,
                        event.location || null,
                        event.created_at,
                        event.updated_at
                    ]);
                    migrated++;
                    console.log(`✅ Event: ${event.title}`);
                } catch (error) {
                    console.error(`❌ Erro em event ${event.id}:`, error.message);
                }
            }
        }
        
        // Migrar study sessions
        if (scheduleData.study_sessions) {
            for (const session of scheduleData.study_sessions) {
                try {
                    await pool.query(`
                        INSERT INTO schedule_study_sessions (
                            id, user_id, title, description, date, start_time, end_time,
                            duration, subject, type, course_id, module_id, status,
                            progress, score, notes, created_at, updated_at, completed_at
                        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
                        ON CONFLICT (id) DO UPDATE SET
                            status = EXCLUDED.status,
                            progress = EXCLUDED.progress,
                            updated_at = EXCLUDED.updated_at
                    `, [
                        session.id,
                        session.user_id,
                        session.title,
                        session.description || null,
                        session.date,
                        session.start_time || null,
                        session.end_time || null,
                        session.duration || null,
                        session.subject || null,
                        session.type || null,
                        session.course_id || null,
                        session.module_id || null,
                        session.status || 'pending',
                        session.progress || 0,
                        session.score || null,
                        session.notes || null,
                        session.created_at,
                        session.updated_at,
                        session.completed_at || null
                    ]);
                    migrated++;
                    console.log(`✅ Study Session: ${session.title}`);
                } catch (error) {
                    console.error(`❌ Erro em study session ${session.id}:`, error.message);
                }
            }
        }
        
        // Migrar daily goals
        if (scheduleData.daily_goals) {
            for (const goal of scheduleData.daily_goals) {
                try {
                    await pool.query(`
                        INSERT INTO schedule_daily_goals (
                            id, user_id, date, study_hours_target, study_hours_completed,
                            tasks_target, tasks_completed, questions_target, questions_completed,
                            flashcards_target, flashcards_completed, created_at, updated_at
                        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
                        ON CONFLICT (id) DO UPDATE SET
                            study_hours_completed = EXCLUDED.study_hours_completed,
                            tasks_completed = EXCLUDED.tasks_completed,
                            questions_completed = EXCLUDED.questions_completed,
                            flashcards_completed = EXCLUDED.flashcards_completed,
                            updated_at = EXCLUDED.updated_at
                    `, [
                        goal.id,
                        goal.user_id,
                        goal.date,
                        goal.study_hours_target || 0,
                        goal.study_hours_completed || 0,
                        goal.tasks_target || 0,
                        goal.tasks_completed || 0,
                        goal.questions_target || 0,
                        goal.questions_completed || 0,
                        goal.flashcards_target || 0,
                        goal.flashcards_completed || 0,
                        goal.created_at,
                        goal.updated_at
                    ]);
                    migrated++;
                    console.log(`✅ Daily Goal: ${goal.date}`);
                } catch (error) {
                    console.error(`❌ Erro em daily goal ${goal.id}:`, error.message);
                }
            }
        }
        
        return { migrated };
    } catch (error) {
        console.error('❌ Erro na migração de schedule:', error.message);
        return { migrated: 0 };
    }
}

// =============================================================================
// FUNÇÃO PRINCIPAL: MIGRAR TUDO
// =============================================================================
async function migrateAllRemainingData() {
    try {
        console.log('🚀 Iniciando migração completa de todos os dados restantes...\n');
        
        const results = {
            summaries: await migrateSummaries(),
            previousExams: await migratePreviousExams(), 
            legislation: await migrateLegislation(),
            enrollments: await migrateEnrollments(),
            profiles: await migrateProfiles(),
            settings: await migrateSettings(),
            schedule: await migrateSchedule()
        };
        
        console.log('\n🎉 MIGRAÇÃO COMPLETA FINALIZADA!');
        console.log('📊 Resumo Final:');
        console.log(`   • Summaries migrados: ${results.summaries.migrated}`);
        console.log(`   • Previous Exams migrados: ${results.previousExams.migrated}`);
        console.log(`   • Legislation migrados: ${results.legislation.migrated}`);
        console.log(`   • Enrollments migrados: ${results.enrollments.migrated}`);
        console.log(`   • Profiles migrados: ${results.profiles.migrated}`);
        console.log(`   • Settings migrados: ${results.settings.migrated}`);
        console.log(`   • Schedule items migrados: ${results.schedule.migrated}`);
        
        const totalMigrated = Object.values(results).reduce((sum, r) => sum + r.migrated, 0);
        console.log(`\n✨ TOTAL GERAL: ${totalMigrated} registros migrados com sucesso!`);
        
        return results;
        
    } catch (error) {
        console.error('❌ Erro na migração completa:', error);
        throw error;
    } finally {
        await pool.end();
    }
}

// Executar migração se chamado diretamente
if (require.main === module) {
    migrateAllRemainingData()
        .then(results => {
            console.log('\n✅ Migração completa finalizada com sucesso!');
            process.exit(0);
        })
        .catch(error => {
            console.error('\n❌ Falha na migração completa:', error);
            process.exit(1);
        });
}

module.exports = { migrateAllRemainingData };