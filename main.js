const {app, BrowserWindow, dialog, Menu, MenuItem, ipcMain, Tray} = require('electron');
const isDev = require('electron-is-dev');
const { autoUpdater } = require("electron-updater");
const DiscordRPC = require('discord-rpc');
const fs = require('fs');

//const {app, BrowserWindow} = require('electron');
const config = require("./config.js");
const path = require('path');

if (process.platform === 'linux') {
  app.commandLine.appendSwitch('no-sandbox');
}

let pluginName
switch (process.platform) {
    case 'win32':
        imageName = 'windows_icon';
        switch (process.arch) {
            case 'ia32':
            case 'x32':
                pluginName = 'flash/windows/32/pepflashplayer.dll'
                break
            case 'x64':
                pluginName = 'flash/windows/64/pepflashplayer.dll'
                break
            }
        break
    case 'linux':
        imageName = 'linux_icon';
        switch (process.arch) {
            case 'ia32':
            case 'x32':
                pluginName = 'flash/linux/32/libpepflashplayer.so'
                break
            case 'x64':
                pluginName = 'flash/linux/64/libpepflashplayer.so'
                break
            }
        
        app.commandLine.appendSwitch('no-sandbox');
        break
    case 'darwin':
        imageName = 'mac_os_icon';
        pluginName = 'flash/mac/PepperFlashPlayer.plugin'
        break
}
app.commandLine.appendSwitch('ppapi-flash-path', path.join(__dirname, pluginName));
app.commandLine.appendSwitch("disable-http-cache");

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
autoUpdater.checkForUpdatesAndNotify();
let mainWindow;
let fsmenu;

function clearCache() {
  if (mainWindow && mainWindow !== null) {
    mainWindow?.webContents.session.clearCache();
  }
}

// INÍCIO - TEMPLATE DO MENU
let template = [
  {
    label: 'Início',
    accelerator: 'Ctrl+I',
    click: () => {
      clearCache;
      mainWindow.loadURL(config.links.inicio);
      }
  },
  {
    label: 'Jogar',
    accelerator: 'Ctrl+J',
    click: () => {
      clearCache;
      mainWindow.loadURL(config.links.jogar);
      }
  },
  {
    label: '|',
  },
  {
    label: 'Atalhos',
    click: () => { 
      dialog.showMessageBox({
        type: "info",
        buttons: ["Entendi"],
        title: "Atalhos do cliente desktop",
        message: "Atalhos normais:\nCtrl+I = Início\nCtrl+J = Jogar\nCtrl+M = (Des)Mutar Áudio\nF11 = Tela cheia\n\nZooms:\nAmpliar = Ctrl+=\nNormalizar = Ctrl+0\nReduzir = Ctrl+-\n\nAtalhos de ações:\nF5 = Recarregar página\nCtrl+R = Reiniciar cliente\nCtrl+W = Fechar cliente"
      });
    }
  },
  {
    label: 'Limpar cache',
    click: () => {
      clearCache;
      dialog.showMessageBox({
        type: "info",
        //buttons: ["Vlw!"],
        title: "Cache limpo!",
        message: "Agora é só reiniciar a página e aproveitar!"
      });
    }
  },
  {
    label: '(Des)Mutar Áudio',
    accelerator: 'Ctrl+M',
    click: () => { 
      let ambool = (mainWindow.webContents.audioMuted ? false : true);
      mainWindow.webContents.audioMuted = ambool;
    }
  },
  {
    label: 'Tela Cheia',
    accelerator: 'F11',
    click: () => { 
      let fsbool = (mainWindow.isFullScreen() ? false : true);
      mainWindow.setFullScreen(fsbool);
    }
  },
  {
    label: 'Zooms',
    submenu: [
      {
        label: 'Zoom + (130%)',
        accelerator: 'Ctrl+=',
        click: () => { 
          //mainWindow.webContents.setZoomFactor(1.3); // ORIGINAL = 1.3
          mainWindow.webContents.setZoomFactor(config.zoom.mais);
        }
      },
      {
        label: 'Normal (100%)',
        accelerator: 'Ctrl+0',
        click: () => { 
          mainWindow.webContents.setZoomFactor(1.0); // ORIGINAL = 1.0
        }
      },
      {
        label: 'Zoom - (70%)',
        accelerator: 'Ctrl+-',
        click: () => { 
          //mainWindow.webContents.setZoomFactor(0.7); // ORIGINAL = 0.7
          mainWindow.webContents.setZoomFactor(config.zoom.menos);
        }
      },
    ]
  },
  {
    label: '|',
    //type: 'separator'
  },
  {
    label: 'Recarregar página',
    accelerator: 'F5',
    click: () => {
      clearCache;
      mainWindow.reload();
    }
  },
  {
    label: 'Reiniciar',
    accelerator: 'Ctrl+R',
    click: () => {
      clearCache;
      dialog.showMessageBox({
        type: "info",
        //buttons: ["Ok"],
        title: "AVISO!",
        message: "Reiniciando cliente... Favor aguardar!"
      });
      clearCache;
      setTimeout(function() {
        app.relaunch();
        app.quit();
      }, 1000);
    }
  },
  {
    label: 'Fechar',
    accelerator: 'Ctrl+W',
    click: () => {
	    clearCache;
      mainWindow.close();
    }
  }
];

