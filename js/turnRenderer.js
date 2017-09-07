var TurnRenderer = function(orderedPlayers, nturn, turn) {

	this.orderedPlayers = orderedPlayers;
	this.nturn = nturn;
	this.turn = turn;
	this.container = $("tr#turn-" + nturn);
	this.playerCheckboxAttr = "updateTurnPlayer";
	this.playerOptionAttr = "updateplayer";
	if (this.nturn === null) {
		this.container = $('#scores tfoot');
		this.playerCheckboxAttr = "turnPlayer";
		this.playerOptionAttr = "player";
	}

	// renders the player row
	this.renderTurnPlayers = function() {

		// init
		playersRow = $("<tr class='active players'></tr>");
		if (!this.isNextturn()) {
			playersRow.attr("updateTurnRow", this.nturn);
		}
		playersRow.append("<th>Joueurs du tour</th>");

		// loop
		for (var i = 0; i < this.orderedPlayers.length; i++) {
			p_name = this.orderedPlayers[i];
			playersRow.append("<td class='info'><label><input type='checkbox' name='player_" + p_name + "' value='" + p_name + "' " + this.playerCheckboxAttr + "/>&nbsp;" + p_name + "</label></td>");
		}

		// result
		return playersRow;
	};

	// render the score line
	this.renderScoreEnculette = function() {

		// init
		var scoresRow = "<th>Scores<input type='hidden' turntype value='" + this.turn.type.id + "' /></th>";
		var attr = "updatePlayer";
		if (this.isNextturn()) {
			attr = "player";
		}

		// loop on players
		for (var i = 0; i < this.orderedPlayers.length; i++) {
			p_name = this.orderedPlayers[i];
			scoresRow += "<td class='info'><label><input type='checkbox' ask " + attr + "='" + p_name + "' disabled/>&nbsp;Demandée</label><br/>" + p_name + "&nbsp;:&nbsp;-&nbsp;<input type='number' " + attr + "='" + p_name + "' step='1' min='0' max='91' score disabled/>" + "</td>";
		}

		// result
		return scoresRow;
	};

	this.renderPlayersSelect = function(select_name, add_empty) {

		// init
		var options = "";

		if (add_empty) {
			options += "<option value='null'></option>";
		}

		for (var i = 0; i < this.orderedPlayers.length; i++) {
			p_name = this.orderedPlayers[i];
			options += "<option value='" + p_name + "' " + this.playerOptionAttr + "='" + p_name + "' disabled>" + p_name + "</option>";
		}

		//result
		return select = "<select name='" + select_name + "' class='players_select'>" + options + "</select>";;
	};

	// render for edition
	this.renderEdit = function() {

		// init
		this.container.addClass('updating');
		var mode = this.getMode();

		// add players
		var playersRow = this.renderTurnPlayers();
		if (this.isNextturn()) {
			this.container.html("");
			this.container.append(playersRow);
			playersRow = this.container.find("tr.players");
		} else {
			this.container.after(playersRow);
			playersRow = this.container.next("tr.players");
		}

		// the update row
		var updateRow = $("<tr class='active updateRow' updateTurnRow='" + this.nturn + "'></tr>");

		switch (this.turn.type.id) {
			case game.types.enculette.id:
				//scores row
				var scoresRow = this.renderScoreEnculette();
				updateRow.append(scoresRow);
				break;

			case game.types.petite.id:
			case game.types.pousse.id:
			case game.types.garde.id:
			case game.types.gardesans.id:
			case game.types.gardecontre.id:

				// init
				var newGameRow = this.turn.type.label + "&nbsp;";

				// mode
				var mode = this.getMode();
				var modename = "?";
				if (typeof mode !== "undefined" && mode !== null) {
					modename = mode.label;
				}
				newGameRow += "(<span class='modename'>" + modename + "</span>)&nbsp;";

				//taker
				var takerSelect = this.renderPlayersSelect("taker", false);
				newGameRow += "de&nbsp;" + takerSelect;

				// with
				var withSelect = this.renderPlayersSelect("with", false);
				newGameRow += "&nbsp;<span class='with'>avec&nbsp;" + withSelect + "</span>";

				// and
				var andSelect = this.renderPlayersSelect("and", false);
				newGameRow += "&nbsp;<span class='and'>et&nbsp;" + andSelect + "</span>";

				// made ?
				newGameRow += "&nbsp;:&nbsp;<select ismake><option value='1'>faite</option><option value='-1'>chutée</option></select>";
				var scoremax = 91;
				if (typeof mode != "undefined" && mode !== null) {
					scoremax = mode.scoreMax;
				}
				newGameRow += "&nbsp;de&nbsp;<input class='score' type='number' step='1' min='0' max='" + scoremax + "' score>";

				var littleSelect = this.renderPlayersSelect("little", true);
				newGameRow += "&nbsp;petit au bout&nbsp;" + littleSelect;

				var scoreBouts = "<select pointsBouts><option value='0'>0</option><option value='1'>1</option><option value='2'>2</option><option value='3'>3</option></select>";
				var scoreBrut = "<input type='number' step='0.5' max='91' points>";
				var scoreBrutWhoSelect = "<select pointsWho><option value='A'>l'attaque</option><option value='D'>la défense</option></select>";
				newGameRow += "<br/>ou&nbsp;" + scoreBrut + "&nbsp;points&nbsp;et&nbsp;" + scoreBouts + "&nbsp;bouts&nbsp;pour&nbsp;" + scoreBrutWhoSelect;

				newGameRow += "<input type='hidden' turntype value='" + this.turn.type.id + "' />";
				updateRow.append("<th colspan='" + (1 + game.nbPlayers) + "'>" + newGameRow + "</th>");
				break;
			default:
				throw "Le type de manche '" + this.turn.type.id + "' n'est pas implémenté !"
		}

		//valid button
		playersRow.after(updateRow);
		updateRow = playersRow.next("tr.updateRow");
		var button = "<button updateTurn='" + this.nturn + "' >Mettre à jour</button>";
		if (this.isNextturn()) {
			button = "<button id='validTurn'>Valider</button>";
		}
		updateRow.after("<tr class='active'><th colspan='" + (1 + game.nbPlayers) + "'>" + button + "</th></tr>");

		// bind button
		var _this = this;
		if (this.isNextturn()) {
			$('#validTurn').unbind("click").bind("click", function() {
				window.game.validTurn();
			});
		} else {
			$('button[updateTurn="' + nturn + '"]').unbind("click").bind("click", function() {
				_this.turn.updateTurn($(this));
			});
		}

		// activate players
		var turn = this.turn;
		if (this.isNextturn()) {
			turn = game.getLastTurn();
		}
		if (typeof turn != "undefined" && turn !== null) {
			// activate player of this turn
			for (var i = 0; i < this.orderedPlayers.length; i++) {
				p_name = this.orderedPlayers[i];
				var input = $('[updateTurnRow="' + this.nturn + '"] input[' + this.playerCheckboxAttr + '][value="' + p_name + '"]');
				if (this.isNextturn()) {
					input = $('input[turnPlayer][value="' + p_name + '"]');
				}
				if (turn.hasPlayed(p_name)) {
					input.click();
				}
			}
		} else {
			// no turn !
			//activate the first 5 players
			var nbActivate = 0;
			for (var i = 0; i < this.orderedPlayers.length; i++) {
				p_name = this.orderedPlayers[i];
				if (nbActivate < 5) {
					$('input[turnPlayer][value="' + p_name + '"]').click();
					nbActivate++;
				}
			}
		}


		// init stuff with actual turn data
		if (this.turn.type.id === game.types.enculette.id) {
			for (p_name in this.turn.playersScores) {
				if (this.turn.playersScores[p_name].ask) {
					$('[updateTurnRow="' + this.nturn + '"] input[ask][updatePlayer="' + p_name + '"]').click();
				}
				$('[updateTurnRow="' + this.nturn + '"] input[score][updatePlayer="' + p_name + '"]').val(this.turn.playersScores[p_name].score);
			}
		} else {
			$('[updateTurnRow="' + this.nturn + '"] select[name="taker"]').val(this.turn.p_taker);
			$('[updateTurnRow="' + this.nturn + '"] select[name="with"]').val(this.turn.p_with);
			$('[updateTurnRow="' + this.nturn + '"] select[name="and"]').val(this.turn.p_and);
			$('[updateTurnRow="' + this.nturn + '"] select[name="little"]').val(this.turn.p_littleAtEnd);
			$('[updateTurnRow="' + this.nturn + '"] select[ismake]').val(this.turn.ismake);
			$('[updateTurnRow="' + this.nturn + '"] input[score]').val(this.turn.score);
		}

		// update display
		this.updateDisplay();
	};

	this.checkInputs = function(container, selectedPlayers, mode, playersScores) {
		//get values
		var turntype = container.find('input[turntype]').val();
		var type = window.game.getTurnTypeFromSelectValue(turntype);
		var ismake = container.find('select[ismake]').val();
		var score = container.find('input[score]').val();
		var p_taker = container.find('select[name="taker"]').val();
		var p_with = container.find('select[name="with"]').val();
		var p_and = container.find('select[name="and"]').val();
		var p_little = container.find('select[name="little"]').val();

		var players = selectedPlayers;
		console.log(p_taker, p_with, p_and, score, ismake, turntype, players);

		if (!type.isEnculette()) {

			// taker
			if (p_taker == null) {
				throw "Qui a pris déjà ?";
			}

			// check with
			if (mode.with) {
				if (typeof p_with == "undefined" || p_with == null || p_with == "") {
					throw "Le preneur ne doit pas jouer seul, même s'il est tout seul !";
				}
			}

			// and
			if (mode.and) {
				if (typeof p_and == "undefined" || p_and == null || p_and == "") {
					throw "Le preneur ne doit pas jouer qu'à 2 !";
				}
			}

			// ismake ?
			if (typeof ismake == "undefined" || ismake == "null" || ismake == null || ismake == "") {
				throw "C'est chû ou bien ?";
			}
			// score
			if (typeof score == "undefined" || score == null || score == "") {
				throw "Quel score, hein ?";
			}


		} else {
			if (players.length < 2) {
				throw "Faut être au moins 2 pour bien s'amuser à l'enculette !";
			}
			// loop on players to check their scores
			var attr = "updatePlayer";
			if (this.isNextturn()) {
				attr = "player";
			}
			for (idx in selectedPlayers) {
				var player = selectedPlayers[idx];
				var p_name = player.name;
				var score = $("input[type='number'][" + attr + "='" + p_name + "']").val();
				if (typeof score == "undefined" || score == null || score == "null" || score == "") {
					throw "Il me faut le score de " + p_name + "!";
				}
			}
		}

		// transform selected players list into object
		var selected = {};
		for (p_name in selectedPlayers) {
			var player = selectedPlayers[p_name];
			selected[player.name] = player;
		};

		return new Turn(type, selected, p_taker, p_with, p_and, ismake, score, p_little, playersScores, window.game.modes);
	};

	this.hasPlayed = function(p_name) {

		// init
		var has = false;

		if (this.nturn === null) {
			// look for the last turn
			var lastTurn = game.getLastTurn();
			has = lastTurn.hasPlayed(p_name);
		} else {
			has = this.turn.hasPlayed(p_name);
		}

		// result
		return has;
	};

	this.updateDisplay = function() {

		// mode ?
		var currentmode = this.getMode();
		if (currentmode !== null) {

			// show this mode
			$("." + currentmode.id).show();

			// with ?
			if (currentmode.with) {
				$(".with").show();
			} else {
				$(".with").hide();
			}

			// and ?
			if (currentmode.and) {
				$(".and").show();
			} else {
				$(".and").hide();
			}

			var nbBouts = $("select[pointsbouts]");
			if (nbBouts.length > 0) {
				nbBouts.find('option').remove();
				for (var i = 0; i <= currentmode.bouts; i++) {
					nbBouts.append("<option value='" + i + "'>" + i + "</option>");
				}
			}

			// hide others modes
			$.each(game.modes, function(idx, mode) {
				if (mode.id == currentmode.id) {
					// current mode -> show all
					$("." + currentmode.id).show();
				} else {
					// other mode -> hide
					$("." + mode.id + ":not(." + currentmode.id + ")").hide();
				}
			});

			// update the max value available for score
			$("input.score").attr("max", currentmode.scoreMax);
			$(".modename").each(function() {
				$(this).html(currentmode.label);
			});
		} else {
			$(".with").hide();
			$(".and").hide();
		}
	};

	this.getMode = function() {
		return this.turn.getMode();
	};

	this.isNextturn = function() {
		return this.nturn === null;
	};
};