/**
 * /*
 * Paint.js
 * by M J Livesey ©2021 Polymathic Design
 *
 * import createPolymathicPaint
 * returns an truncated instance of $PolymathicPaint class with certain properties and methods privatized
 *
 * @format
 */

console.log('Paint.js by M J Livesey ©2021 Polymathic Design');

const $paintPrivate = {};
const instances = {};

const createPolymathicPaint = () => {
	let guid = `${Math.floor(Math.random() * 1e8).toString(36)}-${Math.floor(Math.random() * 1e8).toString(36)}`;
	instances[guid] = new $PolymathicPaint(guid);
	let inst = instances[guid];
	document.addEventListener('mousemove', inst);
	document.addEventListener('mouseup', inst);
	return {
		addCanvas: inst.addCanvas,
		removeCanvas: inst.removeCanvas,
		setCanvasSize: inst.setCanvasSize,
		setActiveCanvas: inst.setActiveCanvas,
		addBrush: inst.addBrush,
		setToolType: inst.setToolType,
		setActiveBrush: inst.setActiveBrush,
		getActiveBrushIndex: inst.getActiveBrushIndex,
		getBrushProperties: inst.getBrushProperties,
		setBrushProperties: inst.setBrushProperties,
		getBrushCount: inst.getBrushCount,
		guid: guid
	};
};

/**
 * @private
 * @description
 * CONSTRUCTOR METHOD
 * NOTE - all properties remain private
 * @param {Number} guid
 */
function $PolymathicPaint(guid) {
	this.canvasArray = [];
	this.canvasRect = undefined;
	this.ctx = undefined;
	this.activeCanvas = -1;
	this.offscreenCanvas1 = document.createElement('canvas');
	this.offscreenCanvas2 = document.createElement('canvas');
	this.ctxOffscreen1 = this.offscreenCanvas1.getContext('2d');
	this.ctxOffscreen2 = this.offscreenCanvas2.getContext('2d');
	this.selectedPaletteColour = '#0ff';
	this.brushes = [];
	this.selectedTool = 'spray';
	this.activeBrush = -1;
	this.guid = guid;
	this.isToolActive = false;
	this.sX = 0;
	this.sY = 0;
	this.throttleInterval = undefined;
}

/**
 * @public
 * @description
 * assigns a new canvas to the paint instance
 * creates a guid for the canvas, sets it to the DOM attribute canvas-guid
 * returns guid
 * @param {Object} canvas
 * @returns {String}
 */
$PolymathicPaint.prototype.addCanvas = function (canvas) {
	let inst = instances[this.guid];
	let guid = `${Math.floor(Math.random() * 1e8).toString(36)}-${Math.floor(Math.random() * 1e8).toString(36)}`;
	canvas.setAttribute('canvas-guid', guid);
	inst.canvasArray.push({ canvas: canvas, guid: guid });
	inst.activeCanvas = inst.canvasArray.length - 1;
	inst.ctx = inst.canvasArray[inst.activeCanvas].canvas.getContext('2d');
	inst.setCanvasSize(canvas);
	canvas.addEventListener('mousedown', inst);
	return guid;
};

/**
 * @public
 * @description
 * removes a canvas object
 * if no guid is provided removes te current active canvas
 * @param {String} canvasGuid
 */
$PolymathicPaint.prototype.removeCanvas = function (canvasGuid) {
	let inst = instances[this.guid];
	let canvasIndex = canvasGuid ? inst.canvasArray.findIndex((v) => v.guid === canvasGuid) : inst.activeCanvas;
	if (inst.canvasArray[canvasIndex] != undefined) {
		let canvas = inst.canvasArray[canvasIndex].canvas;
		canvas.removeEventListener('mousedown', inst);
		if (canvasIndex === inst.activeCanvas) {
			inst.canvasRect = undefined;
			inst.ctx = undefined;
			inst.activeCanvas = -1;
		}
		inst.canvasArray.splice(canvasIndex, 1);
	}
};

/**
 * @public
 * @description
 * sets the active canvas, based on canvas guid provided
 * sets the current canvas context to the new canvas
 * sets offscreen canvas sizes to the new canvas
 * @param {String} canvasGuid
 */
