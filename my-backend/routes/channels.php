<?php

use Illuminate\Support\Facades\Broadcast;

// routes/channels.php
Broadcast::channel('chat.{groupId}', function ($user, $groupId) {
    // كدير true للتجربة فقط، باش أي واحد يقدر يدخل
    return true; 
});