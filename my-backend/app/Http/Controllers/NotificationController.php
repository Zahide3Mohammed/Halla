<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    // 1. Jib notifications
    public function index(Request $request)
    {
        $notifications = Notification::with('sender:id,nom,prenom,photo') // Jib m3ahom chkoun sifethom
            ->where('receiver_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($notifications);
    }

    // 2. Mark as read
    public function markAsRead(Request $request)
    {
        Notification::where('receiver_id', $request->user()->id)
            ->where('is_read', false)
            ->update(['is_read' => true]);

        return response()->json(['message' => 'All marked as read']);
    }
    public function markAsReadone($id)
    {
        // Kanchoufo l-notification li 3ndha dak l-id W khassa b had l-user nite
        $notification = auth()->user()->notifications()->where('id', $id)->first();

        if ($notification) {
            $notification->markAsRead(); // Hadi kat-setty 'read_at' l-wa9t dyal daba
            return response()->json(['message' => 'Notification marked as read']);
        }

        return response()->json(['message' => 'Notification not found'], 404);
    }
}
