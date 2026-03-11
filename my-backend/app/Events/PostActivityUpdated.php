<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class PostActivityUpdated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $postId;
public $likesCount;
public $commentsCount;
public $newComment; // نزيدو هاد المتغير

public function __construct($postId, $likesCount, $commentsCount, $newComment = null)
{
    $this->postId = $postId;
    $this->likesCount = $likesCount;
    $this->commentsCount = $commentsCount;
    $this->newComment = $newComment;
}

    public function broadcastOn()
    {
        // قناة خاصة بكل منشور بوحدو
        return new Channel('post.' . $this->postId);
    }

    public function broadcastAs()
    {
        return 'activity.updated';
    }
}