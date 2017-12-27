const Property = require('../property');
const test = require('tape');

test('get initial value', (assert) => {
	const p = new Property(10);
	assert.equal(p.get(), 10);
	assert.end();
});

test('get updated value', (assert) => {
	const p = new Property(10);
	p.set(100);
	assert.equal(p.get(), 100);
	assert.end();
});

test('valueOf', (assert) => {
	const p = new Property(20);
	assert.equal(0 + p, 20);
	assert.end();
});

test('connect', (assert) => {
	const p = new Property(10);
	let out = [];
	p.connect((newVal, oldVal) => out.push(newVal, oldVal));
	assert.deepEqual(out, [10, null]);
	p.set(15);
	assert.deepEqual(out, [10, null, 15, 10]);
	assert.end();
});

test('cancel', (assert) => {
	const p = new Property(10);
	let out = [];
	const cancel = p.connect((newVal, oldVal) => out.push(newVal, oldVal));
	assert.deepEqual(out, [10, null]);
	cancel();
	p.set(15);
	assert.deepEqual(out, [10, null]);
	assert.end();
});
