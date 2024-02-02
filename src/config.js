'use strict';

// true = SIM/ATIVADO/HABILITADO
// false = NÃO/DESATIVADO/DESABILITADO

const config = {

	"links": {
		"inicio": "https://cpdimensions.com",
		"jogar": "https://play.cpdimensions.com"
	},

	"auto_update": true, // AINDA NÃO TESTADO | SE O CLIENTE DEVERÁ SER ATUALIZADO AUTOMATICAMENTE OU NÃO
	"dc_rich_presence": true, // ATIVE OU DESATIVE O RICH PRESENCE DO DISCORD

	"modos": {
		"youtuber": false, // ADICIONA ZOOMS PERSONALIZADOS
		"fullscreen": false, // TELA CHEIA AO ABRIR O CLIENTE PARA NÃO CONGELAR DURANTE GRAVAÇÕES E STREAMS
		"dev": false // HABILITA FERRAMENTAS WEB DE DESENVOLVEDOR E MÚLTIPLAS INSTÂNCIAS
	},

	"zoom": {
		"mais": 1.3, // ZOOM + (padrão: 1.3 = 130%)
		"menos": 0.7 // ZOOM - (padrão: 0.7 = 70%)
	}

}

module.exports = config;