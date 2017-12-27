module.exports = Signal;

const once = require('./private/once');

const NO_OPTS = {};

function Signal(opts) {
	opts = opts || NO_OPTS;
	this.owner = opts.owner || null;
	this.name = opts.name || null;
	this.parent = opts.parent || null;
	this._subs = null;
}

Signal.prototype.clear = function() {
	this._subs = null;
}

Signal.prototype.connect = function(cb, ctx) {
	const subs = (this._subs || (this._subs = []));
	subs.push(cb, ctx || null);
	return once(() => { subs.splice(this._subs.indexOf(cb), 2); });
}

Signal.prototype.connectWithoutCancellation = function(cb, ctx) {
	(this._subs || (this._subs = [])).push(cb, ctx || null);
}

Signal.prototype.disconnect = function(cb, ctx) {
	ctx = ctx || null;
	for (let ix = 0; ix < this._subs.length; ix += 2) {
		if (this._subs[ix] === cb && this._subs[ix+1] === ctx) {
			this._subs.splice(ix, 2);
			return true;
		}
	}
	return false;
}

Signal.prototype.emit = function() {
	if (this._subs === null) return;
	for (let ix = this._subs.length - 2; ix >= 0; ix -= 2) {
	    this._subs[ix].apply(this._subs[ix+1], arguments);
	}
	if (this.parent) {
	    this.parent.emitArray(arguments);
	}
}

Signal.prototype.emitArray = function(args) {
	if (this._subs === null) return;
    for (let ix = this._subs.length - 2; ix >= 0; ix -= 2) {
        this._subs[ix].apply(this._subs[ix+1], args);
    }
    if (this.parent) {
        this.parent.emitArray(args);
    }
}
