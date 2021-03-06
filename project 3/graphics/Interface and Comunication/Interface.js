/**
 * MyInterface
 * @constructor
 */
 
 
function MyInterface() {
	//call CGFinterface constructor 
	CGFinterface.call(this);

	this.quit = { function(){ console.log("clicked") }};

};

MyInterface.prototype = Object.create(CGFinterface.prototype);
MyInterface.prototype.constructor = MyInterface;

/**
 * init
 * @param {CGFapplication} application
 */

MyInterface.prototype.init = function(application) {
	// call CGFinterface init
	CGFinterface.prototype.init.call(this, application);
	
	// init GUI. For more information on the methods, check:
	//  http://workshop.chromeexperiments.com/examples/gui

	this.initGUIVars();
	
	this.app = application;
	this.gui = new dat.GUI();
	
	this.gui.autoListen = false;

	var self = this;
	this.defaultControls = [];
	this.replayControls = [];

	this.defaultControls[0] = this.gui.add(this,'startGame').name('Start Game');
	this.defaultControls[1] = this.gui.add(this,'undo').name('Undo');
	this.defaultControls[2] = this.gui.add(this.scene,'replay').name('Replay');
	this.defaultControls[3] = this.gui.add(this, 'playing').name('Playing').listen();
	this.defaultControls[3].onChange(function() { 
		self.playing = self.scene.board.history.playing;
	});

	this.optionsFolder = this.gui.addFolder('Options');
	this.optionsFolder.open();

	this.optionsFolder.add(this, 'perspective', this.perspectiveNames).name('Perspective')
	.onChange(function() { self.scene.updateCamera(self.perspective); });
	this.defaultControls[4] = this.optionsFolder.add(this, 'difficulty', this.difficulties).name('Difficulty').listen();
	this.defaultControls[4].onChange(function() { 
		swal('This option is not implemented, the ProLog project used to develop this project does not support this type of function.');
	});
	this.defaultControls[5] = this.optionsFolder.add(this.scene.board, 'black', this.possiblePlayers).name('Black').listen();
	this.defaultControls[6] = this.optionsFolder.add(this.scene.board, 'white', this.possiblePlayers).name('White').listen();
	this.defaultControls[7] = this.optionsFolder.add(this, 'roundTime', 15, 60).step(1).name('Round Time');
	this.defaultControls[7].onChange(function() { 
		self.scene.counter.timer.elapsedMiliSeconds = -1;
		self.scene.counter.timer.roundTime = self.roundTime;
		self.scene.counter.timer.roundTimeChanged = true;
	});

	this.optionsFolder.add(this, 'environment', this.possibleEnvironments).name('Environment');
	this.defaultControls[8] = this.gui.add(this,'quitGame').name('Quit');

	
	this.replayControls[0] = this.gui.add(this, 'replayPercent', 0, 100).name('Replaying').listen();
	toggleMenuItem(this.replayControls[0], false);

	return true;
	
};



/**
 * Listener used when the 'Start Game' button is clicked. 
 *	
 * @method startGame
 *
 */

MyInterface.prototype.startGame = function() {
	this.scene.board.requestToPl('startgame');
}

/**
 * Listener used when the 'Undo' button is clicked. 
 *	
 * @method undo
 *
 */

MyInterface.prototype.undo = function() {

	if (this.scene.board.initialized) {
		this.scene.board.black = 'Human';
		this.scene.board.white = 'Human';
	}

	this.scene.board.undo();
}


/**
 * Listener used when the 'Quit' button is clicked. 
 *	
 * @method quitGame
 *
 */

MyInterface.prototype.quitGame = function() {
	this.scene.board.requestToPl('quit');
}


/**
 * Initiates the vars used to create this interface list elements. 
 *	
 * @method initGUIVars
 *
 */

MyInterface.prototype.initGUIVars = function() {
	this.perspectiveNames = this.scene.getPerspesctiveNames();
	this.perspective = this.perspectiveNames[0];
	this.possiblePlayers = ['Human', 'Bot'];
	this.replayPercent = 0;
	this.roundTime = 30;
	this.playing = 'black';
	this.environment = 'Casino';
	this.possibleEnvironments = ['None', 'Room', 'Porch', 'Casino'];

	this.difficulty = 'Medium';
	this.difficulties = [ 'Easy', 'Medium', 'Hard'];
}

/**
 * processKeyboard
 * @param event {Event}
 */

MyInterface.prototype.processKeyboard = function(event) {
	// call CGFinterface default code (omit if you want to override)
	CGFinterface.prototype.processKeyboard.call(this,event);
	
	// Check key codes e.g. here: http://www.asciitable.com/
	// or use String.fromCharCode(event.keyCode) to compare chars
	
	// for better cross-browser support, you may also check suggestions on using event.which in http://www.w3schools.com/jsref/event_key_keycode.asp
};


/**
 * Used to update de replay progression. 
 *	
 * @method logItVal
 *
 */

MyInterface.prototype.logItVal = function() {
	this.replayPercent = this.scene.board.history.replayIt / this.scene.board.history.movesHistory.length * 100;
}

/**
 * Used to hide and display the list elements during a replay. 
 *	
 * @method replay
 * @param 	{boolean} replaying 	True if a replay is occurring, false if it's not
 *
 */

MyInterface.prototype.replay = function(replaying) {

	for (var i = 0; i < this.defaultControls.length; i++) 
		toggleMenuItem(this.defaultControls[i], !replaying);


	toggleMenuItem(this.replayControls[0], replaying);

	this.scene.board.history.replayIt = 0;
	this.replayPercent = 0;
}


function toggleMenuItem(item, visible) {
	item.__li.style.display = visible ? "" : "none";
}


function isMenuItemVisible(item) {
	return item.__li.style.display != "none";
}