$PolymathicPaint.prototype.setActiveCanvas = function (canvasGuid) {
	let inst = instances[this.guid];
	let canvasIndex = inst.canvasArray.findIndex((v) => v.guid === canvasGuid);
	if (inst.canvasArray[canvasIndex] != undefined) {
		inst.activeCanvas = canvasIndex;
		inst.ctx = inst.canvasArray[inst.activeCanvas].canvas.getContext('2d');
		inst.setCanvasSize(inst.canvasArray[inst.activeCanvas].canvas);
	}
};

/**
 * @public
 * @description
 * sets the canvas size of the specified canvas index to a DOM target
 * if no canvasGuid is provided sets the activeCanvas index
 * if setting the activeCanvas size, set offscreen canvases to same size
 * TODO - add pixel density
 * @param {Object} target
 * @param {String} canvasGuid
 */
$PolymathicPaint.prototype.setCanvasSize = function (target, canvasGuid) {
	let inst = instances[this.guid];
	let rect = target.getBoundingClientRect();
	let canvasIndex = canvasGuid ? inst.canvasArray.findIndex((v) => v.guid === canvasGuid) : inst.activeCanvas;
	if (inst.canvasArray[canvasIndex] == undefined) return null;

	let canvas = inst.canvasArray[canvasIndex].canvas;
	if (canvas == undefined) return null;
	canvas.width = rect.width;
	canvas.height = rect.height;
	if (canvasIndex === inst.activeCanvas) {
		inst.offscreenCanvas1.width = rect.width;
		inst.offscreenCanvas1.height = rect.height;
		inst.offscreenCanvas2.width = rect.width;
		inst.offscreenCanvas2.height = rect.height;
		inst.canvasRect = rect;
		//return Object.assign({}, rect);
	}
};

/**
 * @public
 * @description
 * sets the current tool type - paint/spray/eraser/pen/fill
 * @param {String} toolType
 */
$PolymathicPaint.prototype.setToolType = function (toolType) {
	let inst = instances[this.guid];
	inst.selectedTool = toolType;
};

/**
 * @public
 * @description
 * adds a brush to the instance brush array object
 * sets the brush image
 * @param {String} url
 * @param {Number} w optional
 * @param {Number} h optional
 * @param {String} colour optional
 * @param {Number} opacity optional
 */
$PolymathicPaint.prototype.addBrush = function (url, colour = '#0ff', w = 50, h = 50, opacity = 1) {
	let inst = instances[this.guid];
	let brushImage = new Image();
	brushImage.src = url;
	let id = inst.brushes.length;
	inst.brushes.push({
		canvas: document.createElement('canvas'),
		image: brushImage,
		ctx: undefined,
		width: w,
		height: h,
		w2: w / 2,
		h2: h / 2,
		colour: colour,
		opacity: opacity,
		id: id
	});
	let brush = inst.brushes[id];
	brush.ctx = brush.canvas.getContext('2d');
	brushImage.onload = () => inst.setBrushCanvas(id);
};

/**
 * @public
 * @description
 * sets the active brush to brushIndex and returns the brushProperties for brush
 * if no such brush exists returns null
 * @param {Number} brushIndex
 * @returns
 */
$PolymathicPaint.prototype.setActiveBrush = function (brushIndex) {
	let inst = instances[this.guid];
	if (inst.brushes[brushIndex] != undefined) {
		inst.activeBrush = brushIndex;
		return inst.getBrushProperties();
	}
	return null;
};

/**
 * @public
 * @description
 * returns the index of the active brush
 * @returns {Number}
 */
$PolymathicPaint.prototype.getActiveBrushIndex = function () {
	let inst = instances[this.guid];
	return inst.activeBrush;
};

/**
 * @public
 * @description
 * returns a copy of the brush properties for brushIndex
 * if no brush index is given, returns the brush properties for the active brush
 * if no valid brush exists, returns null
 * @returns {Obejct}
 */
$PolymathicPaint.prototype.getBrushProperties = function (brushIndex) {
	//TODO do not return all brush properties??? canvas/image/ctx etc
	let inst = instances[this.guid];
	if (brushIndex == undefined) brushIndex = inst.activeBrush;
	if (inst.brushes[brushIndex] == undefined) return null;
	else {
		let brush = inst.brushes[brushIndex];
		let result = { width: brush.width, height: brush.height, opacity: brush.opacity, colour: brush.colour, id: brush.id };
		return result;
	}
};

