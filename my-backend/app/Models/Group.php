<?php


namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Group extends Model
{

    protected $fillable = [
    "name",
    "type_group",
    "start_date",
    "start_time",
    "end_time",
    "suggestion",
    "nationality_type",
    "creator_id",
    "lieu_event",   // ضروري تزيد هادي
    "image_event"   // و هادي
];
    public function users(){

        return $this->belongsToMany(User::class);

    }
    public function creator(){
    return $this->belongsTo(User::class,'creator_id');
}
public function messages() {
    return $this->hasMany(Message::class);
}

}