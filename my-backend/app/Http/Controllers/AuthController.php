<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $request->validate([
            'nom' => 'required|string|max:255',
            'prenom' => 'required|string|max:255',
            'age' => 'required|date',
            'paye' => 'required|string|max:255',
            'sexe' => 'required|string|max:10',
            'role' => 'required|string|in:user,guide,cooperative', 
            'email' => 'required|email|unique:users,email',
            'tel' => 'required|string|max:20',
            'password' => 'required|string|min:6',
            'photo' => 'nullable|image|max:2048',
        ]);

        $user = new User();
        $user->nom = $request->nom;
        $user->prenom = $request->prenom;
        $user->age = $request->age;
        $user->paye = $request->paye;
        $user->sexe = $request->sexe;
        $user->role = $request->role; 
        $user->email = $request->email;
        $user->tel = $request->tel;
        $user->password = Hash::make($request->password);

        if ($request->hasFile('photo')) {
            $file = $request->file('photo');
            $filename = time().'_'.$file->getClientOriginalName();
            $file->storeAs('photos', $filename, 'public');
            $user->photo = 'photos/'.$filename;
        }
        $user->save();
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'User registered successfully',
            'user' => $user,
            'token' => $token
        ]);
    }

//--------------------------------------------------------------------------
    public function login(Request $request)
    {
        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Email or password invalid'], 401);
        }

        // Generate token
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Login successful',
            'user' => $user,
            'token' => $token
        ]);
    }
//================================================================
    public function checkEmail(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
        ]);
        $exists = User::where('email', $request->email)->exists();
        return response()->json([
            'exists' => $exists,
            'message' => $exists ? 'Email déjà utilisé' : 'Email disponible'
        ]);
    }
//===========================================================
    public function personalitytest(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'User not found'], 401);
        }
        $user->color = $request->color;
        if ($user->save()) {
            return response()->json([
                'status' => 'success',
                'message' => 'تم حفظ النتيجة بنجاح',
                'user' => $user,
                'token' => $request->bearerToken() 
            ], 200);
        }
        return response()->json(['message' => 'Error saving data'], 500);
    }
// controller changePassword
 public function changePassword(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'current_password' => 'required',
                'new_password' => ['required', 'min:8', 'regex:/[A-Z]/', 'regex:/[0-9]/', 'confirmed']
            ]);
            if ($validator->fails()) {
                return response()->json(['errors' => $validator->errors()], 422);
            }
            $user = $request->user();
            if (!Hash::check($request->current_password, $user->password)) {
                return response()->json(['message' => 'Le mot de passe actuel est incorrect'], 422);
            }
            $user->password = Hash::make($request->new_password);
            $user->save();
            return response()->json(['message' => 'Password changé avec succès']);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Server Error: ' . $e->getMessage()], 500);
        }
    }
//===================================================
    public function deleteAccount(Request $request)
    {
        $request->validate([
            'password' => 'required'
        ]);
        $user = $request->user();
        if (!Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'Password incorrect'
            ], 401);
        }
        if ($user->photo) {
            Storage::disk('public')->delete($user->photo);
        }
        $user->delete();
        return response()->json([
            'message' => 'Account deleted successfully'
        ]);
    }
//=============================================
    public function getProfile($id)
    {
        $user = User::find($id);
        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }
        return response()->json([
            'id' => $user->id,
            'nom' => $user->nom,
            'prenom' => $user->prenom,
            'photo' => $user->photo,
            'color' => $user->color,
            'role' => $user->role,
            'paye' => $user->paye,
            'age' => $user->age,   
        ]);
    }
//=====================================================================
    public function showProfile($id)
    {
        $currentUserId = auth('sanctum')->id() ?? auth()->id(); 
        $user = User::findOrFail($id);
        $isFriend = false;
        if ($currentUserId) {
            $isFriend = DB::table('friends')
                ->where(function($q) use ($currentUserId, $id) {
                    $q->where('user_id', $currentUserId)->where('friend_id', $id);
                })
                ->orWhere(function($q) use ($currentUserId, $id) {
                    $q->where('user_id', $id)->where('friend_id', $currentUserId);
                })
                ->exists();
        }

        if (empty($user->color) || $user->color === "No Color") {
            $user->color = 'purple';
        }
        $user->is_friend = $isFriend ? true : false;
        return response()->json($user);
    }
}