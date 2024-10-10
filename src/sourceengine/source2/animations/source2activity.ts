export class Source2Activity {
	name;
	weight;
	flags;
	activity;
	constructor(name, weight, flags, activity) {
		this.name = name;
		this.weight = weight;
		this.flags = flags;
		this.activity = activity;

		if (flags != 0) {
			throw 'Check this: flags != 0';
		}
		if (activity != 0) {
			throw 'Check this: activity != 0';
		}
	}
}
