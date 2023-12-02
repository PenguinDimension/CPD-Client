// Discord Rich Presence
const DiscordRPC = require('discord-rpc');

const clientId = '1094734178731429928';
DiscordRPC.register(clientId);

const rpc = new DiscordRPC.Client({ transport: 'ipc' })
const startTimestamp = new Date();

rpc.on('ready', () => {
  rpc.setActivity({
    state: `play.conexaopinguim.pw`,
    startTimestamp, 
    largeImageKey: `favicon_512`,
    largeImageText: `Club Penguin Dimensions`, 
    //smallImageKey: `beta-badge`, 
    //smallImageText: `Versão BETA`,
  });
});

rpc.login({ clientId }).catch(console.error);