let Zooms = [
  1.5,
  2.0,
  2.5,
  3.0,
  3.5,
  4.0,
  4.5,
  5.0 //MÁXIMO
]

if (config.modos.youtuber == true) {
  // AGORA COMEÇA OS ZOOMS PARA BOA QUALIDADE DE GRAVAÇÃO DE VÍDEO

  Zooms.forEach(zoom => {
    template.find(i => i.label == "Zooms").submenu.push({
      label: `${zoom*100}%`,
      click: () => {
        mainWindow.webContents.setZoomFactor(zoom);
      }
    });
  });

};

if (config.modos.dev == true) {
  template.push(
    {
      label: '|',
      //type: 'separator'
    },
    {
      label: 'Dev Tools',
      accelerator: 'Ctrl+Shift+I',
      click: () => { 
        mainWindow.webContents.openDevTools({ mode: 'detach' });
      }
    }
  );
};
// FIM - TEMPLATE DO MENU

function makeMenu() {
  fsmenu = Menu.buildFromTemplate(template)
}

let trayContextMenu = Menu.buildFromTemplate([
  {
    label: 'Reiniciar',
    click: () => {
      dialog.showMessageBox({
        type: "info",
        title: "AVISO!",
        message: "Reiniciando cliente... Favor aguardar!"
      });
      clearCache;
      setTimeout(function() {
        app.relaunch();
        app.quit();
      }, 1000);
    }
  },
  {
    label: 'Fechar',
    click: () => {
      clearCache;
      mainWindow.close();
    }
  },
]);

// Criar ícone na tray
const createTray = () => {
  tray = new Tray(path.join(__dirname, 'icon.png'));
  tray.on('click', () => {
    toggleWindow();
  });
  tray.setToolTip('Penguin Dimension Desktop Client');
  tray.setTitle('Penguin Dimension Desktop Client');
  tray.setContextMenu(trayContextMenu);
};

// Mostrar/ocultar janela
const toggleWindow = () => {
  if (mainWindow.isVisible()) return mainWindow.hide();
  return mainWindow.show();
};

