<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{

  public function up()
{
    Schema::create('messages', function (Blueprint $table) {
        $table->id();
        $table->foreignId('user_id')->constrained()->onDelete('cascade');
        $table->foreignId('group_id')->constrained()->onDelete('cascade');
        
        // 'text' للميساجات العادية و 'image' للصور
        $table->string('type')->default('text'); 
        
        // الحقل اللي فيه النص أو الـ Emojis
        $table->text('content')->nullable(); 
        
        // الحقل اللي فيه رابط الصورة في storage
        $table->string('file_path')->nullable(); 
        
        $table->timestamps();
    });
}
    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('messages');
    }
};
