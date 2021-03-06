/* global createjs, _*/

var bigRender = bigRender || {};

(function(){
	'use strict';


	var CompositionView = function(canvas, model, queue) {
		this.model = model;
		this.width = model.width;
		this.height = model.height;
		this.queue = queue;
		this.canvas = canvas;
		this.stage = new createjs.Stage(this.canvas);
		this.stage.autoClear = true;
		this.layers = [];

		_.bindAll(this, '_tickHandler', '_targetLayerChangedHandler', '_highlightLayerChangedHandler', '_layerAddedHandler', '_layerRemovedHandler', '_layerChangedHandler', '_commandPosChangedHandler');
		this._addListeners();
	};

	var p = CompositionView.prototype;


	p.getSaveState = function() {
		var layerImages = [];
		for(var i=0; i<this.layers.length; i++) {
			var layerView = this.layers[i];
			layerImages.push(layerView.getSaveState());
		}
		return(layerImages);
	};


	p.setSaveState = function(graphics) {
		for(var i=0; i<graphics.length; i++) {
			var layerGraphics = graphics[i];
			var layerView = this._getLayerById(layerGraphics.layerId);
			if(layerView) {
				layerView.setSaveState(layerGraphics);
			}
		}
	};


	p.update = function() {
		this.stage.update();
	};


	p.getSnapshot = function(copyCanvas) {
		copyCanvas = copyCanvas || bigRender.CanvasCache.pop(this.canvas.width, this.canvas.height);
		copyCanvas.getContext('2d').drawImage(this.canvas, 0, 0);
		return(copyCanvas);
	};


	p._getLayerById = function(layerId) {
		for(var i=0; i<this.layers.length; i++) {
			var layerView = this.layers[i];
			if(layerView.layerModel.layerId === layerId) {
				return(layerView);
			}
		}
	};


	p._addListeners = function() {
		var m = this.model;
		createjs.Ticker.addEventListener('tick', this._tickHandler);
		m.addEventListener(bigRender.event.TARGET_LAYER_CHANGED, this._targetLayerChangedHandler);
		m.addEventListener(bigRender.event.HIGHLIGHT_LAYER_CHANGED, this._highlightLayerChangedHandler);
		m.addEventListener(bigRender.event.LAYER_ADDED, this._layerAddedHandler);
		m.addEventListener(bigRender.event.LAYER_REMOVED, this._layerRemovedHandler);
		m.addEventListener(bigRender.event.LAYER_CHANGED, this._layerChangedHandler);
		m.addEventListener(bigRender.event.COMMAND_POS_CHANGED, this._commandPosChangedHandler);
	};


	p._removeListeners = function() {
		var m = this.model;
		createjs.Ticker.removeEventListener('tick', this._tickHandler);
		m.removeEventListener(bigRender.event.TARGET_LAYER_CHANGED, this._targetLayerChangedHandler);
		m.removeEventListener(bigRender.event.HIGHLIGHT_LAYER_CHANGED, this._highlightLayerChangedHandler);
		m.removeEventListener(bigRender.event.LAYER_ADDED, this._layerAddedHandler);
		m.removeEventListener(bigRender.event.LAYER_REMOVED, this._layerRemovedHandler);
		m.removeEventListener(bigRender.event.LAYER_CHANGED, this._layerChangedHandler);
		m.removeEventListener(bigRender.event.COMMAND_POS_CHANGED, this._commandPosChangedHandler);
	};


	p._tickHandler = function(e) {
		this.update();
	};


	p._targetLayerChangedHandler = function(e) {
		//do nothing
	};


	p._highlightLayerChangedHandler = function(e) {
		var hLayer = e.command.layer;

		//highlight the selected layer by fading all other layers out
		if(hLayer) {
			_.each(this.layers, function(layerView){
				if(layerView.layerModel === hLayer) {
					layerView.setDisplayOpacity(1);
				}
				else {
					layerView.setDisplayOpacity(0.5);
				}
			});
		}

		//otherwise return all opacity to normal
		else {
			_.each(this.layers, function(layerView) {
				layerView.setDisplayOpacity(1);
			});
		}
	};


	p._layerAddedHandler = function(e) {
		var layerView = new bigRender.LayerView(e.layer, this.queue, this.width, this.height);
		this.stage.addChild(layerView);
		this.layers.push(layerView);
		this._sortLayers();
	};


	p._layerRemovedHandler = function(e) {
		var layerView = _.find(this.layers, function(lv) { return(lv.layerId === e.command.layerId); });
		if(layerView) {
			layerView.remove();
			this.layers = _.without(this.layers, layerView);
		}
		this._sortLayers();
	};



	p._layerChangedHandler = function(e) {

	};


	p._commandPosChangedHandler = function(e) {

	};


	p._sortLayers = function() {
		this.layers.sort( function(a,b) {
			return(a.z - b.z);
		});
		for(var i=0; i<this.layers.length; i++) {
			var layerView = this.layers[i];
			this.stage.addChild(layerView);
		}
	};


	p.clear = function()  {
		this.stage.removeAllChildren();
		this.layers = [];
	};


	p.remove = function() {
		this._removeListeners();
	};


	bigRender.CompositionView = CompositionView;
}());