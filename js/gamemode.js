var Gamemode = function(id) {

	// init
	this.id = id;

	// other props
	switch (id) {
		case "tarot":
			this.label = "Tarot";
			this.with = false;
			this.and = false;
			this.minPlayer = 2;
			this.maxPlayer = 4;
			this.bouts = 3;
			this.scoreMax = 91;
			this.contrats = {
				0: 56,
				1: 51,
				2: 41,
				3: 36
			};
			this.rules = {
				2: new Moderule(2, null, 8, 6, 0),
				3: new Moderule(3, 5, 24, 0),
				4: new Moderule(4, 4, 18, 6, 0)
			};
			break;
		case "tarotA5":
			this.label = "Tarot à 5";
			this.with = true;
			this.and = false;
			this.minPlayer = 5;
			this.maxPlayer = 5;
			this.bouts = 3;
			this.scoreMax = 91;
			this.contrats = {
				0: 56,
				1: 51,
				2: 41,
				3: 36
			};
			this.rules = {
				5: new Moderule(5, 3, 15, 3, 0),
			};
			break;
		case "tagrot":
			this.label = "Tagrot";
			this.with = true;
			this.and = true;
			this.minPlayer = 6;
			this.maxPlayer = 10;
			this.bouts = 6;
			this.scoreMax = 182;
			this.contrats = {
				0: 112,
				1: 107,
				2: 102,
				3: 92,
				4: 82,
				5: 77,
				6: 72
			};
			this.rules = {
				6: new Moderule(6, 5, 26, 0, 0),
				7: new Moderule(7, 5, 21, 5, 4),
				8: new Moderule(8, 4, 19, 4, 0),
				9: new Moderule(9, 4, 17, 3, 0),
				10: new Moderule(10, 3, 15, 6, 0),
			};
			break;
		default:
			break;
	}

	this.renderRules = function() {
		// loop on rules
		var rules = "";
		$.each(this.rules, function(idx, rule) {
			rules = rules + "à " + rule.nbplayer + " joueurs : ";
			if (rule.cancel !== null) {
				rules = rules + rule.cancel + " cartes pour annuler"
			} else {
				rules = rules + "pas d'annulation";
			}
			rules = rules + ", " + rule.cards + " cartes";
			rules = rules + ", " + rule.dog + " cartes au chien";
			if (rule.remove > 0) {
				rules = rules + ", " + rule.remove + " cartes à enlever";
			}
			rules = rules + "<br/>";
		});
		return rules;
	};
};