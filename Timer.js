class Timer
{
	history;
	startTime = 0;

	constructor(length)
	{
		this.history = new Array(length).fill(0);
	}

	start()
	{
		this.startTime = performance.now();
	}

	stop()
	{
		this.history.push(performance.now() - this.startTime);
		this.history.shift();
		this.time = this.history.reduce((x, y) => x + y, 0) / this.history.length;
		return this.time;
	}
}