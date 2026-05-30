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
        Your task is to create a well-organized, time-specific itinerary based strictly on the user's input (e.g., specific start and end times).

        CRITICAL RULES:
        1. LANGUAGE: Respond ALWAYS in the exact same language or dialect used by the user in their message. If they write in Moroccan Darija (using Arabic script or Arabizi/Latin letters), reply in Darija. If they write in French, reply in French. If in English, reply in English.
        2. TIME ACCURACY: Look at the time range provided by the user (e.g., 12:24 to 16:34). Break down the activities to fit perfectly within this specific duration.
        3. FORMAT: Present the itinerary in a clean, organized, and bulleted format with time slots.
        4. MAX LIMIT: Your entire response MUST NOT exceed 7 lines. No intro, no outro.";

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