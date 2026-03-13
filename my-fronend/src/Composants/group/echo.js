import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

// src/Composants/group/echo.js
const echo = new Echo({
    broadcaster: 'reverb',
    key: 'hallamaghrebkey', // كتبها يدوياً هنا للتأكد
    wsHost: '127.0.0.1',
    wsPort: 8080,
    forceTLS: false,
    enabledTransports: ['ws'],
    authEndpoint: 'http://localhost:8000/api/broadcasting/auth',
    auth: {
      headers: {
            Authorization: `Bearer ${sessionStorage.getItem('token')}`, // تأكد أن التوكن كاين هنا
        },
    },
});

export default echo;