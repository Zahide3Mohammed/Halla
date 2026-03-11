<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Post;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Storage;

class PostController extends Controller
{
    public function index()
{
    $posts = Post::with([
            'user:id,nom,prenom,photo,sexe'
        ])
        ->withCount(['likes', 'comments'])
        ->latest()
        ->paginate(10);
    $posts->getCollection()->transform(function ($post) {
        $post->is_liked = false;
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
        $post->load([
            'user:id,nom,prenom,photo'
        ]);
        $post->loadCount(['likes', 'comments']);
        $post->is_liked = false;
        return response()->json($post, 201);
    }


    public function updateProfilePicture(Request $request)
    {
        $request->validate([
            'photo' => 'required|image|max:2048'
        ]);
        $user = auth()->user() ;
        if ($request->hasFile('photo')) {
            $path = $request->file('photo')->store('profiles', 'public');
            $user->photo = asset('storage/' . $path);
            $user->save();
        }
        return response()->json([
            'message' => 'Profile updated!',
            'photo' => $user->profile_photo,
        ]);
    }


       public function myPosts()
        {
            $posts = Post::with([
                    'user:id,nom,prenom,photo'
                ])
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
            $post->delete();
            return response()->json(['message' => 'Post deleted successfully']);
        }



        public function toggleLike($id) {
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
                $post->likes()->create([
                    'user_id' => $user->id
                ]);
                if ($post->user_id !== $user->id) {
                    \App\Models\Notification::create([
                        'receiver_id' => $post->user_id, // Moul l-post
                        'sender_id'   => $user->id,      // L-user li dar like
                        'type'        => 'like',
                        'post_id'     => $post->id,
                        'is_read'     => false,
                    ]);
                }
                return response()->json([
                    'liked' => true, 
                    'count' => $post->likes()->count()
                ]);
            } catch (\Exception $e) {
                return response()->json(['error' => $e->getMessage()], 500);
            }
        }

        public function show($id) {
            // kanchoufo l-post w kan-chargiw m3ah l-user (author)
            $post = Post::with('user')->findOrFail($id); 
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
}