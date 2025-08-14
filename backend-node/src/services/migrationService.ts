import { query } from '../database/connection';
import fs from 'fs';
import path from 'path';

export class MigrationService {
  
  // Helper to read JSON files
  private readJsonFile(filepath: string): any[] {
    try {
      if (!fs.existsSync(filepath)) {
        return [];
      }
      const data = fs.readFileSync(filepath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error(`Error reading ${filepath}:`, error);
      return [];
    }
  }

  // Map UUID course IDs to integer IDs
  private async mapCourseIds(): Promise<Map<string, number>> {
    const courseMapping = new Map<string, number>();
    
    // Get all courses from database
    const result = await query('SELECT id, title FROM courses ORDER BY id');
    const dbCourses = result.rows;
    
    // Read JSON courses
    const jsonCourses = this.readJsonFile(path.join(__dirname, '../../data/courses.json'));
    
    // Try to map by title first, then create new courses if needed
    for (const jsonCourse of jsonCourses) {
      const matchingDbCourse = dbCourses.find((db: any) => 
        db.title.toLowerCase() === jsonCourse.title.toLowerCase()
      );
      
      if (matchingDbCourse) {
        courseMapping.set(jsonCourse.id, matchingDbCourse.id);
      } else {
        // Create new course in database (using instructor_id = 1 for admin)
        const insertResult = await query(`
          INSERT INTO courses (title, description, category, price, instructor_id, status, slug, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
          RETURNING id
        `, [
          jsonCourse.title,
          jsonCourse.description || '',
          jsonCourse.category || 'GERAL',
          jsonCourse.price || 0,
          1, // Default to admin instructor
          jsonCourse.status || 'published',
          jsonCourse.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `course-${Date.now()}`
        ]);
        courseMapping.set(jsonCourse.id, insertResult.rows[0].id);
      }
    }
    
    return courseMapping;
  }

  // Map UUID lesson IDs to integer IDs  
  private async mapLessonIds(): Promise<Map<string, number>> {
    const lessonMapping = new Map<string, number>();
    
    // Get all lessons from database
    const result = await query('SELECT id, title FROM lessons ORDER BY id');
    const dbLessons = result.rows;
    
    // Read JSON lessons
    const jsonLessons = this.readJsonFile(path.join(__dirname, '../../data/lessons.json'));
    
    // Try to map by title
    for (const jsonLesson of jsonLessons) {
      const matchingDbLesson = dbLessons.find((db: any) => 
        db.title.toLowerCase() === jsonLesson.title.toLowerCase()
      );
      
      if (matchingDbLesson) {
        lessonMapping.set(jsonLesson.id, matchingDbLesson.id);
      }
    }
    
    return lessonMapping;
  }

  // Migrate enrollments from JSON to PostgreSQL
  async migrateEnrollments(): Promise<{ migrated: number; skipped: number }> {
    console.log('🔄 Starting enrollments migration...');
    
    const jsonEnrollments = this.readJsonFile(path.join(__dirname, '../../data/enrollments.json'));
    const courseMapping = await this.mapCourseIds();
    
    let migrated = 0;
    let skipped = 0;
    
    for (const enrollment of jsonEnrollments) {
      try {
        const courseId = courseMapping.get(enrollment.course_id);
        
        if (!courseId) {
          console.log(`❌ Skipping enrollment - course not found: ${enrollment.course_id}`);
          skipped++;
          continue;
        }
        
        // Check if enrollment already exists
        const existing = await query(
          'SELECT id FROM enrollments WHERE user_id = $1 AND course_id = $2',
          [enrollment.user_id, courseId]
        );
        
        if (existing.rows.length > 0) {
          console.log(`⏭️ Skipping enrollment - already exists for user ${enrollment.user_id} course ${courseId}`);
          skipped++;
          continue;
        }
        
        // Insert enrollment
        await query(`
          INSERT INTO enrollments (
            user_id, course_id, status, progress_percentage, 
            enrolled_at, completed_at, last_accessed, certificate_issued,
            created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        `, [
          enrollment.user_id,
          courseId,
          enrollment.status,
          enrollment.progress?.percentage || 0,
          enrollment.enrolled_at,
          enrollment.completion_date || null,
          enrollment.progress?.last_accessed || enrollment.updated_at,
          enrollment.certificate_issued || false,
          enrollment.enrolled_at,
          enrollment.updated_at
        ]);
        
        console.log(`✅ Migrated enrollment: user ${enrollment.user_id} -> course ${courseId}`);
        migrated++;
        
      } catch (error) {
        console.error(`❌ Error migrating enrollment ${enrollment.id}:`, error);
        skipped++;
      }
    }
    
    console.log(`📊 Enrollments migration completed: ${migrated} migrated, ${skipped} skipped`);
    return { migrated, skipped };
  }

  // Migrate lesson progress from JSON to PostgreSQL
  async migrateLessonProgress(): Promise<{ migrated: number; skipped: number }> {
    console.log('🔄 Starting lesson progress migration...');
    
    const jsonProgress = this.readJsonFile(path.join(__dirname, '../../data/lesson_progress.json'));
    const courseMapping = await this.mapCourseIds();
    const lessonMapping = await this.mapLessonIds();
    
    let migrated = 0;
    let skipped = 0;
    
    for (const progress of jsonProgress) {
      try {
        const courseId = courseMapping.get(progress.course_id);
        const lessonId = lessonMapping.get(progress.lesson_id);
        
        if (!courseId || !lessonId) {
          console.log(`❌ Skipping progress - missing IDs: course ${progress.course_id} -> ${courseId}, lesson ${progress.lesson_id} -> ${lessonId}`);
          skipped++;
          continue;
        }
        
        // Check if progress already exists
        const existing = await query(
          'SELECT id FROM lesson_progress WHERE user_id = $1 AND course_id = $2 AND lesson_id = $3',
          [progress.user_id, courseId, lessonId]
        );
        
        if (existing.rows.length > 0) {
          console.log(`⏭️ Skipping progress - already exists for user ${progress.user_id} lesson ${lessonId}`);
          skipped++;
          continue;
        }
        
        // Insert lesson progress
        await query(`
          INSERT INTO lesson_progress (
            user_id, course_id, lesson_id, current_time_seconds, duration,
            watched_percentage, completed, started_at, last_accessed, completed_at,
            total_watch_time, sessions_count, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        `, [
          progress.user_id,
          courseId,
          lessonId,
          progress.current_time || 0,
          progress.duration || 0,
          progress.watched_percentage || 0,
          progress.completed || false,
          progress.created_at || progress.last_accessed,
          progress.last_accessed,
          progress.completed ? progress.last_accessed : null,
          progress.total_watch_time || 0,
          progress.sessions?.length || 1,
          progress.created_at || progress.last_accessed,
          progress.last_accessed
        ]);
        
        console.log(`✅ Migrated lesson progress: user ${progress.user_id} -> lesson ${lessonId}`);
        migrated++;
        
      } catch (error) {
        console.error(`❌ Error migrating lesson progress ${progress.id}:`, error);
        skipped++;
      }
    }
    
    console.log(`📊 Lesson progress migration completed: ${migrated} migrated, ${skipped} skipped`);
    return { migrated, skipped };
  }

  // Run complete migration
  async runMigration(): Promise<void> {
    console.log('🚀 Starting complete data migration from JSON to PostgreSQL');
    console.log('=========================================================');
    
    try {
      // Test database connection
      await query('SELECT NOW() as current_time');
      console.log('✅ PostgreSQL connection verified');
      
      // Migrate enrollments
      const enrollmentResult = await this.migrateEnrollments();
      
      // Migrate lesson progress
      const progressResult = await this.migrateLessonProgress();
      
      console.log('\n🎯 Migration Summary:');
      console.log('====================');
      console.log(`📚 Enrollments: ${enrollmentResult.migrated} migrated, ${enrollmentResult.skipped} skipped`);
      console.log(`📖 Lesson Progress: ${progressResult.migrated} migrated, ${progressResult.skipped} skipped`);
      console.log('\n🏆 Migration completed successfully!');
      
    } catch (error) {
      console.error('❌ Migration failed:', error);
      throw error;
    }
  }
}

export const migrationService = new MigrationService();