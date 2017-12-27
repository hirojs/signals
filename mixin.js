const Signal = require('./signal');
const Property = require('./property');
const once = require('./private/once');

const FROZEN = Symbol('frozen');

module.exports = function(target) {
    for (let k in Mixin) {
        target[k] = Mixin[k];
    }
}

const Mixin = {
	on: function(signalName, callback) {
	    return this.getSignal(signalName).connect(callback);
	},

    bind: function(object, events) {
    	const attached = [];
    	
    	events = events || Object.keys(object);
    	const isFrozen = this._signals[FROZEN];
    	for (let ix = 0; ix < events.length; ++ix) {
    		const ev = events[ix];
    		const signal = isFrozen ? this._signals[ev] : this.getSignal(ev);
    		if (signal) {
    			const handler = object[ev];
    			signal.connectWithoutCancellation(handler, object);
    			attached.push(signal, handler);
    		}
    	}

    	events = null;

    	return once(() => {
    		for (let ix = 0; ix < attached.length; ix += 2) {
    			attached[ix].disconnect(attached[ix+1], object);
    		}
    		attached = object = null;
    	});
    },

    getSignal: function(name) {
        let sig = this._signals[name];
        if (!sig) {
            if (this._signals[FROZEN]) {
                throw new Error("can't add a new signal, signals are frozen");
            }
            sig = new Signal({owner: this, name: name});
            this._signals[name] = sig;
        }
        return sig;
    },

    _initSignals: function() {
        this._signals = {};
    },

    _exposeSignal: function(name) {
        this[name] = this.getSignal(name);
    },

    _freezeSignals: function() {
        this._signals[FROZEN] = true;
    },
};