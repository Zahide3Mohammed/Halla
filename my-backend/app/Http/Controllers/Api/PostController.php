<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Post;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Storage;
use App\Events\NotificationSent;
use App\Models\Notification; // هادي ضرورية
use App\Events\PostCreated;

class PostController extends Controller
{
    public function index()
    {
        $posts = Post::with(['user:id,nom,prenom,photo,sexe'])
            ->withCount(['likes', 'comments'])
            ->latest()
            ->paginate(10);

        $posts->getCollection()->transform(function ($post) {
            $post->is_liked = false;
            // كنستعملو auth()->id() مباشرة إلا كان الـ middleware خدام
            if (auth('sanctum')->check()) {
                $post->is_liked = $post->likes()
                    ->where('user_id', auth('sanctum')->id())
                    ->exists();
            }
            return $post;
        });

        return response()->json($posts);
    }

    public function store(Request $request)
    {
        $request->validate([
            'content' => 'required|string',
            'image' => 'nullable|image|max:2048',
        ]);

        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('posts', 'public');
        }

        $post = Post::create([
            'user_id' => auth()->id(),
            'content' => $request->content,
            'media_url' => $imagePath,
        ]);

        $post->load(['user:id,nom,prenom,photo']);
        $post->loadCount(['likes', 'comments']);
        $post->is_liked = false;

        broadcast(new \App\Events\PostCreated($post))->toOthers();

        return response()->json($post, 201);
    }

    public function updateProfilePicture(Request $request)
    {
        $request->validate([
            'photo' => 'required|image|max:2048'
        ]);

        $user = auth()->user();
        if ($request->hasFile('photo')) {
            // حذف الصورة القديمة إلا كانت كاينا (اختياري ولكن مهم للـ Clean Storage)
            if ($user->photo) {
                Storage::disk('public')->delete(str_replace('storage/', '', $user->photo));
            }

            $path = $request->file('photo')->store('profiles', 'public');
            $user->photo = $path; // حفظ المسار فقط
            $user->save();
        }

        return response()->json([
            'message' => 'Profile updated!',
            'photo' => $user->photo, // تأكدت من اسم المتغير هنا
        ]);
    }

    public function myPosts()
    {
        $posts = Post::with(['user:id,nom,prenom,photo'])
            ->withCount(['likes', 'comments'])
            ->where('user_id', auth()->id())
            ->latest()
            ->get()
            ->map(function ($post) {
                $post->is_liked = $post->likes()
                    ->where('user_id', auth()->id())
                    ->exists();
                return $post;
            });

        return response()->json($posts);
    }

    public function destroy($id)
    {
        $post = Post::findOrFail($id);
        if ($post->user_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        
        // حذف الصورة من السيرفر قبل حذف الـ post
        if ($post->media_url) {
            Storage::disk('public')->delete($post->media_url);
        }
        
        $post->delete();
        return response()->json(['message' => 'Post deleted successfully']);
    }

    public function toggleLike($id) 
    {
        try {
            $user = auth()->user();
            if (!$user) {
                return response()->json(['message' => 'Unauthenticated'], 401);
            }

            $post = Post::findOrFail($id);
            $like = $post->likes()->where('user_id', $user->id)->first();
            
            if ($like) {
                $like->delete();
                return response()->json([
                    'liked' => false, 
                    'count' => $post->likes()->count()
                ]);
            }

            $post->likes()->create(['user_id' => $user->id]);

            if ($post->user_id !== $user->id) {
                $notification = \App\Models\Notification::create([
                    'receiver_id' => $post->user_id, 
                    'sender_id'   => $user->id,
                    'type'        => 'like',
                    'post_id'     => $post->id,
                    'is_read'     => false,
                ]);
                broadcast(new \App\Events\NotificationSent($notification))->toOthers();
            }

            return response()->json([
                'liked' => true, 
                'count' => $post->likes()->count()
            ]);

        } catch (\Exception $e) {
    return response()->json(['error' => $e->getMessage(), 'line' => $e->getLine()], 500);
}
    }

    public function show($id) {
        $post = Post::with(['user:id,nom,prenom,photo,sexe'])->withCount(['likes', 'comments'])->findOrFail($id);
        // زدت ليك هادي باش تعرف واش لايكيتي هاد البوست ولا لا حتى ف الـ show
        $post->is_liked = $post->likes()->where('user_id', auth('sanctum')->id())->exists();
        return response()->json($post);
    }

    public function suggestUsers() {
        $authId = auth()->id();
        $users = User::where('id', '!=', $authId)
            ->whereDoesntHave('friends', function($q) use ($authId) {
                $q->where('friend_id', $authId);
            })
            ->get();
        return response()->json($users);
    }

    public function sendRequest($friend_id)
    {
        $user = auth()->user();
        $notification = \App\Models\Notification::create([
            'receiver_id' => $friend_id,
            'sender_id'   => $user->id,
            'type'        => 'friend_request',
            'is_read'     => false,
        ]);

        broadcast(new \App\Events\NotificationSent($notification))->toOthers();
        $user->friends()->syncWithoutDetaching([$friend_id]);

        return response()->json(['message' => 'Request sent successfully!']);
    }
    public function getUserPosts($id) 
    {
    return Post::where('user_id', $id)->orderBy('created_at', 'desc')->get();
    }
}