var Game = function() {

	this.types = {
		enculette: {
			id: "enculette",
			label: "Enculette",
			shortLabel: "E",
			basevalue: 0,
		},
		petite: {
			id: "petite",
			label: "Petite",
			shortLabel: "Pe",
			basevalue: 10,
		},
		pousse: {
			id: "pousse",
			label: "Pousse",
			shortLabel: "Po",
			basevalue: 20,
		},
		garde: {
			id: "garde",
			label: "Garde",
			shortLabel: "G",
			basevalue: 40,
		},
		gardesans: {
			id: "gardesans",
			label: "Garde-Sans",
			shortLabel: "GS",
			basevalue: 80,
		},
		gardecontre: {
			id: "gardecontre",
			label: "Garde-Contre",
			shortLabel: "GC",
			basevalue: 160,
		},
	}

	this.turnNum = 0;
	this.playedTurns = [];

	this.players = {};
	this.orderedPlayers = [];
	this.nbPlayers = 0;

	this.addPlayer = function(name, place) {
		if (this.players[name]) {
			return false;
		}
		place = typeof place !== 'undefined' ? parseInt(place) : null;
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
		//p.setScore(this.getScoreForNewPlayer()); //@TODO
		this.players[name] = p;
		this.nbPlayers += 1;
		if (place != null) {
			this.orderedPlayers.splice(place, 0, name);
		} else {
			this.orderedPlayers.push(name);
		}
		console.log(this.orderedPlayers);
		this.render();
		return true;
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
	}

	this.getPlayerScoreFromTurn = function(p_name, turn) {
		var scoreBase = parseInt(turn.score) + turn.type.basevalue;
		var p_score = 0
		if (turn.players.indexOf(p_name) >= 0) {
			if (turn.type.id != this.types.enculette.id) {
				if (p_name == turn.p_taker || p_name == turn.p_with) {
					if (turn.players.length < 5) {
						//less than 5 players : the taker is alone
						p_score = scoreBase * (turn.players.length - 1);
					} else {
						//5 players : the taker is with someone
						if (p_name == turn.p_taker) {
							if (p_name == turn.p_with) {
								// the taker equiper can be the taker : the taker is alone
								p_score = scoreBase * 4;
							} else {
								p_score = scoreBase * 2;
							}
						} else {
							//the equiper has a simple score
							p_score = scoreBase;
						}
					}
					p_score = parseInt(turn.ismake) * p_score;
				} else {
					//default count for defenders
					p_score = -1 * parseInt(turn.ismake) * scoreBase;
				}

				//little oudler at the end
				if (turn.p_littleAtEnd && turn.p_littleAtEnd != "null") {
					if (p_name == turn.p_littleAtEnd) {
						p_score += 10 * (turn.players.length - 1);
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
	}

	this.render = function() {
		$("#scores thead").html("");
		$("#scores tbody").html("");
		$('#scores tfoot').html("");
		var hRow = "<th>Joueurs</th>";
		for (var i = 0; i < this.orderedPlayers.length; i++) {
			p_name = this.orderedPlayers[i];
			hRow += this.players[p_name].renderHearder();
		}
		hRow = "<tr>" + hRow + "</tr>";
		$("#scores thead").html(hRow);
		for (var t = 0; t < this.turnNum; t++) {
			var sRow = "<th>Manche " + (t + 1) + " : " + this.playedTurns[t].type.label + "&nbsp;<a href='' updateTurn='" + t + "'><span class='glyphicon glyphicon-pencil' aria-hidden='true' ></span></a></th>";
			for (i = 0; i < this.orderedPlayers.length; i++) {
				p_name = this.orderedPlayers[i];
				sRow += this.players[p_name].renderRow(t);
			}
			sRow = "<tr>" + sRow + "</tr>";
			$("#scores tbody").append(sRow);
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
			return a.score < b.score;
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
};


/**
Nombre de Bouts - Minimum de points
0 - 56
1 - 51
2 - 41
3 - 36

*/