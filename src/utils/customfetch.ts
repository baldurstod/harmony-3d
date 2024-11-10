type FetchFunction = (resource: string | URL | Request, options?: RequestInit) => Promise<Response>;

let fetchFunction: FetchFunction | null = null;

export function setFetchFunction(func: FetchFunction) {
	fetchFunction = func;
}

export async function customFetch(resource: string | URL | Request, options?: RequestInit): Promise<Response> {
	try {
		if (fetchFunction) {
			return await fetchFunction(resource, options);
		} else {
			return await fetch(resource, options);
		}
	} catch (e) {
		console.error('Error during custom fetch: ', e);
		return new Response(null, { status: 400 });
	}
}
