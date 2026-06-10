<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class HotelController extends Controller
{
   public function getRecommendations(Request $request)
{
    // جلب البيانات ديريكت من الـ Request مع وضع قيم احتياطية فقط إيلا كان الـ Input خاوي بمرة
    $city = $request->input('city', 'Fes');
    $budget = $request->input('budget', 500);
    $stars = $request->input('stars', '4 Stars');
    $type = $request->input('type', 'Riad'); // هادي مهمة بزاف حيت زدناها ف الـ React
    $amenities = $request->input('amenities', []);

    // بناء الـ Payload لي غايمشي للفلاسک متناسق 100%
  $dataToSend = [
    'city' => $city,
    'budget' => (float) $budget,
    'stars' => $stars, // مثلاً "4 Stars"
    'type' => $type,
    'devise' => 'MAD', // ضروري نزيدوها باش ما يوقعش خطأ فـ Flask
    'amenities' => $amenities
];

    try {
        // إرسال الطلب لسيرفر الفلاسک
        $response = Http::withHeaders([
            'Content-Type' => 'application/json',
        ])->post('http://127.0.0.1:5000/predict', $dataToSend);
        
        if ($response->successful()) {
            $data = $response->json();
            if (isset($data['hotel'])) {
                return response()->json([
                    'success' => true,
                    'message' => '✅ الـ AI شغال وبيرفكت! هاهي النتيجة الحقيقية:',
                    'ai_data' => $data['hotel']
                ]);
            }
        }
        
        return response()->json([
            'success' => false, 
            'message' => 'AI Server did not return hotel data. Response: ' . $response->body()
        ], 500);

    } catch (\Exception $e) {
        return response()->json([
            'success' => false, 
            'message' => 'Laravel Error: ' . $e->getMessage()
        ], 500);
    }
}
}