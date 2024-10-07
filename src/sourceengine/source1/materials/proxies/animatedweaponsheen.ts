import { ProxyManager } from './proxymanager';
import { Proxy } from './proxy';

export class AnimatedWeaponSheen extends Proxy {
	#animatedtexturevar;
	#animatedtextureframenumvar;
	#animatedtextureframerate;
	init() {
		this.#animatedtexturevar = this.datas['animatedtexturevar'];
		this.#animatedtextureframenumvar = this.datas['animatedtextureframenumvar'];
		this.#animatedtextureframerate = this.datas['animatedtextureframerate'];
	}

	execute(variables, proxyParams, time) {
		if (proxyParams['SheenTintColor']) {
			variables.set(this.#animatedtextureframenumvar, time * this.#animatedtextureframerate);
		} else {
			variables.set(this.#animatedtextureframenumvar, 0);
		}
		if (proxyParams['SheenMaskScaleX']) {
			variables.set('$SheenMaskScaleX', proxyParams['SheenMaskScaleX']);
			variables.set('$SheenMaskScaleY', proxyParams['SheenMaskScaleY']);
			variables.set('$SheenMaskOffsetX', proxyParams['SheenMaskOffsetX']);
			variables.set('$SheenMaskOffsetY', proxyParams['SheenMaskOffsetY']);
			variables.set('$SheenMaskDirection', proxyParams['SheenMaskDirection']);
		}
	}
}
ProxyManager.registerProxy('AnimatedWeaponSheen', AnimatedWeaponSheen);

/*AnimatedWeaponSheen
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
