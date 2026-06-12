<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        $notifications = Notification::with('sender:id,nom,prenom,photo') 
            ->where('receiver_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($notifications);
    }
    public function markAsRead(Request $request)
    {
        Notification::where('receiver_id', $request->user()->id)
            ->where('is_read', 0) 
            ->update(['is_read' => 1]); 

        return response()->json(['message' => 'All marked as read']);
    }

    public function markAsReadone($id)
    {
        $currentUserId = Auth::id();
        $notification = Notification::where('id', $id)
            ->where('receiver_id', $currentUserId)
            ->first();

        if ($notification) {
            $notification->update(['is_read' => 1]);
            
            return response()->json(['message' => 'Notification marked as read']);
        }

        return response()->json(['message' => 'Notification not found'], 404);
    }
//============================================================================
    public function destroy($id)
{
    $notification = Notification::where('id', $id)
        ->where('receiver_id', auth()->id())
        ->first();

    if ($notification) {
        $notification->delete(); 
        
        return response()->json(['message' => 'Notification supprimée.']);
    }

    return response()->json(['message' => 'Non trouvé.'], 404);
}
}