/**
 * @public
 * @description
 * returns the current brush count
 * @returns {Number}
 */
$PolymathicPaint.prototype.getBrushCount = function () {
	let inst = instances[this.guid];
	return inst.brushes.length;
};

/**
 * @public
 * @description
 * sets the brush properties for the brush at brushIndex
 * if no brush exists, method fails silently
 * @param {Number} brushIndex
 * @param {Object} propertiesObject
 * @returns {Void(0)}
 */
$PolymathicPaint.prototype.setBrushProperties = function (brushIndex, propertiesObject) {
	let inst = instances[this.guid];
	if (inst.brushes[brushIndex] == undefined) return;
	Object.assign(inst.brushes[brushIndex], propertiesObject);
	inst.brushes[brushIndex].w2 = inst.brushes[brushIndex].width / 2;
	inst.brushes[brushIndex].h2 = inst.brushes[brushIndex].height / 2;
	inst.setBrushCanvas(brushIndex);
};

/**
 * DESTRUCTOR
 */
$PolymathicPaint.prototype.destroy = function () {
	let inst = instances[this.guid];
	for (let item of inst.canvasArray) {
		item.canvas.removeEventListener('mousedown', inst);
	}
	document.removeEventListener('mousemove', inst);
	document.removeEventListener('mouseup', inst);
	delete instances[inst];
};

//PRIVATE CLASS METHODS

/**
 * @private
 * @description
 * sets the canvas and context of the instance brush to the image
 * @param {*} brushIndex
 */
$PolymathicPaint.prototype.setBrushCanvas = function (brushIndex) {
	let inst = instances[this.guid];
	let brush = inst.brushes[brushIndex];
	brush.canvas.width = brush.width;
	brush.canvas.height = brush.height;
	brush.ctx.save();
	brush.ctx.globalCompositeOperation = 'source-over';
	brush.ctx.fillStyle = brush.colour;
	brush.ctx.fillRect(0, 0, brush.width, brush.height);
	brush.ctx.globalCompositeOperation = 'destination-in';
	brush.ctx.drawImage(brush.image, 0, 0, brush.width, brush.height);
	brush.ctx.restore();
};

/**
 * @private
 * @description
 * global event handler for instance
 * using the handleEvent object on the prototype preserves this context
 * @param {Object} e
 */
$PolymathicPaint.prototype.handleEvent = function (e) {
	let inst = instances[this.guid];
	let eventMethod = 'on' + e.type;
	if (inst.canvasArray[inst.activeCanvas] != undefined) $paintPrivate[eventMethod](inst, e);
};

//MODULE METHODS/////////////////////////////////

/**
 * @private
 * @description
 * EVENT
 * starts the draw cycle if the draw event is on the active canvas
 * if the draw event is on any other canvas return void(0) and abort draw cycle
 */
$paintPrivate.onmousedown = function (inst, e) {
	let guid = e.target.getAttribute('canvas-guid');
	if (guid !== inst.canvasArray[inst.activeCanvas].guid) return
	inst.ctx.save();
	inst.isToolActive = true;
	inst.sX = e.pageX - inst.canvasRect.left;
	inst.sY = e.pageY - inst.canvasRect.top;
	if (inst.selectedTool === 'spray') {
		let brush = inst.brushes[inst.activeBrush];
		brush.ctx.save();
		inst.throttleInterval = setInterval(() => inst.ctx.drawImage(brush.canvas, inst.sX - brush.w2 + (Math.random() * 10 - 5), inst.sY - brush.h2 + (Math.random() * 10 - 5), brush.canvas.width, brush.canvas.height), 100);
		inst.ctx.globalAlpha = inst.getBrushProperties().opacity;
	} else if (inst.selectedTool === 'paint' || inst.selectedTool === 'eraser' || inst.selectedTool === 'pen') {
		let canvas = inst.canvasArray[inst.activeCanvas].canvas;
		inst.ctxOffscreen1.save();
		inst.ctxOffscreen2.save();
		inst.ctxOffscreen1.clearRect(0, 0, inst.canvasRect.width, inst.canvasRect.height);
		inst.ctxOffscreen2.clearRect(0, 0, inst.canvasRect.width, inst.canvasRect.height);
		inst.ctxOffscreen2.drawImage(canvas, 0, 0);
	} else if (inst.selectedTool === 'fill') {
		$paintPrivate.fillOnCanvas(inst, inst.sX, inst.sY);
	}
	$paintPrivate.onmousemove(inst, e);
};

