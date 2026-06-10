<?php
namespace App\Http\Controllers;

use App\Models\DirectMessage;
use App\Events\PrivateMessageSent;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class DirectMessageController extends Controller
{
    public function getHistory($friendId) {
        $userId = auth()->id();
        $messages = DirectMessage::where(function($q) use ($userId, $friendId) {
                $q->where('sender_id', $userId)->where('receiver_id', $friendId);
            })->orWhere(function($q) use ($userId, $friendId) {
                $q->where('sender_id', $friendId)->where('receiver_id', $userId);
            })
            ->with('sender:id,nom,prenom,photo,sexe')
            ->orderBy('created_at', 'asc')
            ->get();
        return response()->json($messages);
    }

    public function send(Request $request) {
        $request->validate([
            'receiver_id' => 'required|exists:users,id',
            'content' => 'required_without:file_path|string',
            'type' => 'required|string'
        ]);

        $msg = DirectMessage::create([
            'sender_id' => auth()->id(),
            'receiver_id' => $request->receiver_id,
            'type' => $request->type,
            'content' => $request->content,
            'file_path' => $request->file_path
        ]);

        broadcast(new PrivateMessageSent($msg->load('sender')))->toOthers();

        return response()->json($msg);
    }
//==================================================================================
    public function getFriends() {
        $userId = auth()->id();
        $friendIds = DB::table('friends')
            ->where('user_id', $userId)
            ->pluck('friend_id')
            ->merge(
                DB::table('friends')
                    ->where('friend_id', $userId)
                    ->pluck('user_id')
            )
            ->unique()
            ->toArray();

        if (empty($friendIds)) {
            return response()->json([]);
        }
        $latestMessages = DB::table('direct_messages')
            ->where(function($q) use ($userId) {
                $q->where('sender_id', $userId)->orWhere('receiver_id', $userId);
            })
            ->select(
                DB::raw('CASE WHEN sender_id = ' . $userId . ' THEN receiver_id ELSE sender_id END as contact_id'),
                DB::raw('MAX(created_at) as latest_time')
            )
            ->groupBy('contact_id')
            ->pluck('latest_time', 'contact_id')
            ->toArray();

        $friends = User::whereIn('id', $friendIds)->get();
        $sortedFriends = $friends->sortByDesc(function ($friend) use ($latestMessages) {
            return $latestMessages[$friend->id] ?? '0000-00-00 00:00:00';
        })->values(); 
        return response()->json($sortedFriends);
    }
//==========================================================================
    public function deleteDiscussion($friendId) {
    $userId = auth()->id();
    DB::table('direct_messages') 
        ->where(function($q) use ($userId, $friendId) {
            $q->where('sender_id', $userId)->where('receiver_id', $friendId);
        })
        ->orWhere(function($q) use ($userId, $friendId) {
            $q->where('sender_id', $friendId)->where('receiver_id', $userId);
        })
        ->delete();
    return response()->json(['message' => 'Discussion supprimée avec succès']);
}
//==================================================================
    public function addFriend(Request $request) {
        $currentUserId = auth()->id();
        $friendId = $request->input('friend_id');
        $exists = DB::table('friends')
            ->where('user_id', $currentUserId)
            ->where('friend_id', $friendId)
            ->exists();

        if (!$exists) {
            DB::table('friends')->insert([
                'user_id' => $currentUserId,
                'friend_id' => $friendId,
                'created_at' => now(),
                'updated_at' => now()
            ]);
        }

        return response()->json(['message' => 'Ami ajouté avec succès']);
    }
//=========================================================
    public function removeFriend($id) {
        $currentUserId = auth()->id();
        DB::table('friends')
            ->where(function($q) use ($currentUserId, $id) {
                $q->where('user_id', $currentUserId)->where('friend_id', $id);
            })
            ->orWhere(function($q) use ($currentUserId, $id) {
                $q->where('user_id', $id)->where('friend_id', $currentUserId);
            })
            ->delete();

        return response()->json(['message' => 'Ami retiré avec succès']);
    }
}