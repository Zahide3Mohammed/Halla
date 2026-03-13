<?php
namespace App\Events;

use App\Models\PostComment;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow; // استعمل Now لسرعة أكبر
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class CommentCreated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $comment;

    public function __construct(PostComment $comment)
    {
        $this->comment = $comment;
    }

    public function broadcastOn()
    {
        // كنصيفطوه في قناة عامة للبوستات
        return new Channel('posts');
    }

    public function broadcastAs()
    {
        return 'CommentCreated';
    }
}