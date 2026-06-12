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
use App\Http\Controllers\DirectMessageController;
use App\Http\Controllers\FriendRequestController;
use App\Http\Controllers\HotelController;
use Illuminate\Support\Facades\Broadcast;

// ==========================================
// PUBLIC ROUTES
// ==========================================
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/check-email', [AuthController::class, 'checkEmail']);
Route::post('/recommendations', [HotelController::class, 'getRecommendations']);
Route::get('/posts', [PostController::class, 'index']);
Route::get('/groups', [GroupController::class, 'index']);
Route::post('/ai/suggest', [AiController::class, 'suggest']);

// ==========================================
// PROTECTED ROUTES (AUTH:SANCTUM)
// ==========================================
Route::middleware('auth:sanctum')->group(function () {
    
    // Broadcasting
    Route::post('/broadcasting/auth', function (\Illuminate\Http\Request $request) {
        return Broadcast::auth($request);
    });
    
    // Auth & Account Actions
    Route::post('/personalitytest', [AuthController::class, 'personalitytest']);
    Route::post('/delete-account', [AuthController::class, 'deleteAccount']);
    Route::post('/change-password', [AuthController::class, 'changePassword']);
    Route::post('/update-photo', [Update_Profile::class, 'updatePhoto']);
    Route::get('/user-profile/{id}', [AuthController::class, 'showProfile']);

    // Posts Stack
    Route::post('/posts', [PostController::class, 'store']);
    Route::get('/my-posts', [PostController::class, 'myPosts']);
    Route::delete('/posts/{id}', [PostController::class, 'destroy']);
    Route::post('/posts/{id}/toggle-like', [PostController::class, 'toggleLike']);
    Route::get('/my-liked-posts', [PostController::class, 'getLikedPosts']);
    Route::get('/posts/{id}', [PostController::class, 'show']);

    // Comments & Notifications
    Route::get('/posts/{id}/comments', [CommentController::class, 'index']);
    Route::post('/posts/{id}/comments', [CommentController::class, 'store']);
    Route::delete('/comments/{comment}', [CommentController::class, 'destroy']);
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::delete('/notifications/{id}', [NotificationController::class, 'destroy']);
    Route::post('/notifications/read', [NotificationController::class, 'markAsRead']);
    Route::post('/notifications/{id}/read', [NotificationController::class, 'markAsReadone']);

    // Groups Stack
    Route::post('/groups', [GroupController::class, 'store']);
    Route::post('/groups/random-join', [GroupController::class, 'joinRandomOrCreate']);
    Route::post('/groups/{id}/join', [GroupController::class, 'join']);
    Route::get('/my-completed-groups', [GroupController::class, 'getMyGroups']);
    Route::get('/groups/{groupId}/messages', [MessageController::class, 'fetchMessages']);
    Route::post('/groups/{groupId}/messages', [MessageController::class, 'store']);

    // Direct Messages & Friends List
    Route::get('/friends', [DirectMessageController::class, 'getFriends']);
    Route::delete('/friends/{id}', [DirectMessageController::class, 'removeFriend']);
    Route::get('/direct-messages/{friendId}', [DirectMessageController::class, 'getHistory']);
    Route::post('/direct-messages', [DirectMessageController::class, 'send']);
    Route::delete('/direct-messages/{friendId}', [DirectMessageController::class, 'deleteDiscussion']);
    Route::get('/friend-suggestions', [DirectMessageController::class, 'getSuggestions']);

    // --- FRIEND REQUESTS & FOLLOW SYSTEM (Consolidated) ---
    Route::get('/find-friends', [PostController::class, 'suggestUsers']);
    
    // Follow / Send Request
    Route::post('/users/{id}/follow', [FriendRequestController::class, 'follow']);
    
    // Accept Request (Post request with sender_id as param in URL)
    Route::post('/friend-accept/{id}', [FriendRequestController::class, 'accept']);

});