<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;

class RealTimeNotification extends Notification
{
    use Queueable;

    public $message;

    public function __construct($message)
    {
        $this->message = $message;
    }

    // 1. Sifetha f l-Database w f Broadcast (Websocket)
    public function via($notifiable): array
    {
        return ['database', 'broadcast'];
    }

    // 2. Chnu ghat-khzen f Database
    public function toArray($notifiable): array
    {
        return [
            'message' => $this->message,
        ];
    }

    public function toBroadcast($notifiable): BroadcastMessage
    {
        return new BroadcastMessage([
            'message' => $this->message,
            'user_id' => $notifiable->id,
        ]);
    }
}