import { Path } from '../math/curves/path';
import { generateRandomUUID } from '../math/functions';

export class Shape extends Path {
	uuid = generateRandomUUID();
	type = 'Shape';
	holes: Path[] = [];

	getPointsHoles(divisions: number) {
		const holesPts = [];
		for (let i = 0, l = this.holes.length; i < l; i++) {
			holesPts[i] = this.holes[i]!.getPoints(divisions);
		}
		return holesPts;
	}

	// get points of shape and holes (keypoints based on segments parameter)
	extractPoints(divisions: number) {
		return {
			shape: this.getPoints(divisions),
			holes: this.getPointsHoles(divisions)
		};
	}
	/*
		copy(source) {

			super.copy(source);

			this.holes = [];

			for (let i = 0, l = source.holes.length; i < l; i++) {

				const hole = source.holes[i];

				this.holes.push(hole.clone());

			}

			return this;

		}
			*/
	/*
		toJSON() {

			const data = super.toJSON();

			data.uuid = this.uuid;
			data.holes = [];

			for (let i = 0, l = this.holes.length; i < l; i++) {

				const hole = this.holes[i];
				data.holes.push(hole.toJSON());

			}

			return data;

		}
			*/
	/*
		fromJSON(json: JSONObject) {

			super.fromJSON(json);

			this.uuid = json.uuid;
			this.holes = [];

			for (let i = 0, l = json.holes.length; i < l; i++) {

				const hole = json.holes[i];
				this.holes.push(new Path().fromJSON(hole));

			}

			return this;

		}
	*/

}
