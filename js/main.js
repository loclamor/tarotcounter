$(document).ready(function() {
	// init
	var game = new Game();
	window.game = game;
	var _this = this;
	this.usualPlayers = ["XPT", "LFR", "JSL", "FLI", "AMT", "SVG", "MBO", "PPT", "BGY", "AAO"];

	// run mode
	var runmode = window.location.hash.slice(1);
	if (typeof runmode == "undefined" || runmode == null || runmode == "null" || runmode == "") {
		runmode = "prod";
	}

	if (runmode == "dev") {

		for (var j = 1; j < 11; j++) {
			game.addPlayer("J" + j);
		}

		//add some turns

		// manche 1
		var players = {
			"J1": game.players["J1"],
			"J2": game.players["J2"],
			"J3": game.players["J3"],
			"J4": game.players["J4"],
		}
		var turn = new Turn(game.types["petite"], players, "J1", null, null, "1", 10, "null", null, game.modes);
		game.addTurn(turn);

		// manche 2
		players = {
			"J2": game.players["J2"],
			"J3": game.players["J3"],
			"J4": game.players["J4"],
			"J5": game.players["J5"],
			"J6": game.players["J6"],
		}
		var turn = new Turn(game.types["pousse"], players, "J2", "J3", null, "1", 20, "null", null, game.modes);
		game.addTurn(turn);

		// manche 3
		players = {
			"J1": game.players["J1"],
			"J3": game.players["J3"],
			"J4": game.players["J4"],
			"J5": game.players["J5"],
			"J6": game.players["J6"],
		}
		var turn = new Turn(game.types["enculette"], players, "null", null, "null", "1", 0, "null", {
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
				ask: true,
				score: 50
			}
		}, game.modes);
		game.addTurn(turn);

		// manche 4
		players = {
			"J1": game.players["J1"],
			"J2": game.players["J2"],
			"J4": game.players["J4"],
			"J5": game.players["J5"],
			"J6": game.players["J6"],
		}
		var turn = new Turn(game.types["garde"], players, "J5", "J4", null, "1", 10, "J4", null, game.modes);
		game.addTurn(turn);

		// manche 5
		players = {
			"J1": game.players["J1"],
			"J2": game.players["J2"],
			"J4": game.players["J4"],
			"J5": game.players["J5"],
			"J6": game.players["J6"],
			"J7": game.players["J7"],
			"J8": game.players["J8"],
		}
		var turn = new Turn(game.types["pousse"], players, "J7", "J8", "J2", "1", 30, null, null, game.modes);
		game.addTurn(turn);

		// re-render
		game.render();

	} else {
		$(".devmode").hide();
	}
	if (runmode == "users") {
		$.each(this.usualPlayers, function(idx, p) {
			game.addPlayer(p);
		});
	}

	// build turns types
	game.buildTurntypesSelect("#turntype");

	// build modes table
	game.buildModesTable($("#modes"));

	// build contracts table
	game.buildRulesTable($("#rules"));

	// update !
	game.updateDisplayForNextTurn();

	//IHM event callbacks
	$('#addPlayerModal').on('show.bs.modal', function(e) {
		_this.showModal($(this), true);
	});

	//IHM event callbacks
	$('#editPlayerModal').on('show.bs.modal', function(e) {
		_this.showModal(e.relatedTarget, false);
	});

	this.showModal = function(clicked, doAdd) {

		// init
		var modal = $("#editPlayerModal");
		if (doAdd) {
			modal = $("#addPlayerModal");
		}
		var game = window.game;

		//init values
		var name = $(clicked).attr("name");
		if (doAdd) {
			name = ""
		}
		modal.find('#newUsername').val(name);
		modal.find('#oldUsername').val(name);
		modal.find('.modal-messages').html("");

		// init select
		playersSelect = "";
		for (var i = 0; i < game.orderedPlayers.length; i++) {
			p_name = game.orderedPlayers[i];
			var selected = "";
			if ((i + 1) == game.orderedPlayers.length) {
				selected = 'selected';
			}
			var disabled = "";
			if (p_name == name) {
				disabled = "disabled";
			}
			playersSelect += "<option value='" + (i + 1) + "' " + selected + " " + disabled + ">" + p_name + "</option>";
		}
		modal.find('#newUserPlace').html(playersSelect);
	};

	$('#addPlayerModal').on('shown.bs.modal', function(e) {
		$('#newUsername').focus();
	});
	$('#editPlayerModal').on('shown.bs.modal', function(e) {
		$('#newUsername').focus();
	});

	$("#newUsername").enterKey(function() {
		$('#addPlayerButton').click();
	});

	$('#addPlayerButton').click(function() {
		_this.modalPlayerValidation($(this), true);
	});
	$('#editPlayerButton').click(function() {
		_this.modalPlayerValidation($(this), false);
	});

	this.modalPlayerValidation = function(clicked, doAdd) {

		var modal = $("#editPlayerModal");
		if (doAdd) {
			modal = $("#addPlayerModal");
		}
		var game = window.game;

		// get values
		var oldPlayer = $(modal).find('#oldUsername').val();
		var newPlayer = $(modal).find('#newUsername').val();
		var place = $(modal).find('#newUserPlace').val();
		if (newPlayer.length < 3) {
			modal.find('.modal-messages').html("Le nom d'un joueur doit faire au moins 3 caractères !");
			return;
		}

		// add or edit !
		var result = null;
		try {

			if (doAdd) {
				result = game.addPlayer(newPlayer, place);
			} else {
				result = game.editPlayer(oldPlayer, newPlayer, place);
			}

			//dismiss modal
			$(modal).modal('hide');
			game.updateDisplayForNextTurn();

		} catch (e) {
			modal.find('.modal-messages').html(e);
		}
	};

	this.playerCheckboxOnClick = function(clicked, isnextturn) {

		try {
			var p_name = $(clicked).attr("value");
			var checked = $(clicked).is(":checked");
			var selector = '[player="' + p_name + '"]';
			var nturn = null;
			if (!isnextturn) {
				nturn = parseInt($(clicked).closest('tr').attr('updateTurnRow'));
				selector = '[updateTurnRow="' + nturn + '"] [updatePlayer="' + p_name + '"]';
			}

			if (checked) {
				$(selector).removeAttr("disabled");
				$(clicked).parents("td").removeClass("info");
				$(selector).parents("td").removeClass("info");
			} else {
				$(selector).attr("disabled", "disabled");
				$(clicked).removeAttr("disabled");
				$(clicked).parents("td").addClass("info");
				$(selector).parents("td").addClass("info");
			}

			if (isnextturn) {
				game.setPlayerActivation(p_name, checked);
				game.updateDisplayForNextTurn();
			} else {
				var turn = game.playedTurns[nturn];
				turn.setPlayerActivation(p_name, checked);
				turn.updateDisplay(nturn);
			}
			return true;
		} catch (e) {
			alert(e);
			return false;
		}
	};

	$("#scores tfoot").on("click", 'input[type="checkbox"][turnPlayer]', function() {
		return _this.playerCheckboxOnClick($(this), true);
	});

	$("#scores tbody").on("click", 'input[type="checkbox"][updateTurnPlayer]', function() {
		return _this.playerCheckboxOnClick($(this), false);
	});

	$("#scores tfoot").on("keyup", "input[points]", function() {
		return _this.updateScoreFromPoints()
	});
	$("#scores tfoot").on("change", "select[pointsWho]", function() {
		return _this.updateScoreFromPoints()
	});
	$("#scores tfoot").on("change", "select[pointsBouts]", function() {
		return _this.updateScoreFromPoints()
	});

	this.updateScoreFromPoints = function() {
		console.log('update score !');
		var pointsAttaqueTable = [56, 51, 41, 36];
		var pointsDefenceTable = [55, 50, 40, 35];

		// init
		var mode = window.game.nextturn.getMode();
		var score = 0;

		// score for atack
		var nbbouts = parseInt($("select[pointsBouts]").val());
		var points = parseFloat($("input[points]").val());

		// may be score is for defense ?
		if ($("select[pointsWho]").val() == "D") {
			nbbouts = mode.bouts - nbbouts;
			points = mode.scoreMax - points;
		}

		// score for atack
		var contractAttack = mode.contrats[nbbouts];
		var scoreAttack = points - contractAttack;
		var score = scoreAttack;

		// update display
		console.log("score =", score);
		if (score >= 0) {
			//score = Math.floor((score + 5) / 10) * 10;
			console.log("fait de", score);
			$('input[score]').val(score);
			$("select[ismake]").val("1");
		} else {
			//score = Math.floor((score + 5) / 10) * 10;
			console.log("chute de", score);
			$('input[score]').val(-1 * score);
			$("select[ismake]").val("-1");
		}
	}

	//$("#scores tbody").on("keypress", "input[score]", updatePointsFromScore);

	$("#scores").on("click", 'a[updateTurn]', function(e) {

		e.preventDefault();
		if ($(this).closest("tr").hasClass('updating')) {
			alert("Pas besoin de cliquer 10 fois, t'es déjà en train de le modifier !")
			return;
		}
		var nturn = parseInt($(this).attr('updateTurn'));
		var turn = game.playedTurns[nturn];
		var updateRow = "";

		renderer = new TurnRenderer(window.game.orderedPlayers, nturn, turn);
		renderer.renderEdit();
	});

	$('#turntypeAdd').click(function() {
		try {
			game.addNextturn();
		} catch (e) {
			//alert(e);
		}
	});

});