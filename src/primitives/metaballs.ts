import { Metaball } from './metaball';
import { MetaballsBufferGeometry } from './geometries/metaballsbuffergeometry';
import { MeshBasicMaterial } from '../materials/meshbasicmaterial';
import { Mesh } from '../objects/mesh';

export class Metaballs extends Mesh {
	cubeWidth: number;
	#balls: Metaball[] = [];
	constructor(material = new MeshBasicMaterial(), cubeWidth = 1) {
		super(new MetaballsBufferGeometry(), material);

		/*this.setGeometry(new MetaballsBufferGeometry());
		this.setMaterial(material);*/
		this.cubeWidth = cubeWidth;

	}

	addBall(ball = new Metaball()) {
		this.#balls.push(ball);
		this.addChild(ball);
		this.updateGeometry();
		return ball;
	}

	setBalls(balls: Metaball[]) {
		this.#balls = balls;
	}

	updateGeometry() {
		(this.geometry as MetaballsBufferGeometry).updateGeometry(this.#balls, this.cubeWidth);
	}

	buildContextMenu() {
		return Object.assign(super.buildContextMenu(), {
			Metaballs_1: null,
			add_ball: { i18n: '#add_ball', f: () => { this.addBall(); } },
			cube_width: { i18n: '#cube_width', f: () => { const cubeWidth = prompt('Cube width', String(this.cubeWidth)); if (cubeWidth) { this.cubeWidth = Number(cubeWidth); } } }
		});
	}
}
