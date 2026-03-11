<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;

class PostLiked extends Notification implements ShouldBroadcast
{
    use Queueable;
    public $sender;
    public $post;

    public function __construct($sender, $post)
    {
        $this->sender = $sender;
        $this->post = $post;
    }

    public function via($notifiable): array
    {
        return ['database', 'broadcast'];
    }

    public function toArray($notifiable): array
    {
        return [
            'sender_id' => $this->sender->id,
            'sender_nom' => $this->sender->nom,
            'post_id' => $this->post->id,
            'message' => 'liked your post',
            'type' => 'like'
        ];
    }

    public function toBroadcast($notifiable): BroadcastMessage
    {
        return new BroadcastMessage([
            'id' => $this->id,
            'type' => 'like',
            'sender' => [
                'id' => $this->sender->id,
                'nom' => $this->sender->nom,
                'prenom' => $this->sender->prenom,
                'photo' => $this->sender->photo,
            ],
            'post_id' => $this->post->id,
            'message' => 'liked your post',
            'created_at' => now()->toDateTimeString(),
        ]);
    }

    public function broadcastType()
    {
        return 'post.liked';
    }
}