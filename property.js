const Signal = require('./signal');

module.exports = Property;

function Property(initialValue, opts) {
	this._value = initialValue;
	this._signal = new Signal(opts);
}

Property.prototype.connect = function(cb) {
	const cancel = this._signal.connect(cb);
	try {
		cb(this._value, null);
	} catch (e) {}
	return cancel;
}

Property.prototype.valueOf = function() {
	return this._value;
}

Property.prototype.get = function() {
	return this._value;
}

Property.prototype.set = function(v) {
	const oldValue = this._value;
	this._value = v;
	this._signal.emit(v, oldValue);
}
