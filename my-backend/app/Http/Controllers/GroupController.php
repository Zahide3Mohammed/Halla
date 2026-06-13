<?php

namespace App\Http\Controllers;

use App\Models\Group;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use App\Events\GroupCreated;

class GroupController extends Controller
{
    public function index()
    {
    return Group::with('creator')->withCount('users')->get();
    }
  public function store(Request $request)
{
    $request->validate([
        'name' => 'required|string|max:100',
        'type_group' => 'required|in:Même color,color different',
        'lieu_event' => 'required|string|max:255',
        'latitude' => 'required|numeric', 
        'longitude' => 'required|numeric',
        'start_date' => 'required|date',
        'start_time' => 'required',
        'end_time' => 'required',
        'nationality_type' => 'required|in:same,different',
        'suggestion' => 'nullable|string',
        'image_event' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:10048',
    ]);

    $today = now()->toDateString();
    $exist = Group::where('creator_id', auth()->id())
                  ->whereDate('created_at', $today)
                  ->where('name', 'NOT LIKE', 'Salon %')
                  ->first();
    if ($exist) {
        return response()->json(["message" => "لقد قمت بإنشاء مجموعة بالفعل اليوم"], 400);
    }
    $data = $request->all(); 
    $data['creator_id'] = auth()->id();

    if ($request->hasFile('image_event')) {
        $path = $request->file('image_event')->store('groups_images', 'public');
        $data['image_event'] = $path;
    }
    $group = Group::create($data); 
    $group->users()->attach(auth()->id());
    broadcast(new \App\Events\GroupCreated($group->load('creator')->loadCount('users')))->toOthers();
    return response()->json([
        "message" => "تم إنشاء المجموعة بنجاح",
        "group" => $group
    ], 201);
}
//==============================================================================
    public function join($id)
    {
        $group = Group::with('creator')->findOrFail($id);
        $user = auth()->user(); 
        if ($group->users()->count() >= 5) {
            return response()->json(["message" => "المجموعة ممتلئة"], 400);
        }
        if ($group->users()->where('user_id', $user->id)->exists()) {
            return response()->json(["message" => "أنت عضو بالفعل في هذه المجموعة"], 400);
        }
        $creatorColor = $group->creator->color; 
        $userColor = $user->color;            

        if ($group->type_group === 'Même color') {
            if ($userColor !== $creatorColor) {
                return response()->json([
                    "message" => "عذراً، هذه المجموعة مخصصة لأصحاب اللون $creatorColor فقط"
                ], 403);
            }
        } elseif ($group->type_group === 'color different') {
            if ($userColor === $creatorColor) {
                return response()->json([
                    "message" => "عذراً، هذه المجموعة مخصصة لأشخاص بألوان مختلفة عن لونك"
                ], 403);
            }
        }
        $group->users()->attach($user->id);
        $group->loadCount('users');
            $group->load('creator'); 
        broadcast(new \App\Events\GroupCreated($group));

            return response()->json([
                "message" => "تم الانضمام بنجاح",
                "group" => $group 
            ]);    
    }
   public function getMyGroups() {
    $user = auth()->user();
        $groups = $user->groups()
                   ->withCount('users')
                   ->with('users:id,nom,prenom,photo') 
                   ->get()
                   ->filter(function($group) {
                       return $group->users_count == 5;
                   })->values(); 

    return response()->json($groups);
}
// parte  Rejoignez un groupe aléatoire
public function joinRandomOrCreate()
{
    $user = auth()->user();
    $today = now()->toDateString();
    $userColor = $user->color;

    if (!$userColor) {
        return response()->json(["message" => "يرجى تحديد لون شخصيتك أولاً"], 400);
    }

    // 1. البحث عن صالون متاح
    $group = Group::where('name', 'LIKE', 'Salon %')
        ->where('type_group', 'Même color')
        ->whereDate('created_at', $today)
        ->whereHas('creator', function($q) use ($userColor) {
            $q->where('color', $userColor);
        })
        ->withCount('users')
        ->having('users_count', '<', 5)
        ->first();

    if ($group) {
        // إذا وجدناه، نتحقق من العضوية
        if (!$group->users()->where('user_id', $user->id)->exists()) {
            $group->users()->attach($user->id);
        }
    } else {
    $group = Group::create([
        'name' => "Salon " . ucfirst($userColor),
        'type_group' => 'Même color',
        'creator_id' => $user->id,
        'start_date' => $today,
        'start_time' => now()->format('H:i'),
        'end_time' => now()->addHours(2)->format('H:i'),
        'lieu_event' => 'Fès (Online)', // مثلا
        'latitude' => 34.0331,  // زيد قيمة افتراضية للصالونات
        'longitude' => -5.0003, // باش يبانو ف الخريطة
        'nationality_type' => 'same',
        'suggestion' => 'Recherche automatique : Amusez-vous !',
    ]);
    $group->users()->attach($user->id);
}

    // 🔥 التعديل الضروري 1: إعادة تحميل الحساب والبيانات قبل الإرسال
    $group->load('creator');
    $group->loadCount('users'); // هادي هي اللي كتخلي React يشوف 1/5، 2/5 إلخ

    // 🔥 التعديل الضروري 2: إرسال الحدث
    // استعمل broadcast()->toOthers() باش التحديث يوصل لكلشي
broadcast(new \App\Events\GroupCreated($group));

    return response()->json([
        "message" => "تم الانضمام للصالون",
        "group" => $group // دابا الجروب غادي يمشي بـ users_count صحيح لـ React
    ]);
}
public function getPendingGroup()
{
    $user = auth()->user();

    $group = $user->groups()
        ->where('name', 'like', 'Salon%')
        ->withCount('users')
        ->latest()
        ->first();

    return response()->json([
        'group' => $group
    ]);
}

public function myCurrentSalon(Request $request)
{
    try {
        $user = $request->user();

        $group = $user->groups()
            ->withCount('users')           // ✅ هاد السطر ضروري أولاً
            ->having('users_count', '<', 5) // ✅ دابا يخدم
            ->latest()
            ->first();

        return response()->json(['group' => $group]);

    } catch (\Exception $e) {
        return response()->json(['error' => $e->getMessage()], 500);
    }
}
}