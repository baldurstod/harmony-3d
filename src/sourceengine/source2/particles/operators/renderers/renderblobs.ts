import { Metaball } from '../../../../../primitives/metaball';
import { Metaballs } from '../../../../../primitives/metaballs';
import { Source2SpriteCard } from '../../../materials/source2spritecard';
import { Source2ParticleSystem } from '../../export';
import { Source2Particle } from '../../source2particle';
import { OperatorParam } from '../operatorparam';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';
import { RenderBase } from './renderbase';

export class RenderBlobs extends RenderBase {
	#balls: Metaball[] = [];
	#metaballs = new Metaballs();

	constructor(system: Source2ParticleSystem) {
		super(system);
		this.material = new Source2SpriteCard(system.repository);
	}

	_paramChanged(paramName: string, param: OperatorParam): void {
		/*
		cube_width
			This is the density of the matrix through which the blob is meshed. Smaller numbers give higher precision at higher performance cost, while larger number will cause more swimming with movement but at a much cheaper cost.

		cutoff_radius
			The distance at which particles will attempt to connect with other particles to create a continuous mesh. Larger distances are more expensive, should be balanced carefully with cube_width for best performance.

		render_radius
			The visual radius of each particle. Note that this should be kept smaller than the cutoff radius or multiple particles will potentially overlap each other visually, which may cause a variety of visual errors.

		scale CP
			Allows the other visual properties to be scaled via an external Control Point. X = cube_width / Y = cutoff radius / Z = render radius
		*/
		switch (paramName) {
			case 'm_cubeWidth':
				break;
			default:
				super._paramChanged(paramName, param);
		}
	}

	initRenderer(particleSystem: Source2ParticleSystem): void {
		/*this.geometry = new BufferGeometry();
		this.mesh = new StaticMesh(this.geometry, this.material);
		this.mesh.setDefine('HARDWARE_PARTICLES');
		this.#createParticlesTexture();
		this.mesh.setUniform('uParticles', this.texture);

		this.maxParticles = particleSystem.maxParticles;*/
		//this.metaballs = new Metaballs();
		particleSystem.addChild(this.#metaballs);
	}

	updateParticles(particleSystem: Source2ParticleSystem, particleList: Source2Particle[], elapsedTime: number) {
		this.#metaballs.cubeWidth = this.getParamScalarValue('m_cubeWidth') ?? 1;
		const renderRadius = this.getParamScalarValue('m_renderRadius') ?? 1.3;
		const m_cutoffRadius = this.getParamScalarValue('m_cutoffRadius') ?? 3.3;

		const balls = [];

		for (let i = 0; i < Math.min(particleList.length, 500); i++) {
			const particle = particleList[i]!;
			let ball = this.#balls[i];
			if (!ball) {
				ball = new Metaball();
				this.#balls.push(ball);
			}
			ball.setRadius(renderRadius);
			ball.setPosition(particle.position);

			balls.push(ball);
		}

		this.#metaballs.setBalls(balls);
		this.#metaballs.updateGeometry();
	}
}
RegisterSource2ParticleOperator('C_OP_RenderBlobs', RenderBlobs);
