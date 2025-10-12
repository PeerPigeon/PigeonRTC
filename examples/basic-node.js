/**
 * Basic Node.js Example
 * 
 * This example shows how to use PigeonRTC in Node.js to create
 * a simple peer-to-peer connection.
 * 
 * Requirements:
 * - npm install @koush/wrtc
 */

import { createPigeonRTC } from '../src/index.js';

async function main() {
  try {
    // Initialize PigeonRTC (will auto-detect Node.js and use @koush/wrtc)
    console.log('Initializing PigeonRTC...');
    const rtc = await createPigeonRTC();
    console.log(`Using adapter: ${rtc.getAdapterName()}`);

    // Create a peer connection
    const config = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' }
      ]
    };

    const pc1 = rtc.createPeerConnection(config);
    const pc2 = rtc.createPeerConnection(config);

    console.log('Created two peer connections');

    // Set up ICE candidate exchange
    pc1.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('PC1: New ICE candidate');
        pc2.addIceCandidate(event.candidate);
      }
    };

    pc2.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('PC2: New ICE candidate');
        pc1.addIceCandidate(event.candidate);
      }
    };

    // Set up data channel on pc1
    const dataChannel = pc1.createDataChannel('test', { ordered: true });
    
    dataChannel.onopen = () => {
      console.log('Data channel opened!');
      dataChannel.send('Hello from PC1!');
    };

    dataChannel.onmessage = (event) => {
      console.log('PC1 received:', event.data);
    };

    // Set up data channel listener on pc2
    pc2.ondatachannel = (event) => {
      const receivedChannel = event.channel;
      console.log('PC2: Data channel received');

      receivedChannel.onopen = () => {
        console.log('PC2: Data channel opened');
        receivedChannel.send('Hello from PC2!');
      };

      receivedChannel.onmessage = (event) => {
        console.log('PC2 received:', event.data);
      };
    };

    // Set up connection state monitoring
    pc1.onconnectionstatechange = () => {
      console.log('PC1 connection state:', pc1.connectionState);
    };

    pc2.onconnectionstatechange = () => {
      console.log('PC2 connection state:', pc2.connectionState);
    };

    // Create offer and answer
    console.log('Creating offer...');
    const offer = await pc1.createOffer();
    await pc1.setLocalDescription(offer);
    await pc2.setRemoteDescription(offer);

    console.log('Creating answer...');
    const answer = await pc2.createAnswer();
    await pc2.setLocalDescription(answer);
    await pc1.setRemoteDescription(answer);

    console.log('Connection setup complete!');
    console.log('Wait for data channel to open and exchange messages...');

    // Keep process alive for a bit to see the messages
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Clean up
    pc1.close();
    pc2.close();
    console.log('Connections closed');

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
