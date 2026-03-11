<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * تشغيل التهجير (Migration).
     */
    public function up(): void
    {
        Schema::create('groups', function (Blueprint $table) {
            $table->id();
            $table->string('name'); 
            
      
            $table->string('lieu_event'); 
            $table->string('image_event')->nullable(); 
            
            // تصحيح الخطأ: يجب إضافة المصفوفة كبارامتر ثاني
            $table->string('type_group');
            
            $table->date('start_date');
            $table->time('start_time');
            $table->time('end_time');
            
            // ملاحظة: الحقل text لا يأخذ طولاً محددًا مثل string(100) في Laravel التقليدي
            $table->text('suggestion')->nullable(); 
            
            // تصحيح الخطأ هنا أيضاً
            $table->enum('nationality_type', ['same', 'different']);
            
            $table->foreignId('creator_id')->constrained('users')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * التراجع عن التهجير.
     */
    public function down(): void
    {
        Schema::dropIfExists('groups');
    }
};