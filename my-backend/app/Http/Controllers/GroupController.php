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
       
        // كنقولو ليه جيب المجموعات مع المنشئ ديالهم وعدد المستخدمين
    return Group::with('creator')->withCount('users')->get();
    }
   public function store(Request $request)
{
    $request->validate([
        'name' => 'required|string|max:100',
        'type_group' => 'required|in:Même color,color different',
        'lieu_event' => 'required|string|max:255',
        'start_date' => 'required|date',
        'start_time' => 'required',
        'end_time' => 'required',
        'nationality_type' => 'required|in:same,different',
        'suggestion' => 'nullable|string',
        'image_event' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
    ]);

    $today = now()->toDateString();
    
    $exist = Group::where('creator_id', auth()->id())
                  ->whereDate('created_at', $today)
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

    // 🔥 السطر السحري: إرسال الحدث لكل المستخدمين
    // استعملنا load و loadCount باش البيانات تمشي كاملة للـ React
    broadcast(new \App\Events\GroupCreated($group->load('creator')->loadCount('users')))->toOthers();

    return response()->json([
        "message" => "تم إنشاء المجموعة بنجاح",
        "group" => $group
    ], 201);
}
    public function join($id)
    {
        // جلب المجموعة مع بيانات المنشئ للتحقق من اللون
        $group = Group::with('creator')->findOrFail($id);
        $user = auth()->user(); 

        // 1. التحقق من السعة (الحد الأقصى 5 أشخاص)
        if ($group->users()->count() >= 5) {
            return response()->json(["message" => "المجموعة ممتلئة"], 400);
        }

        // 2. التحقق من عدم التكرار
        if ($group->users()->where('user_id', $user->id)->exists()) {
            return response()->json(["message" => "أنت عضو بالفعل في هذه المجموعة"], 400);
        }

        // 3. منطق فحص لون الشخصية (Personality Color)
        $creatorColor = $group->creator->color; // لون الشخص الذي أنشأ المجموعة
        $userColor = $user->color;             // لون الشخص الذي يريد الانضمام الآن

        if ($group->type_group === 'Même color') {
            // شرط: يجب أن يكون اللون متطابقاً
            if ($userColor !== $creatorColor) {
                return response()->json([
                    "message" => "عذراً، هذه المجموعة مخصصة لأصحاب اللون $creatorColor فقط"
                ], 403);
            }
        } elseif ($group->type_group === 'color different') {
            // شرط: يجب أن يكون اللون مختلفاً عن لون المنشئ
            if ($userColor === $creatorColor) {
                return response()->json([
                    "message" => "عذراً، هذه المجموعة مخصصة لأشخاص بألوان مختلفة عن لونك"
                ], 403);
            }
        }

        // 4. إتمام عملية الانضمام بنجاح
        $group->users()->attach($user->id);

        return response()->json(["message" => "تم الانضمام بنجاح"]);
    }
   public function getMyGroups() {
    $user = auth()->user();
    
    // كنجيبو المجموعات اللي اليوزر عضو فيها
    $groups = $user->groups()
                   ->withCount('users')
                   ->with('users:id,nom,prenom,photo') // 🔥 هادي ضرورية باش يبانو الأعضاء في React
                   ->get()
                   ->filter(function($group) {
                       // كنخليو غير المجموعات اللي مكمولة (5 أعضاء)
                       return $group->users_count == 5;
                   })->values(); // values() باش نعاودو نرتبو الـ Array

    return response()->json($groups);
}


public function getPendingGroup()
{
    $user = auth()->user();
    
    // كنقلبو على كروب مديور اليوم، نوعو نفس اللون، وفيه قل من 5، ومولاه عندو نفس لون المستخدم
    $group = Group::withCount('users')
        ->where('type_group', 'Même color')
        ->whereDate('created_at', now()->toDateString())
        ->whereHas('creator', function($q) use ($user) {
            $q->where('color', $user->color);
        })
        ->having('users_count', '<', 5)
        ->latest()
        ->first();

    return response()->json(['group' => $group]);
}

public function joinRandomOrCreate()
{
    $user = auth()->user();
    $today = now()->toDateString();

    $group = Group::withCount('users')
        ->where('type_group', 'Même color')
        ->whereDate('created_at', $today)
        ->whereHas('creator', function($q) use ($user) {
            $q->where('color', $user->color);
        })
        ->having('users_count', '<', 5)
        ->first();

    if ($group) {
        if (!$group->users()->where('user_id', $user->id)->exists()) {
            $group->users()->attach($user->id);
        }
    } else {
        $group = Group::create([
            'name' => "Salon " . ucfirst($user->color ?? 'Amis'),
            'type_group' => 'Même color',
            'creator_id' => $user->id,
            'start_date' => $today,
            'start_time' => now()->format('H:i'),
            'end_time' => now()->addHours(2)->format('H:i'),
            'lieu_event' => 'Online',
            'nationality_type' => 'same',
            'suggestion' => 'Faisons connaissance !'
        ]);
        $group->users()->attach($user->id);
    }

    broadcast(new \App\Events\GroupCreated($group->load('creator')->loadCount('users')))->toOthers();

    return response()->json(['group' => $group->loadCount('users')]);
}
}