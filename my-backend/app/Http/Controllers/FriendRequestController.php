<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use App\Events\NotificationSent;
use App\Models\Notification;
use App\Models\FriendRequest;

class FriendRequestController extends Controller
{
    public function sendRequest(Request $request, $id)
    {
        $senderId = auth()->id();
        $receiverId = $id;
        $receiver = User::find($receiverId);
        if (!$receiver) {
            return response()->json(['message' => 'User introuvable'], 404);
        }
        if ($senderId == $receiverId) {
            return response()->json(['message' => 'Action impossible'], 400);
        }
        $exists = FriendRequest::where('sender_id', $senderId)
                               ->where('receiver_id', $receiverId)
                               ->first();

        if ($exists) {
            return response()->json(['message' => 'Demande déjà envoyée'], 400);
        }
        FriendRequest::create([
            'sender_id' => $senderId,
            'receiver_id' => $receiverId,
            'status' => 'pending' 
        ]);
        return response()->json([
            'status' => 'success',
            'message' => 'Demande envoyée avec succès'
        ], 200);
    }
//===============================================================================
    public function follow($id)
    {
        $senderId = Auth::id(); 
        $receiverId = $id;    

        if ($senderId == $receiverId) {
            return response()->json(['error' => 'Self-following is not allowed.'], 422); 
        }

        // 1. Check matching: wech déjà sffti lih d-demande pending f database
        $existingRequest = DB::table('friend_requests')
            ->where('sender_id', $senderId)
            ->where('receiver_id', $receiverId)
            ->first();

        if ($existingRequest) {
            if ($existingRequest->status === 'pending') {
                // Toggle/Annuler
                DB::table('friend_requests')
                    ->where('sender_id', $senderId)
                    ->where('receiver_id', $receiverId)
                    ->delete();

                // N-7iydo notification linked
                Notification::where('receiver_id', $receiverId)
                            ->where('sender_id', $senderId)
                            ->where('type', 'friend_request')
                            ->delete();

                return response()->json(['status' => 'cancelled', 'message' => 'Demande annulée.'], 200);
            }

            return response()->json(['status' => 'exists', 'message' => 'Déjà suivi.'], 200);
        }

        // 2. INSERTION FRIEND REQUEST
        DB::table('friend_requests')->insert([
            'sender_id'   => $senderId,
            'receiver_id' => $receiverId,
            'status'      => 'pending',
            'created_at'  => now(),
            'updated_at'  => now()
        ]);

        // 3. 🚀 NOTIFICATION INSERTION (Daba b Eloquent Model safe mn TypeError!)
        $newNotif = Notification::create([
            'receiver_id' => $receiverId,
            'sender_id'   => $senderId,
            'type'        => 'friend_request',
            'post_id'     => null,
            'is_read'     => 0
        ]);

        // Eager load dynamic structural properties dyal l-sender bach React y-loadi photo/nom
        $newNotif->load('sender:id,nom,prenom,photo');

        // 🔥 DISPATCH DIAL EVENT REAL-TIME: Daba passes object exact 100% pixel-perfect!
        event(new \App\Events\NotificationSent($newNotif));

        return response()->json(['status' => 'success', 'message' => 'Demande envoyée avec notification.'], 200);
    }
//============================================================================
public function accept($senderId)
{
    $receiverId = Auth::id();

    // 1. N-verifyiw wech kayna demande pending
    $request = DB::table('friend_requests')
        ->where('sender_id', $senderId)
        ->where('receiver_id', $receiverId)
        ->where('status', 'pending')
        ->first();

    if (!$request) {
        return response()->json(['error' => 'Demande non trouvée.'], 404);
    }

    // 2. 🚀 INSERTION F TABLE FRIENDS (Matching l-columns li 3ndek: user_id, friend_id)
    DB::table('friends')->insert([
        'user_id'    => $senderId,   // L-user li ssifet l-demande
        'friend_id'  => $receiverId, // Nta (l-user li accepta)
        'status'     => 'active',    // bghiti t-zidi status active (optional)
        'created_at' => now(),
        'updated_at' => now()
    ]);

    // 3. Update status d-demande l 'accepted'
    DB::table('friend_requests')
        ->where('sender_id', $senderId)
        ->where('receiver_id', $receiverId)
        ->update(['status' => 'accepted']);

    // 4. Update notification (Rjje3ha is_read = 1)
    DB::table('notifications')
        ->where('sender_id', $senderId)
        ->where('receiver_id', $receiverId)
        ->where('type', 'friend_request')
        ->update(['is_read' => 1]);

    return response()->json(['status' => 'success', 'message' => 'Demande acceptée avec succès.']);
}
//============================
// Zid hada f FriendRequestController.php
public function acceptFriendRequest(Request $request)
{
    // l-input li kaysifet l-front-end huwa sender_id
    $senderId = $request->input('sender_id');
    return $this->accept($senderId); // 3yyti l-fonction accept() li swebna 9bel
}
}