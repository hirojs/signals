const test = require('tape');
const Signal = require('../signal');

function Test(signals) {
	this._initSignals();
	(signals || []).forEach(s => this._exposeSignal(s));
};

require('../mixin')(Test.prototype);

test('_exposeSignal', (assert) => {
	const t = new Test();
	t._exposeSignal('foo');
	assert.ok(t.foo instanceof Signal);
	assert.equal(t.foo.name, 'foo');
	assert.equal(t.foo.owner, t);
	assert.end();
});

test('getSignal creates a signal when not frozen', (assert) => {
	const t = new Test();
	const foo1 = t.getSignal('foo');
	const foo2 = t.getSignal('foo');
	assert.ok(foo1 instanceof Signal);
	assert.ok(foo1 === foo2);
	assert.end();
});

test('getSignal throws when frozen', (assert) => {
	const t = new Test();
	t._freezeSignals();
	try {
		t.getSignal('moose');
		assert.fail();
	} catch (e) {
		assert.pass('exception thrown');
	}
	assert.end();
});

test('on', (assert) => {
	const t = new Test();
	let value = null;
	const cancel = t.on('foobar', (v) => { value = v; });
	t.getSignal('foobar').emit(100);
	assert.ok(value === 100);
	cancel();
	t.getSignal('foobar').emit(200);
	assert.ok(value === 100);
	assert.end();
});

test('bind - unfrozen, all events', (assert) => {
	const t = new Test();

	let obj = {
		_value: '',
		foo: function() { this._value += 'foo'; },
		bar: function() { this._value += 'bar'; },
		baz: function() { this._value += 'baz'; }
	};

	t.bind(obj);

	t.getSignal('foo').emit();
	t.getSignal('baz').emit();
	t.getSignal('bar').emit();

	assert.equal(obj._value, 'foobazbar');
	assert.end();
});
