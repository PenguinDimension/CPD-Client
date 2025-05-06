console.log('Iniciando Discord Rich Presence...');

// Discord Rich Presence
const DiscordRPC = require('discord-rpc');

const clientId = '1094734178731429928';
DiscordRPC.register(clientId);

const rpc = new DiscordRPC.Client({ transport: 'ipc' })
const startTimestamp = new Date();

const fetch = require('node-fetch');
const url = 'https://cpdimensions.com/client/discord-rpc.json';
var rpcData = {};

(async () => {
  console.log('Puxando dados da API...');

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Erro HTTP! Status: ${response.status}`);
    }

    const data = await response.json();
    rpcData = data;

    console.log('Dados de RPC puxados com sucesso:', rpcData);
    console.log('Usando os dados puxados para o RPC...');
  } catch (error) {
    console.error('Erro ao puxar dados de RPC:', error);
    console.log('Usando os dados padrão para o RPC...');
  }

  let details = rpcData && rpcData.details ? rpcData.details : 'cpdimensions.com';
  let state = rpcData.state;
  let largeImageKey = rpcData && rpcData.largeImageKey ? rpcData.largeImageKey : 'favicon_512';
  let largeImageText = rpcData && rpcData.largeImageText ? rpcData.largeImageText : 'Club Penguin Dimensions';
  let smallImageKey = rpcData.smallImageKey;
  let smallImageText = rpcData.smallImageText;

  // Botões
  let buttons = rpcData && rpcData.buttons ? rpcData.buttons : [
    { label: 'Jogar', url: 'https://cpdimensions.com' }
  ];

  rpc.on('ready', () => {
    rpc.setActivity({
      details,
      state,
      startTimestamp,
      largeImageKey,
      largeImageText,
      smallImageKey,
      smallImageText,
      buttons,
      instance: true
    });
  });

  rpc.login({ clientId }).catch(console.error);
  console.log('RPC conectado com sucesso!');
})();