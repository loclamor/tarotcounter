$(document).ready(function() {
	var game = new Game();

	//game.addPlayer("loclamor");
	var typemode = "prod";
	if (window.location.hash.slice(1) == "dev") {
		typemode = "dev";

		for (var j = 1; j < 11; j++) {
			game.addPlayer("J" + j);
		}


		//add some turns

		var turn = new Turn(game.types["petite"], ["J1", "J2", "J3", "J4", "J5"], "J1", "J2", "1", 10, "null", null);
		game.addTurn(turn);
		var turn = new Turn(game.types["pousse"], ["J2", "J3", "J4", "J5", "J6"], "J2", "J3", "1", 20, "null", null);
		game.addTurn(turn);
		var turn = new Turn(game.types["enculette"], ["J1", "J3", "J4", "J5", "J6"], "null", "null", "1", 0, "null", {
			"J1": {
				ask: false,
				score: 10
			},
			"J3": {
				ask: false,
				score: 20
			},
			"J4": {
				ask: true,
				score: 0
			},
			"J5": {
				ask: false,
				score: 0
			},
			"J6": {
				ask: false,
				score: 50
			}
		});
		game.addTurn(turn);
		var turn = new Turn(game.types["garde"], ["J1", "J2", "J4", "J5", "J6"], "J5", "J4", "1", 10, "J4", null);
		game.addTurn(turn);


		window.game = game;
	} else {
		$(".devmode").hide();
	}

	//IHM event callbacks
	$('#addPlayerModal').on('show.bs.modal', function(e) {
		//empty previous value
		$('#newUsername').val("");
		$('#addPlayerModalErrMessages').html("");
		playersSelect = "";
		for (var i = 0; i < game.orderedPlayers.length; i++) {
			p_name = game.orderedPlayers[i];
			var selected = "";
			if ((i + 1) == game.orderedPlayers.length) {
				selected = 'selected';
			}
			playersSelect += "<option value='" + (i + 1) + "' " + selected + ">" + p_name + "</option>";
		}
		$('#newUserPlace').html(playersSelect);
	});

	$('#addPlayerModal').on('shown.bs.modal', function(e) {
		$('#newUsername').focus();
	});

	$("#newUsername").enterKey(function() {
		$('#addPlayerButton').click();
	});

	$('#addPlayerButton').click(function() {
		var newPlayer = $('#newUsername').val();
		if (newPlayer.length < 3) {
			$('#addPlayerModalErrMessages').html("Le nom d'un joueur doit faire au moins 3 caractères !");
			return;
		}
		if (!game.addPlayer(newPlayer, $('#newUserPlace').val())) {
			$('#addPlayerModalErrMessages').html("Ce nom de joueur existe déjà !");
		} else {
			//dismiss modal
			$('#addPlayerModal').modal('hide');
		}
	});

	$("#scores tfoot").on("click", 'input[type="checkbox"][turnPlayer]', function() {
		var p_name = $(this).attr("value");
		var checked = $(this).is(":checked");
		if (checked) {
			$('[player="' + p_name + '"]').removeAttr("disabled");
		} else {
			$('[player="' + p_name + '"]').attr("disabled", "disabled");
			$(this).removeAttr("disabled");
		}
	});

	$("#scores tbody").on("click", 'input[type="checkbox"][updateTurnPlayer]', function() {
		var p_name = $(this).attr("value");
		var nturn = parseInt($(this).closest('tr').attr('updateTurnRow'));
		var checked = $(this).is(":checked");
		if (checked) {
			$('[updateTurnRow="' + nturn + '"] [updatePlayer="' + p_name + '"]').removeAttr("disabled");
		} else {
			$('[updateTurnRow="' + nturn + '"] [updatePlayer="' + p_name + '"]').attr("disabled", "disabled");
			$(this).removeAttr("disabled");
		}
	});

	$("#scores tfoot").on("keyup", "input[points]", updateScoreFromPoints);
	$("#scores tfoot").on("change", "select[pointsWho]", updateScoreFromPoints);
	$("#scores tfoot").on("change", "select[pointsBouts]", updateScoreFromPoints);

	function updateScoreFromPoints() {
		console.log('update score !');
		var pointsAttaqueTable = [56, 51, 41, 36];
		var pointsDefenceTable = [55, 50, 40, 35];
		var score = 0;
		if ($("select[pointsWho]").val() == "A") {
			score = parseFloat($("input[points]").val()) - pointsAttaqueTable[parseInt($("select[pointsBouts]").val())];
		} else {
			score = pointsDefenceTable[parseInt($("select[pointsBouts]").val())] - parseFloat($("input[points]").val());
		}
		console.log("score =", score);
		if (score >= 0) {
			score = Math.floor((score + 5) / 10) * 10;
			console.log("fait de", score);
			$('input[score]').val(score);
			$("select[ismake]").val("1");
		} else {
			score = Math.floor((score + 5) / 10) * 10;
			console.log("chute de", score);
			$('input[score]').val(-1 * score);
			$("select[ismake]").val("-1");
		}
	}

	//$("#scores tbody").on("keypress", "input[score]", updatePointsFromScore);

	$("#scores").on("click", 'a[updateTurn]', function(e) {
		e.preventDefault();
		if ($(this).closest("tr").hasClass('updating')) {
			return;
		}
		var nturn = parseInt($(this).attr('updateTurn'));
		var turn = game.playedTurns[nturn];
		var updateRow = "";

		var playersRow = "<th>Joueurs du tour</th>"
		for (var i = 0; i < game.orderedPlayers.length; i++) {
			p_name = game.orderedPlayers[i];
			playersRow += "<td><label><input type='checkbox' name='player_" + p_name + "' value='" + p_name + "' updateTurnPlayer/>&nbsp;" + p_name + "</label></td>";
		}
		playersRow = "<tr class='active' updateTurnRow='" + nturn + "'>" + playersRow + "</tr>";

		switch (turn.type.id) {
			case game.types.enculette.id:
				gamename = game.types.enculette.label;
				//scores row
				var scoresRow = "<th>Scores</th>";
				for (var i = 0; i < game.orderedPlayers.length; i++) {
					p_name = game.orderedPlayers[i];
					scoresRow += "<td><label><input type='checkbox' ask updatePlayer='" + p_name + "' disabled/>&nbsp;Demandée</label><br/>" + p_name + "&nbsp;:&nbsp;-&nbsp;<input type='number' updatePlayer='" + p_name + "' step='1' min='0' max='91' score disabled/>" + "</td>";
				}
				updateRow = scoresRow;

				break;
			case game.types.petite.id:
			case game.types.pousse.id:
			case game.types.garde.id:
			case game.types.gardesans.id:
			case game.types.gardecontre.id:
			default:
				gamename = turn.type.label;


				var newGameRow = gamename + "&nbsp;";

				//taker
				var optionsSelect = "";
				for (var i = 0; i < game.orderedPlayers.length; i++) {
					p_name = game.orderedPlayers[i];
					optionsSelect += "<option value='" + p_name + "' updatePlayer='" + p_name + "' disabled>" + p_name + "</option>";
				}
				var takerSelect = "<select name='taker' >" + optionsSelect + "</select>";
				newGameRow += "de&nbsp;" + takerSelect;

				var withSelect = "<select name='with' >" + optionsSelect + "</select>";
				newGameRow += "&nbsp;avec&nbsp;" + withSelect;

				newGameRow += "&nbsp;:&nbsp;<select ismake><option value='1'>faite</option><option value='-1'>chutée</option></select>";
				newGameRow += "&nbsp;de&nbsp;<input type='number' step='1' min='0' max='91' score>";

				var littleSelect = "<select name='little' ><option value='null'>Non</option>" + optionsSelect + "</select>";
				newGameRow += "&nbsp;petit au bout&nbsp;" + littleSelect;

				newGameRow += "<input type='hidden' gametype value='" + gametype + "' />";
				updateRow = "<th colspan='" + (1 + game.nbPlayers) + "'>" + newGameRow + "</th>";
		}

		updateRow = "<tr class='active' updateTurnRow='" + nturn + "'>" + updateRow + "</tr>";

		//valid button
		updateRow += "<tr class='active'><th colspan='" + (1 + game.nbPlayers) + "'><button updateTurn='" + nturn + "' >Mettre à jour</button></th></tr>";

		$(this).closest("tr").addClass('updating').after(playersRow + updateRow);
		for (var i = 0; i < game.orderedPlayers.length; i++) {
			p_name = game.orderedPlayers[i];
			if (turn.hasPlayed(p_name)) {
				$('[updateTurnRow="' + nturn + '"] input[updateTurnPlayer][value="' + p_name + '"]').click();
			}
		}
		// init stuff with actual turn data
		if (turn.type.id === game.types.enculette.id) {
			for (p_name in turn.playersScores) {
				if (turn.playersScores[p_name].ask) {
					$('[updateTurnRow="' + nturn + '"] input[ask][updatePlayer="' + p_name + '"]').click();
				}
				$('[updateTurnRow="' + nturn + '"] input[score][updatePlayer="' + p_name + '"]').val(turn.playersScores[p_name].score);
			}
		} else {
			$('[updateTurnRow="' + nturn + '"] select[name="taker"]').val(turn.p_taker);
			$('[updateTurnRow="' + nturn + '"] select[name="with"]').val(turn.p_with);
			$('[updateTurnRow="' + nturn + '"] select[name="little"]').val(turn.p_littleAtEnd);
			$('[updateTurnRow="' + nturn + '"] select[ismake]').val(turn.ismake);
			$('[updateTurnRow="' + nturn + '"] input[score]').val(turn.score);
		}
		$('button[updateTurn="' + nturn + '"]').click(updateTurn);
	});

	function updateTurn() {
		var nturn = parseInt($(this).attr('updateTurn'));
		var turn = game.playedTurns[nturn];

		var players = [];
		var playersScores = {};
		$('#scores [updateTurnRow="' + nturn + '"] input[type="checkbox"][updateTurnPlayer]:checked').each(function() {
			var p_name = $(this).attr("value");
			players.push(p_name);
			if (turn.type.id == game.types.enculette.id) {
				playersScores[p_name] = {
					score: $('#scores tbody [updateTurnRow="' + nturn + '"] input[score][updatePlayer="' + p_name + '"]').val(),
					ask: $('#scores tbody [updateTurnRow="' + nturn + '"] input[ask][updatePlayer="' + p_name + '"]').is(":checked")
				};
			}
		});

		turn.players = players;
		turn.playersScores = playersScores;

		if (turn.type.id != game.types.enculette.id) {
			turn.p_taker = $('[updateTurnRow="' + nturn + '"] select[name="taker"]').val();
			turn.p_with = $('[updateTurnRow="' + nturn + '"] select[name="with"]').val();
			turn.p_littleAtEnd = $('[updateTurnRow="' + nturn + '"] select[name="little"]').val();
			turn.ismake = $('[updateTurnRow="' + nturn + '"] select[ismake]').val();
			turn.score = $('[updateTurnRow="' + nturn + '"] input[score]').val();
		}

		game.updateTurn(turn, nturn);
	};

	$('#gametypeAdd').click(function() {
		var gametype = $('#gametype').val();
		if (gametype == "null") {
			return;
		}
		$('#gametype').val('null');
		$('#scores tfoot').html("");

		//players row
		var playersRow = "<th>Joueurs du tour</th>"
		for (var i = 0; i < game.orderedPlayers.length; i++) {
			p_name = game.orderedPlayers[i];
			playersRow += "<td><label><input type='checkbox' name='player_" + p_name + "' value='" + p_name + "' turnPlayer/>&nbsp;" + p_name + "</label></td>";
		}
		playersRow = "<tr>" + playersRow + "</tr>";
		$('#scores tfoot').append(playersRow);

		var gamename = "";
		switch (gametype) {
			case game.types.enculette.id:
				gamename = game.types.enculette.label;

				$('#scores tfoot').append(
					"<tr><th colspan='" + (1 + game.nbPlayers) + "'>" + gamename + "&nbsp;<input type='hidden' gametype value='" + gametype + "' />" + "</th></tr>"
				);

				//scores row
				var scoresRow = "<th>Scores</th>";
				for (var i = 0; i < game.orderedPlayers.length; i++) {
					p_name = game.orderedPlayers[i];
					scoresRow += "<td><label><input type='checkbox' ask player='" + p_name + "' disabled/>&nbsp;Demandée</label><br/>" + p_name + "&nbsp;:&nbsp;-&nbsp;<input type='number' player='" + p_name + "' step='1' min='0' max='91' score disabled/>" + "</td>";
				}
				scoresRow = "<tr>" + scoresRow + "</tr>";
				$('#scores tfoot').append(scoresRow);

				break;
			case game.types.petite.id:
			case game.types.pousse.id:
			case game.types.garde.id:
			case game.types.gardesans.id:
			case game.types.gardecontre.id:
			default:
				gamename = game.types[gametype].label;


				var newGameRow = gamename + "&nbsp;";

				//taker
				var optionsSelect = "";
				for (var i = 0; i < game.orderedPlayers.length; i++) {
					p_name = game.orderedPlayers[i];
					optionsSelect += "<option value='" + p_name + "' player='" + p_name + "' disabled>" + p_name + "</option>";
				}
				var takerSelect = "<select name='taker' >" + optionsSelect + "</select>";
				newGameRow += "de&nbsp;" + takerSelect;

				var withSelect = "<select name='with' >" + optionsSelect + "</select>";
				newGameRow += "&nbsp;avec&nbsp;" + withSelect;

				newGameRow += "&nbsp;:&nbsp;<select ismake><option value='1'>faite</option><option value='-1'>chutée</option></select>";
				newGameRow += "&nbsp;de&nbsp;<input type='number' step='1' min='0' max='91' score>";

				var littleSelect = "<select name='little' ><option value='null'>Non</option>" + optionsSelect + "</select>";
				newGameRow += "&nbsp;petit au bout&nbsp;" + littleSelect;

				//if (typemode == "dev")
				{
					var scoreBouts = "<select pointsBouts><option value='0'>0</option><option value='1'>1</option><option value='2'>2</option><option value='3'>3</option></select>";
					var scoreBrut = "<input type='number' step='0.5' max='91' points>";
					var scoreBrutWhoSelect = "<select pointsWho><option value='A'>l'attaque</option><option value='D'>la défense</option></select>";
					newGameRow += "<br/>ou&nbsp;" + scoreBrut + "&nbsp;points&nbsp;et&nbsp;" + scoreBouts + "&nbsp;bouts&nbsp;pour&nbsp;" + scoreBrutWhoSelect;
				}

				newGameRow += "<input type='hidden' gametype value='" + gametype + "' />";
				newGameRow = "<tr><th colspan='" + (1 + game.nbPlayers) + "'>" + newGameRow + "</th></tr>";

				$('#scores tfoot').append(
					newGameRow
				);
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
		$('#validTurn').click(validTurn);
	});

	function validTurn() {
		//get values
		var gametype = $('#scores tfoot input[gametype]').val();
		var ismake = $('#scores tfoot select[ismake]').val();
		var score = $('#scores tfoot input[score]').val();
		var p_taker = $('#scores tfoot select[name="taker"]').val();
		var p_with = $('#scores tfoot select[name="with"]').val();
		var p_little = $('#scores tfoot select[name="little"]').val();

		var players = [];
		var playersScores = {};

		$('#scores input[type="checkbox"][turnPlayer]:checked').each(function() {
			var p_name = $(this).attr("value");
			players.push(p_name);
			if (gametype == game.types.enculette.id) {
				playersScores[p_name] = {
					score: $('#scores tfoot input[score][player="' + p_name + '"]').val(),
					ask: $('#scores tfoot input[ask][player="' + p_name + '"]').is(":checked")
				};
			}
		});


		console.log(p_taker, p_with, score, ismake, gametype, players, playersScores);

		if (gametype != game.types.enculette.id) {
			if (p_taker == null || (players.length > 4 && p_with == null) || score == null || score == "" || gametype == "null" || players.length > 5) {
				return;
			}
		} else {
			if (gametype == "null" || !gametype || players.length > 5) {
				return;
			}
		}

		var turn = new Turn(game.types[gametype], players, p_taker, p_with, ismake, score, p_little, playersScores);
		//transmitt values to game instance
		game.addTurn(turn);

	}
});