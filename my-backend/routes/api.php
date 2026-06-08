<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\Api\PostController;
use App\Http\Controllers\CommentController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\Update_Profile;
use App\Http\Controllers\GroupController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\AiController;
use App\Http\Controllers\HotelController;

// 1. الرووتس العادية (مفتوحة بلا تسجال الدخول)
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/check-email', [AuthController::class, 'checkEmail']);

Route::post('/recommendations', [HotelController::class, 'getRecommendations']);

Route::middleware('auth:sanctum')->post('/delete-account', [AuthController::class, 'deleteAccount']);
Route::middleware('auth:sanctum')->post('/change-password', [AuthController::class, 'changePassword']);

Route::middleware('auth:sanctum')->post('/update-photo', [Update_Profile::class, 'updatePhoto']);


Route::get('/posts', [PostController::class, 'index']);
Route::get('/groups', [GroupController::class, 'index']);

// 2. الرووتس المحمية (ضروري يكون الـ User مسجل الدخول بـ Sanctum)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/broadcasting/auth', function (\Illuminate\Http\Request $request) {
        return Broadcast::auth($request);
    });
    
    // بروفايل وحساب المستخدم
    Route::post('/personalitytest', [AuthController::class, 'personalitytest']);
    Route::post('/delete-account', [AuthController::class, 'deleteAccount']);
    Route::post('/change-password', [AuthController::class, 'changePassword']);
    Route::post('/update-photo', [Update_Profile::class, 'updatePhoto']);

    // المنشورات والتفاعل (Posts & Likes)
    Route::post('/posts', [PostController::class, 'store']);
    Route::get('/my-posts', [PostController::class, 'myPosts']);
    Route::delete('/posts/{id}', [PostController::class, 'destroy']);
    Route::post('/posts/{id}/toggle-like', [PostController::class, 'toggleLike']);
    Route::get('/my-liked-posts', [PostController::class, 'getLikedPosts']);
    Route::get('/posts/{id}', [PostController::class, 'show']);

    // التعليقات (Comments)
    Route::get('/posts/{id}/comments', [CommentController::class, 'index']);
    Route::post('/posts/{id}/comments', [CommentController::class, 'store']);

    Route::delete('/comments/{comment}', [CommentController::class, 'destroy']);

    // الإشعارات (Notifications)
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::post('/notifications/read', [NotificationController::class, 'markAsRead']);
    Route::post('/notifications/{id}/read', [NotificationController::class, 'markAsReadone']);
    
    // الأصدقاء (Friends)
    Route::get('/find-friends', [PostController::class, 'suggestUsers']);
    Route::post('/friend-request/{friend_id}', [PostController::class, 'sendRequest']);

});
Route::get('/groups',[GroupController::class,'index']);
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/groups', [GroupController::class, 'store']);
    Route::post('/groups/random-join', [GroupController::class, 'joinRandomOrCreate']);
    Route::post('/groups/{id}/join', [GroupController::class, 'join']);
    Route::get('/my-completed-groups', [GroupController::class, 'getMyGroups']);
    Route::get('/groups/{groupId}/messages', [MessageController::class, 'fetchMessages']);
    Route::post('/groups/{groupId}/messages', [MessageController::class, 'store']);
    
 
});
 Route::post('/ai/suggest', [AiController::class, 'suggest']);