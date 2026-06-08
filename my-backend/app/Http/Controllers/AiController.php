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

        // هاد الـ System Prompt كيزير الـ AI باش يتبع لغة المستخدم ويحترم الوقت
       $systemPrompt = "You are an expert tour guide in the cities of Morocco.

TASK:
Create a well-organized, time-specific itinerary based strictly on user's input (start/end times, city, date).

CRITICAL RULES:
1. LANGUAGE: Always respond in the same language/dialect used by the user (Darija, French, English).
2. TIME ACCURACY: Respect exactly the given time range and split activities accordingly.
3. FORMAT: Use clean bullet points with time slots (no intro, no outro).
4. MAX LIMIT: Do NOT exceed 7 lines total.
5. CONTENT: Include real Moroccan places, food spots, cultural sites, AND realistic activities people can actually do (e.g., cafés, walking spots, nightlife/clubs when relevant, shopping areas, parks, leisure activities). Base everything on the city if provided. Keep suggestions practical, accessible, and time-appropriate.
7. DO NOT hallucinate exact addresses; keep suggestions general but real.";

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
                    'temperature' => 0.5 // هبطنا الـ temperature لـ 0.5 باش يكون دقيق وميزيدش من راسه بزاف
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