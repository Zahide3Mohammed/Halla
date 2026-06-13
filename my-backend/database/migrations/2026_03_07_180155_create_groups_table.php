<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{

    public function up(): void
    {
        Schema::create('groups', function (Blueprint $table) {
            $table->id();
            $table->string('name'); 
            $table->string('lieu_event'); 
            $table->string('image_event')->nullable(); 
            $table->string('type_group');
            $table->date('start_date');
            $table->time('start_time');
            $table->time('end_time');
            $table->text('suggestion')->nullable(); 
            $table->enum('nationality_type', ['same', 'different']);
            $table->foreignId('creator_id')->constrained('users')->onDelete('cascade');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('groups');
    }
};