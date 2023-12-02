const { dialog, Menu, MenuItem, Tray } = require('electron');
const config = require("../config");
const path = require('path');

const { mainWindow, clearCache, app, toggleWindow, portableLoc } = require('../main');

let trayContextMenu = Menu.buildFromTemplate([
  {
    label: 'Reiniciar',
    click: () => {
      if (portableLoc) return dialog.showMessageBoxSync({
        type: "error",
        title: "Função indisponível!",
        message: "O reinício não está disponível no cliente portátil.\nPara reiniciar, feche e abra novamente!"
      });
      clearCache;
      response = dialog.showMessageBoxSync({
        type: "info",
        // buttons: ["Ok"],
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
    click: () => {
      clearCache;
      mainWindow.close();
    }
  },
]);

// Criar ícone na tray
const createTray = () => {
  tray = new Tray(path.join(__dirname, '../../build/512x512.png'));
  tray.on('click', () => {
    toggleWindow();
  });
  tray.setToolTip('Club Penguin Dimensions Desktop Client');
  tray.setTitle('Club Penguin Dimensions Desktop Client');
  tray.setContextMenu(trayContextMenu);
  return tray;
};

module.exports = { createTray };