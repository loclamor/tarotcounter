var Turn = function(type, players, p_taker, p_with, ismake, score, p_littleAtEnd, playersScores) {
	this.type = type;
	this.players = players;
	this.p_taker = p_taker;
	this.p_with = p_with;
	this.ismake = ismake;
	this.score = score;
	this.p_littleAtEnd = p_littleAtEnd;
	this.playersScores = playersScores;

	this.hasPlayed = function(p_name) {
		return this.players.indexOf(p_name) >= 0;
	};

};