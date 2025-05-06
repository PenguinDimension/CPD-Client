'use strict';

// true = SIM/ATIVADO/HABILITADO
// false = NÃO/DESATIVADO/DESABILITADO

const config = {

	"links": {
		"inicio": "https://cpdimensions.com",
		"jogar": "https://play.cpdimensions.com"
	},

	"auto_update": true, // ATUALIZAR LAUNCHEER AUTOMATICAMENTE?
	"discord_rpc": true, // ATIVAR RICH PRESENCE DO DISCORD?

	"modos": {
		"youtuber": false, // ADICIONAR ZOOMS PERSONALIZADOS?
		"fullscreen": false, // ABRIR EM TELA CHEIA?
		"dev": false // HABILITAR DEV TOOLS E MÚLTIPLAS INSTÂNCIAS?
	},

	"zoom": {
		"mais": 1.3, // ZOOM + (padrão: 1.3 = 130%)
		"menos": 0.7 // ZOOM - (padrão: 0.7 = 70%)
	}

}

module.exports = config;