/**
 * @private
 * @description
 * EVENT
 * mouse move event
 * selects the draw method for the activeCanvas
 */
$paintPrivate.onmousemove = function (inst, e) {
	if (inst.isToolActive) {
		let x = e.pageX - inst.canvasRect.left;
		let y = e.pageY - inst.canvasRect.top;
		switch (inst.selectedTool) {
			case 'paint':
				$paintPrivate.paintOnCanvas(inst, x, y);
				break;
			case 'spray':
				$paintPrivate.sprayOnCanvas(inst, x, y);
				break;
			case 'eraser':
				$paintPrivate.paintOnCanvas(inst, x, y);
				break;
			case 'pen':
				$paintPrivate.penOnCanvas(inst, x, y);
				break;
		}
	}
};

/**
 * @private
 * @description
 * EVENT
 * ends the draw cycle
 */
$paintPrivate.onmouseup = function (inst, e) {
	if (inst.throttleInterval != undefined) clearInterval(inst.throttleInterval);
	inst.throttleInterval = undefined;
	if (inst.isToolActive === true) {
		inst.isToolActive = false;
		if (inst.selectedTool === 'paint' || inst.selectedTool === 'eraser' || inst.selectedTool === 'pen') {
			inst.ctxOffscreen1.restore();
			inst.ctxOffscreen2.restore();
		} else if (inst.selectedTool === 'spray') {
			let brush = inst.brushes[inst.activeBrush];
			brush.ctx.restore();
		}
		inst.ctx.restore();
	}
};

//DRAWING METHODS

/**
 * @private
 * @description
 * module paint method
 * paints the brush or an line of brushes to connect the last screen xy with the current screen position
 * @param {Object} inst
 * @param {Number} x
 * @param {Number} y
 */
$paintPrivate.paintOnCanvas = (inst, x, y) => {
	let dx = x - inst.sX;
	let dy = y - inst.sY;
	let len = Math.max(Math.abs(dy), Math.abs(dx));
	let brush = inst.brushes[inst.activeBrush];
	if (len > 1) {
		dx = dx / len;
		dy = dy / len;
		for (let i = 1; i < len; i++) {
			inst.ctxOffscreen1.drawImage(brush.canvas, inst.sX + i * dx - brush.w2, inst.sY + i * dy - brush.h2, brush.canvas.width, brush.canvas.height);
		}
	} else {
		inst.ctxOffscreen1.drawImage(brush.canvas, x - brush.w2, y - brush.h2, brush.canvas.width, brush.canvas.height);
	}
	inst.sX = x;
	inst.sY = y;
	if (inst.selectedTool === 'eraser') inst.ctx.globalCompositeOperation = 'source-over';
	inst.ctx.clearRect(0, 0, inst.canvasRect.width, inst.canvasRect.height);
	inst.ctx.drawImage(inst.offscreenCanvas2, 0, 0);
	if (inst.selectedTool === 'eraser') inst.ctx.globalCompositeOperation = 'destination-out';
	inst.ctx.globalAlpha = inst.getBrushProperties().opacity;
	inst.ctx.drawImage(inst.offscreenCanvas1, 0, 0);
	inst.ctx.globalAlpha = 1;
};

/**
 * @private
 * @description
 * sprays the brush onto the canvas at current xy
 * @param {Object} inst
 * @param {Number} x
 * @param {Number} y
 */
$paintPrivate.sprayOnCanvas = (inst, x, y) => {
	inst.sX = x;
	inst.sY = y;
};

/**
 * @private
 * @description
 * module paint method
 * paints the brush or an line of brushes to connect the last screen xy with the current screen position
 * @param {Object} inst
 * @param {Number} x
 * @param {Number} y
 */
