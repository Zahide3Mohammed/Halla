<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class AiController extends Controller
{
public function suggest(Request $request)
{
    try {
        $userMessage = $request->input('message');
        
        // جيبها من الـ .env باش يكون داكشي نقي
        $apiKey = env('GEMINI_API_KEY', 'AIzaSyDFTqpuqpW2z3IknYm1d3gj4yzHgiJ-n-8'); 

        if (!$userMessage) {
            return response()->json(['reply' => 'الميساج خاوي'], 400);
        }

        // استعمل هاد الـ URL بالضبط
        $url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" . $apiKey;

        $response = Http::withOptions([
            'verify' => false, // حيت خدام في localhost
            'timeout' => 30
        ])->post($url, [
            "contents" => [
                [
                    "parts" => [
                        ["text" => $userMessage]
                    ]
                ]
            ]
        ]);

        if ($response->failed()) {
            $error = $response->json();
            return response()->json([
                'reply' => 'Google Error: ' . ($error['error']['message'] ?? 'Unknown error')
            ], $response->status());
        }

        $data = $response->json();
        
        // تأكد من وجود الـ path الصحيح في الـ JSON
        if (isset($data['candidates'][0]['content']['parts'][0]['text'])) {
            $reply = $data['candidates'][0]['content']['parts'][0]['text'];
            return response()->json(['reply' => $reply]);
        }

        return response()->json(['reply' => 'Google didn\'t return text. Check safety settings.'], 500);

    } catch (\Exception $e) {
        return response()->json(['reply' => 'Laravel Error: ' . $e->getMessage()], 500);
    }
}
}