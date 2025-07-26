<?php

use \App\Http\Response;
use \App\Controller\Api;

// LIST COURSES - GET /api/v1/courses
$obRouter->get('/api/v1/courses', [
    function($request) {
        return new Response(200, Api\Courses::list($request), 'application/json');
    }
]);

// GET SINGLE COURSE - GET /api/v1/courses/{id}
$obRouter->get('/api/v1/courses/{id}', [
    function($request, $id) {
        return new Response(200, Api\Courses::get($request, $id), 'application/json');
    }
]);

// CREATE COURSE - POST /api/v1/courses
$obRouter->post('/api/v1/courses', [
    function($request) {
        return new Response(200, Api\Courses::create($request), 'application/json');
    }
]);

// UPDATE COURSE - PUT /api/v1/courses/{id}
$obRouter->put('/api/v1/courses/{id}', [
    function($request, $id) {
        $result = Api\Courses::update($request, $id);
        $statusCode = $result['success'] ? 200 : 500;
        return new Response($statusCode, $result, 'application/json');
    }
]);

// DELETE COURSE - DELETE /api/v1/courses/{id}
$obRouter->delete('/api/v1/courses/{id}', [
    function($request, $id) {
        return new Response(200, Api\Courses::delete($request, $id), 'application/json');
    }
]);


// LIST COURSE MODULES - GET /api/v1/courses/{courseId}/modules
$obRouter->get('/api/v1/courses/{courseId}/modules', [
    function($request, $courseId) {
        return new Response(200, Api\CourseModules::list($request, $courseId), 'application/json');
    }
]);

// GET SINGLE MODULE - GET /api/v1/courses/{courseId}/modules/{id}
$obRouter->get('/api/v1/courses/{courseId}/modules/{id}', [
    function($request, $courseId, $id) {
        return new Response(200, Api\CourseModules::get($request, $courseId, $id), 'application/json');
    }
]);

// CREATE MODULE - POST /api/v1/courses/{courseId}/modules
$obRouter->post('/api/v1/courses/{courseId}/modules', [
    function($request, $courseId) {
        return new Response(200, Api\CourseModules::create($request, $courseId), 'application/json');
    }
]);

// UPDATE MODULE - PUT /api/v1/courses/{courseId}/modules/{id}
$obRouter->put('/api/v1/courses/{courseId}/modules/{id}', [
    function($request, $courseId, $id) {
        return new Response(200, Api\CourseModules::update($request, $courseId, $id), 'application/json');
    }
]);

// DELETE MODULE - DELETE /api/v1/courses/{courseId}/modules/{id}
$obRouter->delete('/api/v1/courses/{courseId}/modules/{id}', [
    function($request, $courseId, $id) {
        return new Response(200, Api\CourseModules::delete($request, $courseId, $id), 'application/json');
    }
]);

// REORDER MODULES - PUT /api/v1/courses/{courseId}/modules/reorder
$obRouter->put('/api/v1/courses/{courseId}/modules/reorder', [
    function($request, $courseId) {
        return new Response(200, Api\CourseModules::reorder($request, $courseId), 'application/json');
    }
]);

// LIST LESSONS - GET /api/v1/modules/{moduleId}/lessons
$obRouter->get('/api/v1/modules/{moduleId}/lessons', [
    function($request, $moduleId) {
        return new Response(200, Api\Lessons::list($request, $moduleId), 'application/json');
    }
]);

// GET SINGLE LESSON - GET /api/v1/modules/{moduleId}/lessons/{id}
$obRouter->get('/api/v1/modules/{moduleId}/lessons/{id}', [
    function($request, $moduleId, $id) {
        return new Response(200, Api\Lessons::get($request, $moduleId, $id), 'application/json');
    }
]);

// CREATE LESSON - POST /api/v1/modules/{moduleId}/lessons
$obRouter->post('/api/v1/modules/{moduleId}/lessons', [
    function($request, $moduleId) {
        return new Response(200, Api\Lessons::create($request, $moduleId), 'application/json');
    }
]);

// UPDATE LESSON - PUT /api/v1/modules/{moduleId}/lessons/{id}
$obRouter->put('/api/v1/modules/{moduleId}/lessons/{id}', [
    function($request, $moduleId, $id) {
        return new Response(200, Api\Lessons::update($request, $moduleId, $id), 'application/json');
    }
]);

// DELETE LESSON - DELETE /api/v1/modules/{moduleId}/lessons/{id}
$obRouter->delete('/api/v1/modules/{moduleId}/lessons/{id}', [
    function($request, $moduleId, $id) {
        return new Response(200, Api\Lessons::delete($request, $moduleId, $id), 'application/json');
    }
]);

// REORDER LESSONS - PUT /api/v1/modules/{moduleId}/lessons/reorder
$obRouter->put('/api/v1/modules/{moduleId}/lessons/reorder', [
    function($request, $moduleId) {
        return new Response(200, Api\Lessons::reorder($request, $moduleId), 'application/json');
    }
]);

// ADD LESSON RESOURCE - POST /api/v1/modules/{moduleId}/lessons/{lessonId}/resources
$obRouter->post('/api/v1/modules/{moduleId}/lessons/{lessonId}/resources', [
    function($request, $moduleId, $lessonId) {
        return new Response(200, Api\Lessons::addResource($request, $moduleId, $lessonId), 'application/json');
    }
]);