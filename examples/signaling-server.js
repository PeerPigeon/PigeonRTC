// Simple WebSocket signaling server for local testing
import { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: 9090 });

const clients = new Map();
let clientIdCounter = 0;

wss.on('connection', (ws) => {
  const clientId = ++clientIdCounter;
  clients.set(clientId, ws);
  
  console.log(`Client ${clientId} connected. Total clients: ${clients.size}`);
  
  // Send the client their ID
  ws.send(JSON.stringify({ type: 'id', id: clientId }));
  
  // Broadcast client list to all clients
  broadcastClientList();
  
  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data);
      console.log(`Client ${clientId} sent:`, message.type);
      
      // Forward message to target client
      if (message.to && clients.has(message.to)) {
        const targetWs = clients.get(message.to);
        targetWs.send(JSON.stringify({
          ...message,
          from: clientId
        }));
      }
    } catch (err) {
      console.error('Error handling message:', err);
    }
  });
  
  ws.on('close', () => {
    console.log(`Client ${clientId} disconnected`);
    clients.delete(clientId);
    broadcastClientList();
  });
  
  ws.on('error', (err) => {
    console.error(`Client ${clientId} error:`, err);
  });
});

function broadcastClientList() {
  const clientIds = Array.from(clients.keys());
  const message = JSON.stringify({ type: 'clients', clients: clientIds });
  
  clients.forEach((ws) => {
    ws.send(message);
  });
}

console.log('Signaling server running on ws://localhost:9090');
