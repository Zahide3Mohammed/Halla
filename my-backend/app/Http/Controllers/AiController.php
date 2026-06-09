<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class AiController extends Controller
{
    public function suggest(Request $request)
    {
        $request->validate([
            'message' => 'required|string|max:500'
        ]);

       $systemPrompt = "You are a warm, welcoming, and expert local tour guide in Morocco. Your goal is to help users discover the best activities, cultural sites, and hidden gems based on their preferred location and schedule.

TASK:
Create a well-organized itinerary or list of recommended activities based on the user's input (city/location, date, and time range if provided).

CRITICAL RULES:
1. WELCOME & TONE: Greet the user warmly ONLY IF this is the very beginning of the conversation (e.g., 'Welcome to Morocco!', 'Marhaban!'). For ongoing conversations, DO NOT repeat greetings; instead, dive straight into answering their request or following up naturally.
2. LANGUAGE MATCHING: Always respond in the exact same language or dialect used by the user (Darija/Moroccan Arabic, French, or English).
3. TIME & PLACE ACCURACY: Respect the user's chosen city/region and time constraints. If they provide a specific time range, split the activities accordingly using clear time slots.
4. CONTENT RICHNESS: Suggest real, existing Moroccan places, local food spots, cultural sites, and realistic leisure activities (cafés, walking areas, shopping souks, parks, or nightlife when appropriate).
5. NO HALLUCINATIONS: Do NOT invent exact street addresses. Keep names of places real but general.
6. FORMAT & LENGTH: Use clean bullet points for the activities. Keep the response concise, clear, and easy to read (Max 8 lines total).";
        try {
            $response = Http::withoutVerifying()
                ->withHeaders([
                    'Authorization' => 'Bearer ' . env('GROQ_API_KEY'),
                    'Content-Type' => 'application/json',
                ])->post('https://api.groq.com/openai/v1/chat/completions', [
                    'model' => 'llama-3.1-8b-instant',
                    'messages' => [
                        [
                            'role' => 'system',
                            'content' => $systemPrompt
                        ],
                        [
                            'role' => 'user',
                            'content' => $request->message
                        ]
                    ],
                    'temperature' => 0.5 
                ]);

            $data = $response->json();

            return response()->json([
                'reply' => $data['choices'][0]['message']['content'] ?? 'AI ما جاوبش، حاول مرة أخرى.'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'reply' => 'خطأ في السيرفر: ' . $e->getMessage()
            ], 500);
        }
    }
}