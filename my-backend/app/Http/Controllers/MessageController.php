<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Message;

class MessageController extends Controller
{
    public function fetchMessages($groupId) {
        // تأكد أن الموديل Message خدام
        return Message::where('group_id', $groupId)
                      ->with('user:id,prenom,photo')
                      ->oldest()
                      ->get();
    }

public function store(Request $request, $groupId) {
    $request->validate([
        'message' => 'nullable|string',
        'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
    ]);

    $message = new Message();
    $message->user_id = auth()->id();
    $message->group_id = $groupId;

    if ($request->hasFile('image')) {
        $path = $request->file('image')->store('chat_images', 'public');
        $message->file_path = $path;
        $message->type = 'image';
        $message->content = $request->message; // يقدر يصيفط نص مع الصورة
    } else {
        $message->content = $request->message; // Emojis كيتسيفاو هنا عادي
        $message->type = 'text';
    }

    $message->save();
    $message->load('user');

    broadcast(new \App\Events\MessageSent($message))->toOthers();

    return $message;
}
}
