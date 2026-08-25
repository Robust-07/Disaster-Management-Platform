const { io } = require('socket.io-client');
const socket = io('http://localhost:5000');

socket.on('connect', () => console.log('Connected:', socket.id));
socket.on('connect_error', (err) => console.log('Connection error:', err.message));
socket.on('new-sos', (data) => console.log('Received new-sos event:', data));
socket.on('resource-allocated', (data) => console.log('resource-allocated:', data));
socket.on('new-volunteer', (data) => console.log('new-volunteer:', data));
socket.on('campaign-donation', (data) => console.log('campaign-donation:', data));
socket.on('new-risk-zone', (data) => console.log('new-risk-zone:', data));
socket.on('disconnect', () => console.log('Disconnected'));