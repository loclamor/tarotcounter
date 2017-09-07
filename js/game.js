var Game = function() {

	this.types = {
		enculette: new Turntype("enculette", "Enculette", "E", 0, true),
		petite: new Turntype("petite", "Petite", "Pe", 10, false),
		pousse: new Turntype("pousse", "Pousse", "Po", 20, false),
		garde: new Turntype("garde", "Garde", "G", 40, false),
		gardesans: new Turntype("gardesans", "Garde-Sans", "GS", 80, false),
		gardecontre: new Turntype("gardecontre", "Garde-Contre", "GC", 160, false),
	};

	this.modes = {
		tarot: new Gamemode("tarot"),
		tarotA5: new Gamemode("tarotA5"),
		tagrot: new Gamemode("tagrot"),
	};

	this.turnNum = 0;
	this.nextturn = null;
	this.playedTurns = [];

	this.players = {};
	this.orderedPlayers = [];
	this.nbPlayers = 0;

	this.addPlayer = function(name, place) {

		// add !
		if (this.players[name]) {
			throw "Tu l'as déjà, hé, étourdi !";
		}
		var scorebase = 0;
		if (this.nbPlayers > 0) {
			for (var p_name in this.players) {
				scorebase += this.players[p_name].score;
			}
			scorebase = scorebase / this.nbPlayers;
			//arrondi
			scorebase = Math.floor((scorebase + 5) / 10) * 10;
		}
		var p = new Player(this, name, this.turnNum, scorebase);
		this.players[name] = p;
		this.nbPlayers += 1;

		return this.editPlayer(name, name, place);
	};

	this.editPlayer = function(oldname, newname, place) {

		// init
		place = typeof place !== 'undefined' ? parseInt(place) : null;

		// get the player
		p = this.players[oldname];
		if (typeof p == "undefined" || p == null) {
			throw "il n'existe pas, ce joueur '" + oldname + "' !";
		}

		// update name
		p.name = newname;
		delete this.players[oldname];
		this.players[newname] = p;

		// change name in turns list
		for (idx in this.playedTurns) {
			var turn = this.playedTurns[idx];
			var turn_player = turn.players[oldname];
			if (typeof turn_player != "undefined" && turn_player != null && turn_player != "null" && turn_player != "") {
				console.log(turn_player);
				delete turn.players[oldname];
				turn.players[newname] = p;
			}
		}

		// is in ordered ? if true -> remove !
		for (idx in this.orderedPlayers) {
			var p_name = this.orderedPlayers[idx];
			if (p_name == oldname) {
				//remove it !
				this.orderedPlayers.splice(idx, 1);
				if (idx < place && place != null) {
					place = place - 1;
				}
			}
		}

		// move !
		if (place != null) {
			this.orderedPlayers.splice(place, 0, newname);
		} else {
			this.orderedPlayers.push(newname);
		}
		this.render();
		return true;
	}

	this.addNextturn = function() {
		if (this.nbPlayers == 0) {
			throw "Alors tu joues sans joueurs toi ? ben bravo !";
		}
		this.nextturn = new Nextturn("#turntype", "#scores tfoot", this.orderedPlayers, this.types);
		this.nextturn.render();
	};

	this.addTurn = function(turn) {
		console.log("adding", turn);
		this.turnNum++;
		this.playedTurns.push(turn)
			//inform player that new turn end with their score
		for (var p_name in this.players) {
			var p_score = this.getPlayerScoreFromTurn(p_name, turn);
			this.players[p_name].addTurn(p_score);
		}
		//finaly rerender
		this.render();
	};

	this.updateTurn = function(turn, nturn) {
		console.log("updating " + nturn, turn);
		this.playedTurns[nturn] = turn;
		for (var p_name in this.players) {
			var p_score = this.getPlayerScoreFromTurn(p_name, turn);
			this.players[p_name].updateScore(nturn, p_score);
		}
		//finaly rerender
		this.render();
	};

	this.getPlayerScoreFromTurn = function(p_name, turn) {
		var scoreBase = parseInt(turn.score) + turn.type.basevalue;
		var p_score = 0
		var mode = turn.getMode();
		var p = turn.players[p_name];
		if (typeof p != "undefined") {
			if (turn.type.id != this.types.enculette.id) {

				// get the takers
				var takerCoeff = turn.getTakerCoeff();
				var teamateCoeff = turn.getTeamateCoeff();
				var nbPlayers = turn.getNbPlayers();
				var nbDefenders = turn.getNbDefenders();
				var nbTeamate = nbPlayers - nbDefenders - 1;

				// defense score
				var nonTakerScore = -1 * parseInt(turn.ismake) * scoreBase;
				var nonTakerTotalScore = nbDefenders * nonTakerScore;

				// attack score
				var attackTotalScore = -1 * nonTakerTotalScore;
				var takerScore = attackTotalScore * takerCoeff / (takerCoeff + teamateCoeff * nbTeamate);
				var teamateScore = 0;
				if (nbTeamate > 0) {
					teamateScore = (attackTotalScore - takerScore) / (nbTeamate);
				}

				if (p_name == turn.p_taker || p_name == turn.p_with || p_name == turn.p_and) {

					if (p_name == turn.p_with) {
						p_score = p_score + teamateScore;
					}
					if (p_name == turn.p_and) {
						p_score = p_score + teamateScore;
					}
					if (p_name == turn.p_taker) {
						p_score = p_score + takerScore;
					}
				} else {
					//default count for defenders
					p_score = nonTakerScore;
				}

				//little oudler at the end
				if (turn.p_littleAtEnd && turn.p_littleAtEnd != "null") {
					if (p_name == turn.p_littleAtEnd) {
						p_score += 10 * (turn.getNbPlayers() - 1);
					} else {
						p_score -= 10;
					}
				}
			} else {
				//enculette !
				p_score = -1 * parseInt(turn.playersScores[p_name].score);
				if (turn.playersScores[p_name].ask) {
					p_score = p_score * 2;
					if (p_score == 0) {
						p_score = 20;
					}
				}

			}
		}
		return p_score;
	};

	this.render = function() {
		$("#scores thead").html("");
		$("#scores tbody").html("");
		$('#scores tfoot').html("");
		var hRow = "<th>Joueurs</th>";
		for (var i = 0; i < this.orderedPlayers.length; i++) {
			p_name = this.orderedPlayers[i];
			hRow += this.players[p_name].renderHeader();
		}
		hRow = "<tr>" + hRow + "</tr>";
		$("#scores thead").html(hRow);
		for (var t = 0; t < this.turnNum; t++) {
			var turn = this.playedTurns[t];
			$("#scores tbody").append(turn.render(t, this.orderedPlayers, this.players));
		}

	};

	this.getLastTurn = function() {
		return this.playedTurns[this.playedTurns.length - 1];
	};

	this.getPlayerRank = function(p_name) {
		var p_scores = [];

		for (var p_n in this.players) {
			p_scores.push(this.players[p_n]);
		}

		p_scores.sort(function(a, b) {
			return a.score > b.score;
		});

		var rank = 0;
		var found = false;
		for (var i = 0; i < p_scores.length || !found; i++) {
			if (p_scores[i].name == p_name) {
				found = true;
				rank = i;
			}
		}
		return rank + 1;

	};

	function getNextTurnPlayers() { // TODO remove ?
		var players = [];
		var playersScores = {};
		$('#scores input[type="checkbox"][turnPlayer]:checked').each(function() {
			var p_name = $(this).attr("value");
			if (turntype == game.types.enculette.id) {
				playersScores[p_name] = {
					score: $('#scores tfoot input[score][player="' + p_name + '"]').val(),
					ask: $('#scores tfoot input[ask][player="' + p_name + '"]').is(":checked")
				};
			}
		});
		return {
			players: players,
			playersScores: playersScores
		};
	};

	this.getPlayer = function(p_name) {
		return this.players[p_name];
	};

	this.getNbMaxPlayers = function() {
		// init
		var nb = 0;

		$.each(this.modes, function(idx, mode) {
			if (mode.maxPlayer > nb) {
				nb = mode.maxPlayer;
			}
		});

		// result
		return nb;
	};

	this.getNbPlayers = function() {
		// init
		var nb = 0;
		for (var p_name in this.players) {
			nb++;
		}
		// result
		return nb;
	};

	this.setPlayerActivation = function(p_name, checked) {
		var player = this.getPlayer(p_name);
		player.checked = checked;
	};

	this.getMaxBouts = function() {
		var max = 0;
		$.each(this.modes, function(idx, element) {
			var bouts = element.bouts;
			if (bouts > max) {
				max = bouts;
			}
		});
		return max;
	};

	this.validTurn = function() {
		if (this.nextturn !== null) {
			return this.nextturn.validTurn();
		}
	};

	this.updateDisplayForNextTurn = function() {

		// hide for players
		var nbMaxPlayers = this.getNbMaxPlayers();
		var nbPlayers = this.getNbPlayers();
		var nbSelectedPlayers = 0;
		if (this.nextturn !== null) {
			nbSelectedPlayers = this.nextturn.getSelectedPlayers().length;
		}
		if (typeof nbSelectedPlayers == "undefined" || nbSelectedPlayers == null || nbSelectedPlayers == 0) {
			nbSelectedPlayers = 0;
		}
		if (nbSelectedPlayers > nbMaxPlayers) {
			throw "Mais vous êtes bien trop nombreux là ! " + nbMaxPlayers + " joueur(s) max ! Plus ça serait de la gourmandise ...";
		}
		for (var i = 1; i <= nbMaxPlayers; i++) {
			var selector = "." + i + "-players";
			if (i == nbSelectedPlayers) {
				$(selector).show();
			} else if (nbSelectedPlayers == 0 && i <= nbPlayers) {
				$(selector).show();
			} else {
				$(selector).hide();
			}
		}

		// next turn ?
		if (this.nextturn !== null) {
			this.nextturn.updateDisplayForNextTurn();
		}
	};

	this.buildTurntypesSelect = function(select_selector) {

		// select
		var select = $(select_selector);
		select.find('option').remove();

		// add !
		select.append("<option value='null'>Choisir...</option>");
		$.each(this.types, function(idx, element) {
			select.append("<option value='" + element.id + "'>" + element.label + "</option>");
		});
	}

	this.buildModesTable = function(container) {

		// init
		var html = $("<table class='table table-bordered table-hover' style='text-align:center'/>");
		var thead = $("<thead/>");
		var tbody = $("<tbody/>");

		// append rows for head
		var row = $("<tr/>");
		row.append("<th rowspan='2'>Nombre de bouts</th>");
		$.each(this.modes, function(idx, element) {
			row.append("<th colspan='2' class='" + idx + "'>Contrat " + element.label + "</th>");
		});
		thead.append(row);

		// scores
		row = $("<tr/>");
		$.each(this.modes, function(idx, element) {
			row.append("<th class='" + idx + "'>Attaque</th><th class='" + idx + "'>Défense</th>");
		});
		thead.append(row);

		// contracts
		for (i = 0; i < this.getMaxBouts() + 1; i++) {
			row = $("<tr/>");
			row.append("<td>" + i + "</td>");
			$.each(this.modes, function(idx, element) {
				var attaque = element.contrats[i];
				var defense = element.scoreMax - attaque;
				var cancel = element.cancel;
				if (typeof attaque == "undefined") {
					attaque = "-";
					defense = "-";
					cancel = "-";
				} else {
					row.addClass(idx);
				}

				// add !
				row.append("<td class='" + idx + "'>" + attaque + "</td><td class='" + idx + "'>" + defense + "</td>");
			});
			tbody.append(row);
		}

		// append thead
		html.append(thead);
		html.append(tbody);

		// append to container
		$(container).html(html);
	}

	this.buildRulesTable = function(container) {
		// init
		var html = $("<table class='table table-bordered table-hover' style='text-align:center'/>");
		var thead = $("<thead/>");
		var tbody = $("<tbody/>");

		// append rows for head
		var row = $("<tr/>");
		row.append("<th rowspan='2'>Joueurs</th>");
		row.append("<th rowspan='2'>Mode</th>");
		row.append("<th colspan='3'>Règles</th>");
		thead.append(row);
		row = $("<tr/>");
		row.append("<th>Cartes</th><th>Annulation</th><th>Chien</th>");
		thead.append(row);

		// add !
		$.each(this.modes, function(idx, mode) {
			$.each(mode.rules, function(idx, rule) {
				row = $("<tr class='" + rule.nbplayer + "-players'/>");
				row.append("<td class='" + mode.id + "'>" + rule.nbplayer + "</td>");
				row.append("<td class='" + mode.id + "'>" + mode.label + "</td>");
				row.append("<td class='" + mode.id + "'>" + rule.cards + "</td>");
				if (rule.cancel == null) {
					row.append("<td class='" + mode.id + "'>Pas d'annulation</td>");
				} else {
					row.append("<td class='" + mode.id + "'>" + rule.cancel + "</td>");
				}
				row.append("<td class='" + mode.id + "'>" + rule.dog + "</td>");
				tbody.append(row);
			});
		});

		// append thead
		html.append(thead);
		html.append(tbody);

		// append to container
		$(container).html(html);
	};

	this.getTurnTypeFromSelectValue = function(turntype) {

		// type
		var type = null;

		// game type ?
		switch (turntype) {
			case this.types.enculette.id:
				type = this.types.enculette;
				break;
			case this.types.petite.id:
				type = this.types.petite;
				break;
			case this.types.pousse.id:
				type = this.types.pousse;
				break;
			case this.types.garde.id:
				type = this.types.garde;
				break;
			case this.types.gardesans.id:
				type = this.types.gardesans;
				break;
			case this.types.gardecontre.id:
				type = this.types.gardecontre;
				break;
			default:
				throw "Qu'estce que c'est que ce type de manche, gros manche ! (" + turntype + ")";
				break;
		}

		// result
		return type;
	};
};