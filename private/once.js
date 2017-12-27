module.exports = function(cb) {
	let called = false;
	return () => {
		if (called) return;
		called = true;
		cb();
	}
};