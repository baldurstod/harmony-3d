//TODOv3 replace XMLHttpRequest with fetch


export function BinaryAsyncRangeRequest(url, firstByte?, byteLength?) {
	let promise = new Promise(function (resolve, reject) {
		let xhr = new XMLHttpRequest();
		xhr.open('GET', url, true);
		xhr.overrideMimeType('text\/plain; charset=x-user-defined');

		if ((firstByte !== undefined) && (byteLength !== undefined)) {
			let lastByte = firstByte + byteLength - 1;
			xhr.setRequestHeader('Range', 'bytes=' + firstByte + '-' + lastByte);// ==> 206
		}

		xhr.onload = function (e) {
			if (xhr.readyState === 4) {
				if (xhr.status === 200 || xhr.status === 0) {
					let length = xhr.responseText.length;
					resolve([xhr.responseText, 0, length - 1, length]);
				} else if (xhr.status === 206) {
					let contentRange = xhr.getResponseHeader('Content-Range');
					let result = /bytes (\d*)\-(\d*)\/(\d*)/.exec(contentRange);

					if (result) {
						let firstByte = Number(result[1]);
						let lastByte = Number(result[2]);
						let totalBytes = Number(result[3]);
						resolve([xhr.responseText, firstByte, lastByte - firstByte + 1, totalBytes]);
					} else {
						resolve([xhr.responseText]);
					}
				} else {
					reject(null);
				}
			}
		};
		xhr.onerror = function (e) {
			reject(null);
		};
		xhr.send(null);
	});
	return promise;
}
