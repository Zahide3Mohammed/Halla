<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('hotels', function (Blueprint $table) {
    $table->id();
    // مول الأوتيل
    $table->string('email');
    $table->string('password');
    $table->string('city');
    $table->decimal('price', 10, 2);
    $table->string('type'); // Riad, Hôtel, etc.
    $table->text('description')->nullable();
    $table->string('image_url')->nullable();
    $table->boolean('is_paid')->default(false); // واش خلص؟
    $table->timestamps();
});
    }

    
    public function down(): void
    {
        Schema::dropIfExists('hotels');
    }
};
