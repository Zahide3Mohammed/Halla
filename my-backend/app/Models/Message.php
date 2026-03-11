<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Message extends Model
{
    protected $fillable = ['user_id', 'group_id', 'type','content','file_path'];

public function user() {
    return $this->belongsTo(User::class);
}

public function group() {
    return $this->belongsTo(Group::class);
}
}
