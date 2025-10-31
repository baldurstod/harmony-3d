import { DynamicParams } from '../../../../entities/entity';
import { Source1MaterialVariables } from '../source1material';
import { Proxy } from './proxy';
import { ProxyManager } from './proxymanager';

export class AnimatedWeaponSheen extends Proxy {// TODO: extend AnimatedTexture proxy
	#animatedtexturevar = '';
	#animatedtextureframenumvar = '';
	#animatedtextureframerate = 1;
	static frameRate = 25;

	init() {
		this.#animatedtexturevar = this.datas['animatedtexturevar'];
		this.#animatedtextureframenumvar = this.datas['animatedtextureframenumvar'];
		this.#animatedtextureframerate = this.datas['animatedtextureframerate'];
	}

	execute(variables: Map<string, Source1MaterialVariables>, proxyParams: DynamicParams, time: number) {
		if (proxyParams['SheenTintColor']) {
			// Notice: the game ignore the material frame rate parameter and uses a convar instead
			variables.set(this.#animatedtextureframenumvar, time * AnimatedWeaponSheen.frameRate/*this.#animatedtextureframerate*/);
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
