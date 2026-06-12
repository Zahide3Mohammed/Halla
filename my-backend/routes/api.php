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
use App\Http\Controllers\PaymentController;
use Illuminate\Support\Facades\Broadcast;


Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/check-email', [AuthController::class, 'checkEmail']);
Route::post('/recommendations', [HotelController::class, 'getRecommendations']);
Route::get('/posts', [PostController::class, 'index']);
Route::get('/groups', [GroupController::class, 'index']);
Route::post('/ai/suggest', [AiController::class, 'suggest']);


Route::middleware('auth:sanctum')->group(function () {
    Route::post('/broadcasting/auth', function (\Illuminate\Http\Request $request) {
        return Broadcast::auth($request);
    });
    
    Route::post('/personalitytest', [AuthController::class, 'personalitytest']);
    Route::post('/delete-account', [AuthController::class, 'deleteAccount']);
    Route::post('/change-password', [AuthController::class, 'changePassword']);
    Route::post('/update-photo', [Update_Profile::class, 'updatePhoto']);
    Route::get('/user-profile/{id}', [AuthController::class, 'showProfile']);

    Route::post('/posts', [PostController::class, 'store']);
    Route::get('/my-posts', [PostController::class, 'myPosts']);
    Route::delete('/posts/{id}', [PostController::class, 'destroy']);
    Route::post('/posts/{id}/toggle-like', [PostController::class, 'toggleLike']);
    Route::get('/my-liked-posts', [PostController::class, 'getLikedPosts']);
    Route::get('/posts/{id}', [PostController::class, 'show']);

    Route::get('/posts/{id}/comments', [CommentController::class, 'index']);
    Route::post('/posts/{id}/comments', [CommentController::class, 'store']);
    Route::delete('/comments/{comment}', [CommentController::class, 'destroy']);
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::delete('/notifications/{id}', [NotificationController::class, 'destroy']);
    Route::post('/notifications/read', [NotificationController::class, 'markAsRead']);
    Route::post('/notifications/{id}/read', [NotificationController::class, 'markAsReadone']);

    Route::post('/groups', [GroupController::class, 'store']);
    Route::post('/groups/random-join', [GroupController::class, 'joinRandomOrCreate']);
    Route::post('/groups/{id}/join', [GroupController::class, 'join']);
    Route::get('/my-completed-groups', [GroupController::class, 'getMyGroups']);
    Route::get('/groups/{groupId}/messages', [MessageController::class, 'fetchMessages']);
    Route::post('/groups/{groupId}/messages', [MessageController::class, 'store']);

    Route::get('/friends', [DirectMessageController::class, 'getFriends']);
    Route::delete('/friends/{id}', [DirectMessageController::class, 'removeFriend']);
    Route::get('/direct-messages/{friendId}', [DirectMessageController::class, 'getHistory']);
    Route::post('/direct-messages', [DirectMessageController::class, 'send']);
    Route::delete('/direct-messages/{friendId}', [DirectMessageController::class, 'deleteDiscussion']);
    Route::get('/friend-suggestions', [DirectMessageController::class, 'getSuggestions']);
    Route::post('/users/{id}/follow', [FriendRequestController::class, 'follow']);
    Route::post('/friend-accept/{id}', [FriendRequestController::class, 'accept']);
    Route::get('/find-friends', [PostController::class, 'suggestUsers']);

});
    Route::post('/create-checkout-session', [PaymentController::class, 'createCheckoutSession']);
    Route::post('/create-payment-intent', [PaymentController::class, 'create']);