$paintPrivate.penOnCanvas = (inst, x, y) => {
	let dx = x - inst.sX;
	let dy = y - inst.sY;
	let len = Math.max(Math.abs(dy), Math.abs(dx));
	let brush = inst.brushes[inst.activeBrush];
	inst.ctxOffscreen1.clearRect(0, 0, inst.canvasRect.width, inst.canvasRect.height);
	if (len > 1) {
		dx = dx / len;
		dy = dy / len;
		for (let i = 1; i < len; i++) {
			inst.ctxOffscreen1.drawImage(brush.canvas, inst.sX + i * dx - brush.w2, inst.sY + i * dy - brush.h2, brush.canvas.width, brush.canvas.height);
		}
	} else {
		inst.ctxOffscreen1.drawImage(brush.canvas, x - brush.w2, y - brush.h2, brush.canvas.width, brush.canvas.height);
	}
	inst.ctx.clearRect(0, 0, inst.canvasRect.width, inst.canvasRect.height);
	inst.ctx.drawImage(inst.offscreenCanvas2, 0, 0);
	inst.ctx.globalAlpha = inst.getBrushProperties().opacity;
	inst.ctx.drawImage(inst.offscreenCanvas1, 0, 0);
	inst.ctx.globalAlpha = 1;
};

/**
 * @private
 * @description
 * module paint method
 * fills the canvas constrained by an area of same colour under the selected pixels that need filling
 * @param {Object} inst
 * @param {Number} x
 * @param {Number} y
 */
$paintPrivate.fillOnCanvas = (inst, x, y) => {
	let imageData = inst.ctx.getImageData(0, 0, inst.canvasRect.width, inst.canvasRect.height),
		width = imageData.width,
		pixelIndex = 0,
		eolPixelIndex = 0,
		solPixelIndex = 0,
		scanDown = [],
		scanUp = [],
		matchColour,
		fillColour = 0,
		filledPixels = {}, //dictionary storing true against index keys of the imageData of filled pixels???
		colourRGBA = { r: 0, g: 0, b: 0, a: 0 };

	fillColour = $paintPrivate.convertHexColourToUint32(inst.brushes[inst.activeBrush].colour, inst.brushes[inst.activeBrush].opacity);
	//colourRGBA = $paintPrivate.convertHexColourToRGBA(inst.brushes[inst.activeBrush].colour, inst.brushes[inst.activeBrush].opacity);
	//convert ImageData to 32bit values
	imageData = new Uint32Array(imageData.data.buffer);

	//set default values for match colour, fill colour and start and end indexes
	pixelIndex = y * width + x;
	eolPixelIndex = pixelIndex - x + width;
	solPixelIndex = pixelIndex - x;
	matchColour = imageData[pixelIndex];

	//fill line to left and right of pixel while colour matches
	imageData[pixelIndex] = fillColour;
	filledPixels[pixelIndex] = true;
	let pI = pixelIndex + 1;
	while (pI < eolPixelIndex && imageData[pI] === matchColour) {
		imageData[pI] = fillColour;
		filledPixels[pI] = true;
		pI++;
	}
	pI = pixelIndex - 1;
	while (pI >= solPixelIndex && imageData[pI] === matchColour) {
		imageData[pI] = fillColour;
		filledPixels[pI] = true;
		pI--;
	}
	//add lines above and below to the scanUpDown arrays and scan for pixels
	scanDown.push(pixelIndex - x + width);
	scanUp.push(pixelIndex - x - width);
	let i = 0;
	let isFilledPixel = false;
	let scanArray = scanDown;
	let nextScan = scanUp;
	let scanDirection = 'down';

	while (i < scanArray.length) {
		pI = scanArray[i];
		solPixelIndex = pI;
		eolPixelIndex = pI + width;
		let pixelLineAccumulator = scanDirection === 'down' ? width : -width;
		let reversePixelLineAccumulator = -pixelLineAccumulator;
		let pIFirstMatch = solPixelIndex;
		let isAdjustStartingPixelIndex = true;
		while (pI < eolPixelIndex) {
			if (imageData[pI] === matchColour) {
				let adjacentPixelTest = pI + reversePixelLineAccumulator;
				if (pIFirstMatch === -1) pIFirstMatch = pI;
				if (filledPixels[adjacentPixelTest] === true) {
					isFilledPixel = true;
					let isNextScanPush = false;
					//Once an adjacent match pixel is found fill all pixels in a line while a colour match is true regardless of adjacentPixelTest
					//adjust the pI for the first matchColour in the row
					if (isAdjustStartingPixelIndex === true && pI > pIFirstMatch) {
						pI = pIFirstMatch;
						isAdjustStartingPixelIndex = false;
					}
					while (pI < eolPixelIndex && imageData[pI] === matchColour) {
						let reverseAdjacentPixelTest = pI + reversePixelLineAccumulator;
						imageData[pI] = fillColour;
						filledPixels[pI] = true;
						//if a reverse direction adjacent pixel is of the match colour, add the line to the nextScan array
						if (isNextScanPush === false && imageData[reverseAdjacentPixelTest] === matchColour && nextScan[solPixelIndex + reversePixelLineAccumulator] == undefined) {
							nextScan.push(solPixelIndex + reversePixelLineAccumulator);
							isNextScanPush = true;
						}
						pI++;
					}
				}
			} else {
				pIFirstMatch = -1;
			}
			pI++;
		}
		//add the next line in the current scan direction if we are not at the end of the data and a pixel has been found
		if (isFilledPixel === true && solPixelIndex + pixelLineAccumulator < imageData.length && solPixelIndex + pixelLineAccumulator > 0) {
			scanArray.push(solPixelIndex + pixelLineAccumulator);
		}
		i++;
		if (i >= scanArray.length && nextScan.length > 0) {
			isFilledPixel = false;
			if (scanDirection === 'down') {
				scanDirection = 'up';
				scanArray = scanUp;
				scanDown = [];
				nextScan = scanDown;
				i = 0;
			} else {
				scanDirection = 'down';
				scanArray = scanDown;
				scanUp = [];
				nextScan = scanUp;
				i = 0;
			}
		}
	}
	//convert imageData back to Uint8Clamped and then canvas ImageData type
	imageData = new Uint8ClampedArray(imageData.buffer);
	imageData = new ImageData(imageData, width);
	inst.ctx.putImageData(imageData, 0, 0);
};

