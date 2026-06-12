<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Hotel extends Model
{
    protected $fillable = [
        'email', 'password', 'name', 'city', 'price', 
        'type', 'description', 'image_url', 'is_paid'
    ];
}
