var Nextturn = function(turntype_selector, container_selector, orderedPlayers, types) {

	// init props
	this.turntype_selector = turntype_selector;
	this.container = $(container_selector);
	this.orderedPlayers = orderedPlayers;
	this.types = types;

	// turntype ?
	var turntype = $(turntype_selector).val();
	if (turntype == "null") {
		throw "Choisis un type de manche, gros manche !"
	}

	// game type ?
	this.type = window.game.getTurnTypeFromSelectValue(turntype);

	// renderer
	this.renderer = new TurnRenderer(this.orderedPlayers, null, this);

	this.render = function() {

		// reinit selector and container
		$(turntype_selector).val('null');
		this.container.html("");

		//players row
		var playersRow = this.renderer.renderEdit();

		// game type ?
		/*if(this.turntype.isEnculette()){
			this.renderEnculette();
		} else {
			this.renderNotEnculette();
		}
		if (game.turnNum > 0) {
			//preactivate players
			var lastTurn = game.getLastTurn();
			for (var i = 0; i < game.orderedPlayers.length; i++) {
				p_name = game.orderedPlayers[i];
				//if player at the right of a previous non-playing player, player don't play this turn!
				leftPlayerIdx = game.orderedPlayers.indexOf(p_name) - 1;
				leftPlayerIdx = leftPlayerIdx < 0 ? game.orderedPlayers.length - 1 : leftPlayerIdx;
				if (lastTurn.hasPlayed(game.orderedPlayers[leftPlayerIdx])) {
					$('input[turnPlayer][value="' + p_name + '"]').click();
				}
			}
		} else {
			//activate the first 5 players
			var nbActivate = 0;
			for (var i = 0; i < game.orderedPlayers.length; i++) {
				p_name = game.orderedPlayers[i];
				if (nbActivate < 5) {
					$('input[turnPlayer][value="' + p_name + '"]').click();
					nbActivate++;
				}
			}
		}

		//valid button
		$('#scores tfoot').append(
			"<tr><th colspan='" + (1 + game.nbPlayers) + "'><button id='validTurn'>Valider</button></th></tr>"
		);
		var _this = this;
		$('#validTurn').click(function() { _this.validTurn(); });
		*/
	}

	this.renderEnculette = function() {

		// add players
		var titleRow = $("<tr/>");
		titleRow.append("<th colspan='" + (1 + game.nbPlayers) + "'>" + this.type.label + "&nbsp;<input type='hidden' turntype value='" + this.type.id + "' />" + "</th>");
		this.container.append(titleRow);

		//scores row
		var scoresRow = $("<tr/>");
		scoresRow.append("<th>Scores</th>");
		for (var i = 0; i < game.orderedPlayers.length; i++) {
			p_name = game.orderedPlayers[i];
			scoresRow.append("<td><label><input type='checkbox' ask player='" + p_name + "' disabled/>&nbsp;Demandée</label><br/>" + p_name + "&nbsp;:&nbsp;-&nbsp;<input type='number' player='" + p_name + "' step='1' min='0' max='91' score disabled/>" + "</td>");
		}
		this.container.append(scoresRow);

	}

	this.renderNotEnculette = function() {

		// init row
		var newGameRow = this.type.label + "&nbsp;";

		// players select
		var optionsSelect = "";
		for (var i = 0; i < game.orderedPlayers.length; i++) {
			p_name = game.orderedPlayers[i];
			optionsSelect += "<option value='" + p_name + "' player='" + p_name + "' disabled>" + p_name + "</option>";
		}

		// taker
		var takerSelect = "<select name='taker' >" + optionsSelect + "</select>";
		newGameRow += "de&nbsp;" + takerSelect;

		// partner
		var withSelect = "<select name='with' >" + optionsSelect + "</select>";
		newGameRow += "&nbsp;avec&nbsp;" + withSelect;

		var andSelect = "<select name='and' class='tagrot'>" + optionsSelect + "</select>";
		newGameRow += "<span class='tagrot'>&nbsp;et&nbsp;</span>" + andSelect;

		newGameRow += "&nbsp;:&nbsp;<select ismake><option value='1'>faite</option><option value='-1'>chutée</option></select>";
		newGameRow += "&nbsp;de&nbsp;<input type='number' step='1' min='0' max='91' score>";

		var littleSelect = "<select name='little' ><option value='null'>Non</option>" + optionsSelect + "</select>";
		newGameRow += "&nbsp;petit au bout&nbsp;" + littleSelect;

		var scoreBouts = "<select pointsBouts><option value='0'>0</option><option value='1'>1</option><option value='2'>2</option><option value='3'>3</option></select>";
		var scoreBrut = "<input type='number' step='0.5' max='91' points>";
		var scoreBrutWhoSelect = "<select pointsWho><option value='A'>l'attaque</option><option value='D'>la défense</option></select>";
		newGameRow += "<br/>ou&nbsp;" + scoreBrut + "&nbsp;points&nbsp;et&nbsp;" + scoreBouts + "&nbsp;bouts&nbsp;pour&nbsp;" + scoreBrutWhoSelect;

		newGameRow += "<input type='hidden' turntype value='" + this.type + "' />";
		newGameRow = "<tr><th colspan='" + (1 + game.nbPlayers) + "'>" + newGameRow + "</th></tr>";

		$('#scores tfoot').append(newGameRow);
	};

	this.validTurn = function() {
		try {
			// check !
			var turn = this.renderer.checkInputs(this.container, this.getSelectedPlayers(), this.getMode(), this.getPlayersScores());

			//transmitt values to game instance
			game.addTurn(turn);

		} catch (e) {
			alert(e);
		}

	};

	this.updateDisplayForNextTurn = function() {
		this.renderer.updateDisplay();
	}

	this.getPlayersScores = function() {

		// init
		var playersScores = {};
		var _this = this;

		this.container.find("input[type='checkbox'][turnPlayer]:checked").each(function() {
			var p_name = $(this).attr("value");
			if (_this.type.isEnculette()) {
				playersScores[p_name] = {
					score: _this.container.find('input[score][player="' + p_name + '"]').val(),
					ask: _this.container.find('input[ask][player="' + p_name + '"]').is(":checked")
				};
			}
		});

		// result
		return playersScores;
	};

	this.getMode = function() {
		// init 
		var mode = null;

		// depending on players count
		var selected = this.getSelectedPlayers();
		var nbplayers = selected.length;

		// loop on modes to get the good one
		$.each(game.modes, function(idx, m) {
			if (nbplayers >= m.minPlayer && nbplayers <= m.maxPlayer) {
				mode = m;
			}
		});

		// result
		return mode;
	};

	this.getSelectedPlayersAsObject = function() {
		var selected = this.getSelectedPlayers();
		var obj = {};
		$.each(selected, function(idx, element) {
			obj[element.name] = element;
		});
		return obj;
	};

	this.getSelectedPlayers = function() {
		var selected = [];
		$.each(this.orderedPlayers, function(idx, p_name) {
			var player = game.players[p_name];
			if (player.checked) {
				selected.push(player);
			}
		});
		return selected;
	};

	this.getNbPlayers = function() {
		return this.getSelectedPlayers().length;
	};

};