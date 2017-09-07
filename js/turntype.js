var Turntype = function(id, label, shortLabel, basevalue, isenculette) {

	this.id = id;
	this.label = label;
	this.shortLabel = shortLabel;
	this.basevalue = basevalue;
	this.isenculette = isenculette

	this.isEnculette = function() {
		return this.isenculette;
	}

};