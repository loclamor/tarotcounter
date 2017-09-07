var Turn = function(type, players, p_taker, p_with, p_and, ismake, score, p_littleAtEnd, playersScores) {
	this.type = type;
	this.players = players;
	this.p_taker = p_taker;
	this.p_with = p_with;
	this.p_and = p_and;
	this.ismake = ismake;
	this.score = score;
	this.p_littleAtEnd = p_littleAtEnd;
	this.playersScores = playersScores;
	this.modes = window.game.modes;

	this.hasPlayed = function(p_name) {
		var p = this.players[p_name];
		return (typeof p != "undefined");
	};

	this.render = function(turnNumber, orderedPlayers, players) {

		//var title = "Manche " + (turnNumber + 1) + " : " + this.type.label;
		var title = this.type.label;
		if (!this.type.isEnculette()) {
			if (this.ismake) {
				title = title + "&nbsp; faite de ";
			} else {
				title = title + "&nbsp; chutée de ";
			}
			title = title + this.score + "&nbsp;";
			if (typeof this.p_littleAtEnd == "undefined" || this.p_littleAtEnd == null || this.p_littleAtEnd == "null" || this.p_littleAtEnd == "") {
				// nothing
			} else {
				title = title + "avec petit au bout par " + this.p_littleAtEnd;
			}
		}
		title = title + "&nbsp;(" + this.getMode().label + ")";
		var sRow = "<th>" + title + "&nbsp;<a href='' updateTurn='" + turnNumber + "'><span class='glyphicon glyphicon-pencil' aria-hidden='true' ></span></a></th>";
		for (i = 0; i < orderedPlayers.length; i++) {
			p_name = orderedPlayers[i];
			sRow += players[p_name].renderRow(turnNumber);
		}
		var rowId = "turn-" + turnNumber;
		sRow = "<tr id='" + rowId + "'>" + sRow + "</tr>";

		// result
		return sRow;
	};

	this.updateTurn = function(clicked) {
		var _this = this;
		var nturn = parseInt($(clicked).attr('updateTurn'));

		var players = [];
		var playersScores = {};
		$('#scores [updateTurnRow="' + nturn + '"] input[type="checkbox"][updateTurnPlayer]:checked').each(function() {
			var p_name = $(this).attr("value");
			players.push(window.game.getPlayer(p_name));
			if (_this.type.id == game.types.enculette.id) {
				playersScores[p_name] = {
					score: $('#scores tbody [updateTurnRow="' + nturn + '"] input[score][updatePlayer="' + p_name + '"]').val(),
					ask: $('#scores tbody [updateTurnRow="' + nturn + '"] input[ask][updatePlayer="' + p_name + '"]').is(":checked")
				};
			}
		});

		this.players = players;
		this.playersScores = playersScores;

		try {
			var renderer = new TurnRenderer(window.game.orderedPlayers, nturn, this);
			var turn = renderer.checkInputs($('tr.updateRow[updateTurnRow="' + nturn + '"]'), this.players, this.getMode(), this.playersScores);
			window.game.updateTurn(turn, nturn);
		} catch (e) {
			alert(e);
		}


	};

	this.updateDisplay = function(nturn) {
		// build renderer
		var renderer = new TurnRenderer(this.orderedPlayers, nturn, this);
		renderer.updateDisplay();
	};

	this.setPlayerActivation = function(p_name, checked) {

		// search for player
		var player = this.players[p_name];

		// found ?
		if (typeof player == "undefined" || player == null) {
			// only add it if checked
			if (checked) {
				// add this player !
				player = game.getPlayer(p_name);
				this.players[p_name] = player;
				player.checked = checked;
			} else {
				// not checked -> not added !
			}
		} else {
			// found !
			player.checked = checked;
			if (checked) {
				// keep it
			} else {
				// remove it !
				delete this.players[p_name];
			}
		}
	};

	this.getMode = function() {
		// init 
		var mode = null;

		// depending on players count
		var nbplayers = this.getNbPlayers();

		// loop on modes to get the good one
		$.each(this.modes, function(idx, m) {
			if (nbplayers >= m.minPlayer && nbplayers <= m.maxPlayer) {
				mode = m;
			}
		});

		// result
		return mode;
	};

	this.getNbDefenders = function() {

		// init
		var nb = 0;
		var _this = this;

		// loop
		for (var p_name in this.players) {
			if (p_name != _this.p_taker && p_name != _this.p_with && p_name != _this.p_and) {
				nb++;
			}
		}

		// result
		return nb;
	};

	this.getTakerCoeff = function() {

		// one taker
		var coeffs = 1;

		var mode = this.getMode();
		if (mode.with || mode.and) {
			coeffs++;
		}
		return coeffs;
	};

	this.getTeamateCoeff = function() {

		// one taker
		var coeffs = 0;

		var mode = this.getMode();
		if (mode.with || mode.and) {
			coeffs++;
		}
		return coeffs;
	};

	this.getNbPlayers = function() {
		var nb = 0;
		for (var p_name in this.players) {
			nb++;
		}
		return nb;
	}

};