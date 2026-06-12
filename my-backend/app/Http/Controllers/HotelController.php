<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class HotelController extends Controller
{
    public function getRecommendations(Request $request)
    {
        // 1. Validation باش نتأكدو أن الـ Input واصل مقاد
        $validated = $request->validate([
            'city' => 'nullable|string',
            'budget' => 'nullable|numeric',
            'stars' => 'nullable|string',
            'type' => 'nullable|string',
            'amenities' => 'array'
        ]);

        // 2. تجهيز البيانات مع قيم افتراضية (Default values)
        $dataToSend = [
            'city'      => $request->input('city', 'Fes'),
            'budget'    => (float) $request->input('budget', 500),
            'stars'     => $request->input('stars', '4 Stars'),
            'type'      => $request->input('type', 'Riad'),
            'devise'    => 'MAD',
            'amenities' => $request->input('amenities', [])
        ];

        try {
            // 3. الطلب ديال الـ AI (Flask Server)
            $response = Http::timeout(10) // زدنا Timeout باش ما يبقاش الـ سيرفر معلق
                            ->post('http://127.0.0.1:5000/predict', $dataToSend);
            
            if ($response->successful()) {
                $data = $response->json();
                
                if (isset($data['hotel'])) {
                    return response()->json([
                        'success' => true,
                        'ai_data' => $data['hotel']
                    ]);
                }
            }

            return response()->json([
                'success' => false, 
                'message' => 'AI Server Error: ' . $response->body()
            ], 500);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false, 
                'message' => 'Laravel Connection Error: ' . $e->getMessage()
            ], 500);
        }
    }
}