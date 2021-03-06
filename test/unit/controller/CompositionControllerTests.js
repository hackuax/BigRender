/* global describe, beforeEach, it, expect, sinon, bigRender, createjs */

(function() {
	'use strict';

	describe('CompositionController', function() {

		var cc;
		var cm;

		beforeEach(function() {
			cm = new bigRender.CompositionModel();
			cc = new bigRender.CompositionController(cm);
		});


		it('should have some defaults', function() {
			expect(cm.commands.length).toBe(0);
		});


		it('should add new commands', function() {
			cc.addCommand({type:bigRender.command.DRAW_LINE, path:[0,0,1,1]});
			expect(cm.commands.length).toBe(1);
			expect(cm.commands[0].path[3]).toBe(1);
			expect(cm.targetCommandPos).toBe(1);

			cc.addCommand({type:bigRender.command.MOVE_OBJECT, id:53, x:15, y:24});
			expect(cm.commands.length).toBe(2);
			expect(cm.commands[1].id).toBe(53);
			expect(cm.targetCommandPos).toBe(2);
		});


		it('should clear last command', function() {
			cc.addCommand({type:bigRender.command.DRAW_LINE, path:[0,0,1,1]});
			cc.clearLastCommand();
			expect(cm.commands.length).toBe(0);
			expect(cm.targetCommandPos).toBe(0);
		});


		it('should replace last command', function() {
			cc.replaceLastCommand({type:bigRender.command.ADD_OBJECT, object:new createjs.Container()});
			cc.replaceLastCommand({type:bigRender.command.MOVE_OBJECT, id:53, x:15, y:24});
			expect(cm.commands.length).toBe(1);
			expect(cm.commands[0].type).toBe(bigRender.command.MOVE_OBJECT);
			expect(cm.targetCommandPos).toBe(1);
		});


		it('undo and redo should dispatch Do and Undo events', function() {
			var doLine = sinon.spy();
			var undoLine = sinon.spy();

			cc.commandDispatcher.addEventListener(bigRender.command.DRAW_LINE + 'Do', doLine);
			cc.commandDispatcher.addEventListener(bigRender.command.DRAW_LINE + 'Undo', undoLine);

			cc.addCommand({type:bigRender.command.DRAW_LINE, path:[0,0]});
			cc.addCommand({type:bigRender.command.DRAW_LINE, path:[3,3]});
			expect(cm.targetCommandPos).toBe(2);
			expect(doLine.callCount).toBe(2);

			cc.undo();
			cc.undo();
			expect(cm.targetCommandPos).toBe(0);
			expect(undoLine.callCount).toBe(2);

			cc.redo();
			cc.redo();
			expect(cm.targetCommandPos).toBe(2);
			expect(doLine.callCount).toBe(4);
		});


		it('should return a save object filled with all layer settings', function() {
			cc.addCommand({type: bigRender.command.CREATE_LAYER, layerId: 1, alpha: 0.5, name: 'Layer 1'});
			cc.addCommand({type: bigRender.command.CREATE_LAYER, layerId: 2, zIndex: 995, name: 'Layer 2'});
			var saveObj = cc.getSaveState();
			expect(saveObj.layers[0].alpha).toBe(0.5);
			expect(saveObj.layers[1].name).toBe('Layer 2');
		});

	});

}());