/**
 * Converts a Hex3 or Hex6 colour value to Uint32bit value
 * value is in the form RGBA 8 bits each
 * optional opacity can be provided as a decimal 0 - 1 value
 * @param {String} hexColour
 * @param {Number} opacity
 * @returns {Number}
 */
$paintPrivate.convertHexColourToUint32 = (hexColour, opacity = 1) => {
	let fillColour = 0;
	let brushOpacity = Math.round(opacity * 255);
	fillColour = fillColour + brushOpacity;
	hexColour = hexColour.replace('#', '');
	for (let i = hexColour.length - 1; i >= 0; i--) {
		let char = hexColour[i];
		let componentCol;

		fillColour = fillColour << 8;
		fillColour = fillColour >>> 0;
		if (hexColour.length === 3) {
			componentCol = parseInt('0x' + char + char);
		} else if (hexColour.length === 6) {
			componentCol = parseInt('0x' + char + hexColour[i - 1]);
			i--;
		}
		fillColour = fillColour + componentCol;
	}

	return fillColour;
};

/**
 * Converts a Hex3 or Hex6 colour value to rgba value
 * value is in the form RGBA 8 bits each
 * optional opacity can be provided as a decimal 0 - 1 value
 * @param {String} hexColour
 * @param {Number} opacity
 * @returns {Number}
 */
$paintPrivate.convertHexColourToRGBA = (hexColour, opacity = 1) => {
	let fillColour = [];
	for (let i = 0, len = hexColour.length; i < len; i++) {
		let char = hexColour[i];
		if (char !== '#') {
			let componentCol;
			if (hexColour.length < 6) {
				componentCol = parseInt('0x' + char + char);
			} else {
				componentCol = parseInt('0x' + char + hexColour[i + 1]);
				i++;
			}
			console.log(char, componentCol);
			fillColour.push(componentCol);
		}
	}
	let brushOpacity = Math.round(opacity * 255);
	fillColour.push(brushOpacity);
	return { r: fillColour[0], g: fillColour[1], b: fillColour[2], a: fillColour[3] };
};

//END OF MODULE////////////////////////////////////

export default createPolymathicPaint;
