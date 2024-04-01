importScripts('nsfwjs/browser/tf.min.js');
importScripts('nsfwjs/browser/nsfwjs.min.js');

onmessage = e => {
	fetch(e.data).then(res => res.blob()).then(async (res) => {
		const bitmap = await createImageBitmap(res);
		const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
		const context = canvas.getContext('2d');
		context.drawImage(bitmap, 0, 0);
		const img = context.getImageData(0, 0, bitmap.width, bitmap.height);

		// noinspection JSUnresolvedReference
		tf.setBackend('cpu');
		// noinspection JSUnresolvedReference
		tf.enableProdMode();

		// noinspection JSUnresolvedReference
		nsfwjs.load('nsfwjs/models/inception_v3/model.json', { size: 299 }).then(model => {
			// noinspection JSUnresolvedReference
			model.classify(img, 1).then(predictions => {
				if (predictions[0] && predictions[0].className) {
					if (predictions[0].className === 'Neutral' || predictions[0].className === 'Drawing') {
						postMessage(true);
					} else {
						postMessage(false);
					}
				}
			});
		});
	});
}