// Course model placeholder - will be implemented in Phase 2
// This will contain Course struct, Module struct, etc.

#[derive(Debug, Clone)]
pub struct Course {
    pub id: i32,
    pub title: String,
    pub description: Option<String>,
    pub active: bool,
}

#[derive(Debug, Clone)]
pub struct CourseModule {
    pub id: i32,
    pub course_id: i32,
    pub title: String,
    pub order: i32,
}