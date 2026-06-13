<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Stripe\Stripe;
use Stripe\PaymentIntent;

class PaymentController extends Controller
{
    public function createPaymentIntent(Request $request)
    {
        Stripe::setApiKey(config('services.stripe.secret'));
        $request->validate([
            'amount' => 'required|integer|min:50', 
        ]);
        try {
            $paymentIntent = PaymentIntent::create([
                'amount' => $request->amount, 
                'currency' => 'usd', 
                'automatic_payment_methods' => [
                    'enabled' => true,
                ],
            ]);
            return response()->json([
                'clientSecret' => $paymentIntent->client_secret,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => $e->getMessage()
            ], 500);
        }
    }
//==========================================================
    public function createCheckoutSession(Request $request)
    {
        \Stripe\Stripe::setApiKey(config('services.stripe.secret'));
         \Stripe\Stripe::setVerifySslCerts(false);
        $price = 0 ;
        switch ($request->plan) {
            case 'Pro': $price = 1000; break;
            case 'Enterprise':   $price = 5000; break;
            default:      $price = 0; break;
        }
        $session = \Stripe\Checkout\Session::create([
            'payment_method_types' => ['card'],
            'line_items' => [[
                'price_data' => [
                    'currency' => 'usd',
                    'product_data' => ['name' => $request->plan . ' Plan'],
                    'unit_amount' => $price,
                ],
                'quantity' => 1,
            ]],
            'mode' => 'payment',
            'success_url' => 'http://localhost:5173/success', 
            'cancel_url' => 'http://localhost:5173/cancel',   
        ]);

        return response()->json(['url' => $session->url]);
    }
}