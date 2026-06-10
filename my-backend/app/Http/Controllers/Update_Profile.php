<?php

namespace App\Http\Controllers;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class Update_Profile extends Controller
{
    public function updatePhoto(Request $request)
    {
        $request->validate([
            'photo' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048', // max 2MB
        ]);
        $user = Auth::user();
        if ($user->photo) {
            Storage::disk('public')->delete($user->photo);
        }
        if ($request->hasFile('photo')) {
            $path = $request->file('photo')->store('photos', 'public');
            $user->update([
                'photo' => $path
            ]);
            return response()->json([
                'message' => 'Photo mise à jour avec succès',
                'path' => $path 
            ], 200);
        }
        return response()->json(['message' => 'Erreur lors de l\'upload'], 400);
    }
}
