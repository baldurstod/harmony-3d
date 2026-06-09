import { Skeleton } from '../objects/skeleton';

export interface HasSkeleton {
	hasSkeleton: true;
	skeleton: Skeleton | null;//TODO: remove null |undefined
}
