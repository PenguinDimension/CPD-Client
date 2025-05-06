const {app, BrowserWindow, dialog, Menu, MenuItem, ipcMain, Tray, globalShortcut} = require('electron');
const isDev = require('electron-is-dev');
const { autoUpdater } = require("electron-updater");
const DiscordRPC = require('discord-rpc');
const fs = require('fs');

const config = require("./config.js");
const path = require('path');


/* INÍCIO - CRIANDO UM HANDLER PROS ERROS NÃO FICAREM FEIOS E SEREM FACILMENTE ENTENDÍVEIS POR UMA PESSOA NÃO DEVELOPER 👍 */

var isThereAnError = false;

const callError = function(err) {
  isThereAnError = true;

  app.on('ready', function () {

/* DESNECESSÁRIO, MAS TÁ AQUI SE ALGUM DIA PRECISAR
    errWindow = new BrowserWindow({
      useContentSize: false,
      show: true,
      width: 960,
      height: 540,
      title: 'Erro',
      webPreferences: {
        //preload: path.join(__dirname, 'preload.js'),
        plugins: false
      }
    });
    errWindow.setResizable(false);

    errWindow.setMenu(null); // Remove o menu original da janela
    Menu.setApplicationMenu(null); // Remove o menu original do cliente inteiro
*/

    let erro = err.message || "Ocorreu um erro mas não pude identificar qual...";

    let response = dialog.showMessageBoxSync({
      type: "error",
      title: "Opa, um erro!",
      message: erro
    });
    if (response == 0) app.exit(1);

  });

  return;
};

process.on("uncaughtException", (err) => {
  callError(err);
});

/* FINAL - CRIANDO UM HANDLER PROS ERROS NÃO FICAREM FEIOS E SEREM FACILMENTE ENTENDÍVEIS POR UMA PESSOA NÃO DEVELOPER 👍 */


let portableLoc = process.env.PORTABLE_EXECUTABLE_FILE;


let pluginName;
let imageName;

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
        app.commandLine.appendSwitch('no-sandbox');
        switch (process.arch) {
            case 'ia32':
            case 'x32':
                pluginName = 'flash/linux/32/libpepflashplayer.so'
                break
            case 'x64':
                pluginName = 'flash/linux/64/libpepflashplayer.so'
                break
            }
        break
    case 'darwin':
        imageName = 'mac_os_icon';
        pluginName = 'flash/mac/PepperFlashPlayer.plugin'
        break
};
app.commandLine.appendSwitch('ppapi-flash-path', path.join(__dirname, pluginName));
app.commandLine.appendSwitch("disable-http-cache");
app.commandLine.appendSwitch("ignore-certificate-errors");

if (config.auto_update == true && !portableLoc) autoUpdater.checkForUpdatesAndNotify();

var mainWindow;
var menu;
var fsmenu;
var tray;
var fstray;

function clearCache() {
  if (mainWindow && mainWindow !== null) {
    mainWindow.webContents.session.clearCache();
    mainWindow.webContents.session.clearAuthCache();
    //mainWindow.webContents.session.clearCodeCaches();
    mainWindow.webContents.session.clearStorageData();
    mainWindow.webContents.session.clearHostResolverCache();
  }
}

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
    icon: __dirname + '/build/256x256.ico',
    frame: false,
    transparent: true,
    show: false
  });

  splashWindow.setMenu(null);
  splashWindow.setResizable(false);
  //splashWindow.loadFile('pages/images/Carregando.png');
  //splashWindow.loadFile('pages/carregando.html');
  splashWindow.loadURL('https://cpdimensions.com/client/carregando');
  splashWindow.on('closed', () => (splashWindow = null));
  splashWindow.webContents.on('did-finish-load', () => {
    splashWindow.show();
  });
  // Fim - tela carregando

  // TELA INICIAL
  mainWindow = new BrowserWindow({
    useContentSize: false,
    show: false,
    width: 960,
    height: 540,
    //title: 'Carregando...',
    icon: __dirname + '/build/256x256.ico',
    webPreferences: {
      //preload: path.join(__dirname, 'preload.js'),
      plugins: true,
      nodeIntegration: true
    }
  });
  mainWindow.setResizable(true);

  module.exports = { mainWindow, clearCache, app, toggleWindow, portableLoc };
  menu = require('./extensions/client-menu'); // Carrega o menu do cliente
  tray = require('./extensions/client-tray'); // Carrega a tray do cliente

  mainWindow.webContents.once('did-finish-load', async () => {
    if (splashWindow) {
      await splashWindow.close();
      await mainWindow.show();
      fstray = tray && tray.createTray ? tray.createTray() : null;
      if (config.discord_rpc == true) {
        require('./extensions/discord-rpc'); // Carrega o rich presence do Discord
      }
    }
    mainWindow.focus();
  });

  new Promise(
    resolve => setTimeout(function() {
      fsmenu = menu.makeMenu();
      mainWindow.setMenu(null); // Remove o menu original da janela
      Menu.setApplicationMenu(null); // Remove o menu original do cliente inteiro
      mainWindow.setMenu(fsmenu); // Seta o menu da janela para o personalizado
      //Menu.setApplicationMenu(fsmenu); // Seta o menu do cliente inteiro para o personalizado
      clearCache();
      mainWindow.loadURL(`${config.links.inicio}`); //IGNORAR
      title: "";

      // CASO QUEIRA CAPTURAR O JOGO (SEM ELE FICAR CONGELANDO), ATIVE O MODO FULLSCREEN NAS CONFIGS!
      // OBS: o modo fullscreen ativa automaticamente o modo tela cheia no cliente.
      // Se ativo, para alternar de janela use "Alt+Tab", "Win" ou saia do modo tela cheia (gravação vai ficar travando).

      if (config.modos.fullscreen == true) {
        mainWindow.setFullScreen(true);
      }

      //mainWindow.webContents.on('will-navigate', handleRedirect);
      //mainWindow.webContents.on('new-window', handleRedirect);

      resolve();
    }, 5000)
  );

  mainWindow.on('closed', function () {
    mainWindow = null;
  });

};

