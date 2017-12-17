exports.Signal = Signal;

const FROZEN = Symbol('frozen');

exports.mixin = function(ctor) {
    for (let k in Mixin) {
        ctor.prototype[k] = Mixin[k];
    }
}

function Signal(owner, name, parent) {
    this.owner = owner;
    this.name = name;
    this._subs = [];
    this._parent = parent;
}

Signal.prototype.connect = function(cb) {
    this._subs.push(cb);
    let removed = false;
    return () => {
        if (removed) return;
        removed = true;
        this._subs.splice(this._subs.indexOf(cb), 1);
    }
}

Signal.prototype.emit = function() {
    for (let ix = 0; ix < this._subs.length; ++ix) {
        this._subs[ix].apply(null, arguments);
    }
    if (this._parent) {
        this._parent.emitArray(arguments);
    }
}

Signal.prototype.emitArray = function(args) {
    for (let ix = 0; ix < this._subs.length; ++ix) {
        this._subs[ix].apply(null, args);
    }
    if (this._parent) {
        this._parent.emitArray(args);
    }
}

// TODO: bind, unbind, once

const Mixin = {
    _initSignals: function() {
        this._signals = {};
    },
    _addSignal: function(name) {
        this[name] = this.getSignal(name);
    },
    _freezeSignals: function() {
        this._signals[FROZEN] = true;
    },
    on: function(signal, callback) {
        return this.getSignal(signal).connect(callback);
    },
    getSignal: function(name) {
        let sig = this._signals[name];
        if (!sig) {
            if (this._signals[FROZEN]) {
                throw new Error("can't add a new signal, signals are frozen");
            }
            sig = new Signal(this, name);
            this._signals[name] = sig;
        }
        return sig;
    }
};