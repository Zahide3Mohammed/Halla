<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class HotelController extends Controller
{
    public function getRecommendations(Request $request)
    {
        $validated = $request->validate([
            'city' => 'required|string',
            'budget' => 'required|numeric',
            'stars' => 'required|string',
            'amenities' => 'array'
        ]);

        try {
            $response = Http::post('http://127.0.0.1:5000/predict', $validated);
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
                'message' => 'AI Server did not return hotel data.'
            ], 500);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false, 
                'message' => 'Laravel Error: ' . $e->getMessage()
            ], 500);
        }
    }
}