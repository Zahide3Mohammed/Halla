// src/Composants/group/echo.js
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

const echo = new Echo({
    broadcaster: 'reverb',
    key: 'hallamaghrebkey', 
    wsHost: '127.0.0.1',
    wsPort: 8080,
    forceTLS: false,
    enabledTransports: ['ws'],
    authEndpoint: 'http://localhost:8000/api/broadcasting/auth',
    auth: {
        headers: {
            // استخدام الـ get يضمن جلب التوكن الحقيقي والحديث عند إرسال الطلب
            get Authorization() {
                return `Bearer ${sessionStorage.getItem('token')}`;
            }
        },
    },
});

export default echo;