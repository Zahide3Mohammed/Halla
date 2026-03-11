<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    protected $fillable = ['receiver_id', 'sender_id', 'type', 'post_id', 'is_read'];

    public function sender() {
        return $this->belongsTo(User::class, 'sender_id');
    }
}