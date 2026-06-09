// src/Composants/group/echo.js
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

const echo = new Echo({
    broadcaster: 'reverb',
    key: 'hallamaghrebkey', 
    wsHost: window.location.hostname ,
    wsPort: 8080,
    forceTLS: false,
    enabledTransports: ['ws'],
    authEndpoint: '/broadcasting/auth',
    auth: {
        headers: {
            get Authorization() {
                return `Bearer ${sessionStorage.getItem('token')}`;
            }
        },
    },
});

export default echo;