<?php

namespace App\Events;

use App\Models\Group;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast; // ضروري تزيد هادي
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class GroupCreated implements ShouldBroadcast // تأكد من وجود Implements هنا
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $group;

    public function __construct(Group $group)
    {
        // هنا كنحملو البيانات اللي باغي يصيفطها السيرفر لـ React
        // جيب الـ creator والـ users_count باش الـ Card تبان كاملة
        $this->group = $group->load('creator')->loadCount('users');
    }

    /**
     * القناة اللي غادي يتسمع ليها كاع الناس (Public)
     */
    public function broadcastOn(): array
    {
        return [
            new Channel('groups-channel'),
        ];
    }

    /**
     * الاسم اللي غادي يتعرف عليه React (اختياري ولكن كينظم الخدمة)
     */
    public function broadcastAs(): string
    {
        return 'group.added';
    }
}