var gotTheLock = null;

// Múltiplas instâncias para modo dev ou launcher portable
if (config.modos.dev == false && !portableLoc) {
    gotTheLock = app.requestSingleInstanceLock();

    if (!gotTheLock) {
        app.quit();
    } else {
        app.on('second-instance', (event, commandLine, workingDirectory) => {
            if (mainWindow) {
                if (!mainWindow.isVisible()) mainWindow.show();
                if (mainWindow.isMinimized()) mainWindow.restore();
                mainWindow.focus();
            };
    
            /*
            dialog.showMessageBox({
                type: "warning",
                title: "Opa, já estou aberto!",
                message: "O launcher já está rodando! Caso ele ainda não esteja visível para você, reinicie abaixo ou feche o processo pelo gerenciador de tarefas e abra o launcher novamente. \n\n❗ Caso você tenha certeza de que deseja abrir outra janela do launcher, habilite essa funcionalidade nas configurações ligando o modo dev! \n\n⚠️ Tenha em mente que, se utilizado, poderá haver bugs no launcher durante a execução de múltiplas instâncias!",
                buttons: ["Deixa, já voltou", "Reiniciar launcher"], // Adiciona o botão de reiniciar
            }).then((result) => {
                if (result.response == 1) { // Se o botão "Reiniciar Launcher" for clicado
                    if (portableLoc) return dialog.showMessageBoxSync({
                        type: "error",
                        title: "Função indisponível!",
                        message: "O reinício não está disponível no launcher portátil.\nPara reiniciar, feche e abra novamente!"
                    });
    
                    clearCache;
                    let response = dialog.showMessageBoxSync({
                        type: "info",
                        // buttons: ["Ok"],
                        title: "AVISO!",
                        message: "Reiniciando launcher... Favor aguardar!"
                    });
    
                    if (response == 0) {
                        clearCache;
                        app.relaunch();
                        clearCache;
                        app.quit();
                        clearCache;
                    };
                }
            })
            .catch((error) => {
                console.error("Erro ao mostrar a caixa de diálogo:", error);
            });
            */

            function showCustomDialog() {
                const modal = new BrowserWindow({
                    parent: mainWindow,
                    modal: true,
                    width: 800, // Largura exata do modal
                    height: 360, // Altura exata do modal
                    useContentSize: true, // Garante que o tamanho seja aplicado ao conteúdo
                    resizable: false,
                    transparent: true,
                    frame: false,
                    webPreferences: {
                        nodeIntegration: true,
                        contextIsolation: false // Necessário para usar ipcRenderer no HTML
                    },
                });

                // Carrega o arquivo HTML
                modal.loadFile(path.join(__dirname, 'pages/alerta-launcher-aberto.html'));
    
                modal.once('ready-to-show', () => {
                    modal.show();
                });
            }
    
            // No processo principal, escute o evento para reiniciar o launcher
            ipcMain.once('restart-launcher', () => {
                // Envie um comando para a instância original reiniciar
                app.emit('restart-original-instance');
                // Feche a nova instância
                app.quit();
            });

            // Mostre a caixa de diálogo personalizada
            showCustomDialog();
        });

        // No processo principal, escute o evento para abrir arquivo de configuração no editor padrão do usuário
        ipcMain.on('open-config', () => {
            const configPath = path.join(__dirname, 'config.js');
            const editor = process.platform === 'win32' ? 'notepad.exe' : 'nano'; // Altere para o editor desejado
            require('child_process').exec(`${editor} "${configPath}"`);
        });

        app.once('restart-original-instance', () => {
            // Reinicie a instância original
            app.quit();
            app.relaunch();
        });
    }

};

app.on('ready', function () {
  if (isThereAnError) return;
  createWindow();

  globalShortcut.register('Alt+CommandOrControl+B', () => {
    mainWindow.loadURL("https://beta.cpdimensions.com");
  });

});

app.setAsDefaultProtocolClient('cpd');
app.on('open-url', (event, url) => {
  event.preventDefault();
  if (mainWindow) {
    mainWindow.loadURL(url);
    mainWindow.show();
  } else {
    createWindow();
  }
});

app.on('window-all-closed', function () {
  // Quando o cliente for fechado, auto-atualiza e fecha se ativado e se houver atualização disponível
  if (process.platform !== 'darwin') {
    fstray.destroy();
    app.quit();
  };
});

app.on('activate', function () {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) createWindow();
});

setInterval(clearCache, 1000*60*10); //Limpar o cache de 10 em 10 minutos