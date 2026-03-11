<?php

namespace App\Http\Controllers;

use App\Models\PostComment;
use App\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CommentController extends Controller
{

    public function index($postId)
    {
        try {
            Post::findOrFail($postId);
            $comments = PostComment::with([
                'user:id,nom,sexe,prenom,photo'
            ])
            ->where('post_id', $postId)
            ->latest()
            ->get();
            return response()->json($comments, 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error fetching comments',
                'error' => $e->getMessage()
            ], 500);
        }
    }


    public function store(Request $request, $postId)
    {
        try {
            $validated = $request->validate([
                'body' => 'required|string|max:1000',
            ]);

            $post = Post::findOrFail($postId);

            $comment = PostComment::create([
                'body' => $validated['body'],
                'user_id' => Auth::id(),
                'post_id' => $post->id
            ]);

            // --- L-MODIFICATION HIYA HADI ---
            if ($post->user_id !== Auth::id()) {
                \App\Models\Notification::create([
                    'receiver_id' => $post->user_id,
                    'sender_id'   => Auth::id(),
                    'type'        => 'comment',
                    'post_id'     => $post->id,
                    'is_read'     => false,
                ]);
            }
            // -------------------------------

            $comment->load([
                'user:id,nom,photo'
            ]);

            return response()->json($comment, 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error creating comment',
                'error' => $e->getMessage()
            ], 500);
        }
    }


    public function destroy($id)
    {
        try {
            $comment = PostComment::findOrFail($id);
            if ($comment->user_id !== Auth::id()) {
                return response()->json([
                    'message' => 'Unauthorized'
                ], 403);
            }
            $comment->delete();
            return response()->json([
                'message' => 'Comment deleted successfully'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error deleting comment',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}