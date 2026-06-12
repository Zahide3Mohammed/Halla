<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Post;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;

class ExampleTest extends TestCase
{
    use RefreshDatabase; 
    public function test_user_can_login() {
        $user = User::factory()->create(['email' => 'test@example.com', 'password' => bcrypt('password123')]);
        $response = $this->post('/api/login', [
            'email' => 'test@example.com', 
            'password' => 'password123'
        ]);
        $response->assertStatus(200);
    }

    public function test_ai_can_suggest_trip() {
        $user = User::factory()->create();
        $this->actingAs($user);
        $response = $this->post('/api/ai/suggest', ['message' => 'Voyage à Fès']);
        $response->assertStatus(200);
    }

}