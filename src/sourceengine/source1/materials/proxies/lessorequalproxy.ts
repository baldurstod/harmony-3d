import { DynamicParams } from '../../../../entities/entity';
import { SourceEngineMaterialVariables } from '../source1material';
import { Proxy } from './proxy';
import { ProxyManager } from './proxymanager';

export class LessOrEqualProxy extends Proxy {
	execute(variables: Map<string, SourceEngineMaterialVariables>, proxyParams: DynamicParams, time: number) {
		super.setResult(variables, variables.get(this.getData('srcvar1')));

		const srcVar1 = variables.get(this.getData('srcvar1'));
		const srcVar2 = variables.get(this.getData('srcvar2'));

		if (typeof srcVar1 == 'number' && typeof srcVar2 == 'number') {
			if (srcVar1 <= srcVar2) {
				super.setResult(variables, variables.get(this.getData('lessequalvar')));
			} else {
				super.setResult(variables, variables.get(this.getData('greatervar')));
			}
		} else {
			super.setResult(variables, srcVar1);
		}
	}
}
ProxyManager.registerProxy('LessOrEqual', LessOrEqualProxy);

/*
		"LessOrEqual"
		{
			"srcVar1"		"$glowSineFlashGap"
			"srcVar2"		"$flashMin"
			"resultVar"		"$glowSineFlash"
			"greaterVar"		"$glowSineFlash"
			"LessEqualVar"		"$flashOff"
		}
*/
