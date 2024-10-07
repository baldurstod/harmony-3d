import { ProxyManager } from './proxymanager';
import { Proxy } from './proxy';

export class AnimatedTextureProxy extends Proxy {
	#animatedtexturevar;
	#animatedtextureframenumvar;
	#animatedtextureframerate;
	init() {
		this.#animatedtexturevar = this.datas['animatedtexturevar'];
		this.#animatedtextureframenumvar = this.datas['animatedtextureframenumvar'];
		this.#animatedtextureframerate = this.datas['animatedtextureframerate'];
	}

	execute(variables, proxyParams, time) {
		variables.set(this.#animatedtextureframenumvar, time * this.#animatedtextureframerate);
	}
}
ProxyManager.registerProxy('AnimatedTexture', AnimatedTextureProxy);

/*AnimatedTexture
 Increments the current frame of an animated VTF.

animatedtexturevar
Texture to increment frame for (i.e. $basetexture, $bumpmap, $normalmap (both $bumpmap and $normalmap use $bumpframe))
animatedtextureframenumvar
Frame variable to increment (i.e. $frame, $bumpframe)
animatedtextureframerate
Framerate in frames per second. Fixed; cannot be changed once set.



			'animatedtextureframenumvar' '$frame'
			'animatedtextureframenumvar' '$detailframe'
*/
