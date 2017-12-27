const Signal = require('../signal');
const test = require('tape');

test('connect/emit', (assert) => {
	const s = new Signal();
	let t, u;
	s.connect((a, b) => { t = a; u = b; });
	s.emit(1, 2);
	assert.equal(t, 1);
	assert.equal(u, 2);
	assert.end();
});

test('connect/emitArray', (assert) => {
	const s = new Signal();
	let t, u;
	s.connect((a, b) => { t = a, u = b; });
	s.emitArray([10, 20]);
	assert.equal(t, 10);
	assert.equal(u, 20);
	assert.end();
});

test('connect with context', (assert) => {
	const s = new Signal();
	const obj = {x: 0, inc: function() { this.x++; }};
	s.connect(obj.inc, obj);
	s.emit();
	assert.equal(obj.x, 1);
	assert.end();
});

test('connectWithoutCancellation', (assert) => {
	const s = new Signal();
	let t, u;
	s.connectWithoutCancellation((a, b) => { t = a; u = b; });
	s.emit(1, 2);
	assert.equal(t, 1);
	assert.equal(u, 2);
	assert.end();
});

test('disconnect', (assert) => {
	const s = new Signal();
	let t = 0;
	let cb1 = () => t += 1;
	let cb2 = () => t += 2;

	s.connect(cb1);
	s.connect(cb2);
	
	s.emit();
	assert.equal(t, 3);

	s.disconnect(cb2)
	s.emit();
	assert.equal(t, 4);

	s.disconnect(cb1);
	s.emit();
	assert.equal(t, 4);
	
	assert.end();
});

test('parent chain', (assert) => {
	const p = new Signal();
	const c = new Signal({parent: p});

	let out = [];
	p.connect((a, b) => out.push(a, b));
	c.connect((a, b) => out.push(b + 1, a + 1));

	c.emit(5, 10);

	assert.deepEqual(out, [11, 6, 5, 10]);
	assert.end();
});

test('clear', (assert) => {
	const s = new Signal();
	let t = false;
	s.connect(() => t = true);
	s.clear();
	s.emit();
	assert.notOk(t);
	assert.end();
});

test('cancel', (assert) => {
	const s = new Signal();
	let t = 0;
	const cancel1 = s.connect(() => t += 1);
	const cancel2 = s.connect(() => t += 2);
	
	s.emit();
	assert.equal(t, 3);

	cancel2();
	s.emit();
	assert.equal(t, 4);

	cancel1();
	s.emit();
	assert.equal(t, 4);
	
	assert.end();
});