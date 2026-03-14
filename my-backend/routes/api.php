<?php

use App\Http\Controllers\Api\PostController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CommentController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\Update_Profile;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\GroupController;
use App\Http\Controllers\MessageController;
use Illuminate\Support\Facades\Broadcast;


Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::middleware('auth:sanctum')->post('/personalitytest', [AuthController::class, 'personalitytest']);
Route::post('/check-email', [AuthController::class, 'checkEmail']);
Route::get('/user-profile/{id}', [AuthController::class, 'getProfile']);
Route::get('/user-posts/{id}', [PostController::class, 'getUserPosts']);

Route::middleware('auth:sanctum')->post('/delete-account', [AuthController::class, 'deleteAccount']);
Route::middleware('auth:sanctum')->post('/change-password', [AuthController::class, 'changePassword']);

Route::middleware('auth:sanctum')->post('/update-photo', [Update_Profile::class, 'updatePhoto']);

Route::get('/posts', [PostController::class, 'index']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/posts', [PostController::class, 'store']);
});
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/my-posts', [PostController::class, 'myPosts']);
    Route::delete('/posts/{id}', [PostController::class, 'destroy']);
});
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/posts/{id}/toggle-like', [PostController::class, 'toggleLike']);
    Route::get('/my-liked-posts', [PostController::class, 'getLikedPosts']);


Route::get('/posts/{id}/comments', [CommentController::class, 'index']);
Route::post('/posts/{id}/comments', [CommentController::class, 'store']);
    Route::delete('/comments/{comment}', [CommentController::class, 'destroy']);

    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::post('/notifications/read', [NotificationController::class, 'markAsRead']);
    Route::post('/notifications/{id}/read', [NotificationController::class, 'markAsReadone']);
    
    Route::get('/posts/{id}', [PostController::class, 'show']);
    Route::get('/find-friends', [PostController::class, 'suggestUsers']);
    Route::post('/friend-request/{friend_id}', [PostController::class, 'sendRequest']);
});
 // routes de composent de groups
 Route::get('/groups',[GroupController::class,'index']);

// routes/api.php

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/groups', [GroupController::class, 'store']);
    Route::post('/groups/{id}/join', [GroupController::class, 'join']);
});
// chat 
Route::middleware('auth:sanctum')->group(function () {
Route::get('/my-current-salon', [GroupController::class, 'getPendingGroup']);
Route::get('/my-completed-groups', [GroupController::class, 'getMyGroups']);
Route::get('/groups/{groupId}/messages', [MessageController::class, 'fetchMessages']);
Route::get('/groups/pending', [GroupController::class, 'getPendingGroup']);
Route::post('/groups/random-join', [GroupController::class, 'joinRandomOrCreate']);
Route::post('/groups/{groupId}/messages', [MessageController::class, 'store']);
});
Broadcast::routes(['middleware' => ['auth:sanctum']]);


