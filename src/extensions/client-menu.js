const { dialog, Menu, MenuItem } = require('electron');
const config = require("../config");
const path = require('path');

let fsmenu;
const { mainWindow, clearCache, app, toggleWindow, portableLoc } = require('../main');

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
    label: 'Limpar cache',
    click: () => {
      clearCache;
      dialog.showMessageBox({
        type: "info",
        //buttons: ["Vlw!"],
        title: "Cache limpo!",
        message: "Agora é só recarregar a página e aproveitar!"
      });
    }
  },
  {
    label: 'Atualizar página',
    accelerator: 'F5',
    click: () => {
      mainWindow.reload();
    }
  },
  {
    label: '|',
  },
  {
    label: 'Reiniciar cliente',
    accelerator: 'Ctrl+R',
    click: () => {
      if (portableLoc) return dialog.showMessageBoxSync({
        type: "error",
        title: "Função indisponível!",
        message: "O reinício não está disponível no cliente portátil.\nPara reiniciar, feche e abra novamente!"
      });
      clearCache;
      response = dialog.showMessageBoxSync({
        type: "info",
        title: "AVISO!",
        message: "Reiniciando cliente... Favor aguardar!"
      });
      if (response == 0) {
        clearCache;
        app.relaunch();
        clearCache;
        app.quit();
        clearCache;
      };
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

  template.find(i => i.label == "Zooms").submenu.push({
    type: 'separator'
  });

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
  fsmenu = Menu.buildFromTemplate(template);
  return fsmenu;
}

module.exports = { makeMenu };