// Criar a janela do cliente
function createWindow () {

  // Início - tela carregando
  let splashWindow = new BrowserWindow({
    width: 600,
    height: 320,
	icon: __dirname + '/favicon.ico',
    frame: false,
    transparent: true,
    show: false
  });

  splashWindow.setMenu(null);
  splashWindow.setResizable(false);
  //splashWindow.loadFile('pages/images/Carregando.png');
  //splashWindow.loadFile('pages/carregando.html');
  splashWindow.loadURL('https://conexaopinguim.pw/client/carregando');
  splashWindow.on('closed', () => (splashWindow = null));
  splashWindow.webContents.on('did-finish-load', () => {
    splashWindow.show();
  });

  // TELA INICIAL
  mainWindow = new BrowserWindow({
	  useContentSize: false,
	  show: false,
	  width: 960,
      height: 540,
	  //title: 'Carregando...',
      icon: __dirname + '/favicon.ico',
      webPreferences: {
        //preload: path.join(__dirname, 'preload.js'),
        plugins: true,
        nodeIntegration: true
      }
  });

  mainWindow.setResizable(true);

  mainWindow.webContents.once('did-finish-load', () => {
	if (splashWindow) {
		splashWindow.close();
		mainWindow.show();
		createTray();
		/*
		setTimeout(function() {
			dialog.showMessageBox({
				type:"info",
				buttons: ["Ok"],
				title: "Teste",
				message: "Opaaa"
			});
		}, 500);
		*/
	}
  });
  // Fim - tela carregando

  new Promise(
	resolve => setTimeout(function() {
	  makeMenu();
	  mainWindow.setMenu(null); // Remove o menu original da janela
	  Menu.setApplicationMenu(null); // Remove o menu original do cliente inteiro
	  mainWindow.setMenu(fsmenu); // Seta o menu da janela para o personalizado
	  //Menu.setApplicationMenu(fsmenu); // Seta o menu do cliente inteiro para o personalizado
	  clearCache();
	  mainWindow.loadURL(`${config.links.inicio}`); //IGNORAR
	  title: "";

	// MODO AUTOMÁTICO DE TELA CHEIA - ATIVAR MODO YOUTUBER
	// TRUE = ATIVADO | FALSE = DESATIVADO

	// CASO QUEIRA CAPTURAR O JOGO (SEM ELE FICAR CONGELANDO), ATIVE O MODO YOUTUBER NAS CONFIGS!
	// OBS: o modo YouTuber ativa automaticamente o modo tela cheia no cliente.
	// Se ativo, para alternar de janela use "Alt+Tab", "Win" ou saia do modo tela cheia (gravação vai ficar travando).

	if (config.modos.youtuber == true) {
	  mainWindow.setFullScreen(true);
	}

	  //mainWindow.webContents.on('will-navigate', handleRedirect);
	  //mainWindow.webContents.on('new-window', handleRedirect);

	  resolve();
	}, 5000)
  );

    // Discord Rich Presence
    const clientId = '1094734178731429928';
    DiscordRPC.register(clientId);
    const rpc = new DiscordRPC.Client({ transport: 'ipc' })
    const startTimestamp = new Date();

    rpc.on('ready', () => {
      rpc.setActivity({
        state: `play.conexaopinguim.pw`,
        startTimestamp, 
        largeImageKey: `favicon_512`,
        largeImageText: `Penguin Dimension`, 
        //smallImageKey: `beta-badge`, 
        //smallImageText: `Versão BETA`,
      });
    });
    rpc.login({ clientId }).catch(console.error);

	mainWindow.on('closed', function () {
	  mainWindow = null;
	});

};

var gotTheLock = null;

if (config.modos.dev == false) {
  gotTheLock = app.requestSingleInstanceLock();

  if (!gotTheLock) {
    app.quit();
  }

};

// Múltiplas instâncias para modo dev
if (config.modos.dev == false) {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    dialog.showMessageBox({
      type: "info",
      title: "AVISO!",
      message: "Você não pode executar mais de 1 instância do cliente! \n\nPor enquanto esse recurso está sendo testado, mas se você quiser ter acesso a ele, ative o modo dev. \n\nTenha em mente que se utilizado, poderá haver bugs no cliente durante a execução de múltiplas instâncias!"
    });
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    };
  });
};

app.on('ready', function () {
  createWindow();
});

app.setAsDefaultProtocolClient('pd');

app.on('window-all-closed', function () {
  // Quando o cliente for fechado, auto-atualiza e fecha se ativado e se houver atualização disponível
  if (process.platform !== 'darwin') {
    tray.destroy();
    app.quit();
  };
});

app.on('activate', function () {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) createWindow();
});

setInterval(clearCache, 1000*60*5); //Limpar o cache de 5 em 5 minutos