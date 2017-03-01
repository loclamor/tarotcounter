var Player = function(game, name, firstTurn, scorebase) {
	this.game = game;
	this.firstTurn = typeof firstTurn !== 'undefined' ? firstTurn : 0;
	this.name = typeof name !== 'undefined' ? name : "Player";

	this.scores = [];
	this.scorebase = typeof scorebase !== 'undefined' ? parseInt(scorebase) : 0;
	this.score = this.scorebase;
	this.tmp_score = 0;

	//init scores
	for (var t = 0; t < this.firstTurn; t++) {
		this.scores[t] = null;
	}

	this.addTurn = function(score) {
		this.scores.push(score)
		this.score += score;
	};

	this.updateScore = function(turn, score) {
		this.scores[turn] = score;
		this.score = this.scorebase;
		for (var t = 0; t < this.scores.length; t++) {
			this.score += this.scores[t];
		}
	}

	this.renderHearder = function() {
		return "<th>" + this.name + "<div class='pull-right'><span class='label label-warning'>" + this.game.getPlayerRank(this.name) + "</span></th>"
	};

	this.renderRow = function(turn) {
		if (turn == 0) {
			this.tmp_score = this.scorebase;
		}
		var score = this.scores[turn];
		var s_score = "";
		var tmp_score = this.tmp_score;

		if (score === null) {
			s_score = "-";
		} else {
			this.tmp_score += score;
			s_score = tmp_score + (score < 0 ? "&nbsp;-&nbsp;" + (-1 * score) : "&nbsp;+&nbsp;" + score) + "&nbsp;=&nbsp;" + this.tmp_score;
		}
		var tdclass = "";
		var cturn = this.game.playedTurns[turn];
		var labels = ""
		if (cturn.hasPlayed(this.name)) {

			if (cturn.p_taker == this.name) {
				labels += '<span class="label label-primary">' + cturn.type.shortLabel + '</span>';
			}
			if (cturn.p_with == this.name) {
				labels += '<span class="label label-default">*</span>';
			}
			if (cturn.p_littleAtEnd == this.name) {
				labels += '<span class="label label-success">p</span>';
			}
			if (cturn.type.id == this.game.types.enculette.id && cturn.playersScores[this.name] && cturn.playersScores[this.name].ask) {
				labels += '<span class="label label-default">' + cturn.type.shortLabel + '</span>';
			}
			labels = '<div class="pull-left">' + labels + '</div>';
		} else {
			tdclass += " active";
		}
		return "<td class='" + tdclass + "'>" + labels + s_score + "</td>"
	};
};