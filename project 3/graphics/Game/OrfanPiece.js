/**
 * Constructor of an OrfanPiece object, a piece without a related space, used to animate a piece in arch. 
 *	
 * @constructor OrfanPiece
 * @param  {CGFScene}	scene	current scene
 * @param  {CGFObject}		piece		piece object
 * @param  {int}		x0		initial x
 * @param  {int}		y0		initial y
 * @param  {int}		xf		final x
 * @param  {int}		yf		final y
 *
 */

function OrfanPiece(scene, piece, x0, y0, xf, yf) {

	CGFobject.call(this,scene);
	
	this.scene = scene;
	this.piece = piece;

	this.x0 = x0;
	this.y0 = y0;
	this.xf = xf;
	this.yf = yf;


	this.visible = typeof this.xf === "undefined" && typeof this.yf === "undefined" ? true : false;
	
	this.createInitialMatrixes();
	this.undoAnimation = false;

	this.animation = typeof this.xf === "undefined" && typeof this.yf === "undefined" ? new ReplaceAnimation() : new ArchAnimation(x0, y0, xf, yf);

	if (typeof this.xf === "undefined" && typeof this.yf === "undefined") {

		var color = this.piece.color;
		this.scene.board.history.movesHistory.push(new ReplaceColorHistory(this.scene, color, this.x0, this.y0));

	}

	this.lastCurrTime = 0;

}

OrfanPiece.prototype = Object.create(CGFobject.prototype);
OrfanPiece.prototype.constructor = OrfanPiece;

/**
 * Creates initial transform matrixes, it is important to don't create them everytime a display occurs. 
 *	
 * @method createInitialMatrixes
 *
 */

OrfanPiece.prototype.createInitialMatrixes = function () {

	this.transformMatrix = mat4.create();
	mat4.identity(this.transformMatrix);
	var posx = 5 + 2.5 * this.x0; var posy =  5 + 2.5 * this.y0;
	mat4.translate(this.transformMatrix, this.transformMatrix, [posx, 0, posy]);

	this.originalTransformMatrix = mat4.create();
	mat4.identity(this.originalTransformMatrix);
	mat4.copy(this.originalTransformMatrix, this.transformMatrix);

}

/**
 * Displays orfan pieces when they are ment to animate. 
 *	
 * @method display
 *
 */

OrfanPiece.prototype.display = function () {
	
	if (this.visible) {
		this.scene.pushMatrix();
		this.scene.multMatrix(this.transformMatrix);
		this.piece.display();
		this.scene.popMatrix();
	}

}


/**
 * Updates animation if this piece is visible. 
 *	
 * @method update
 *
 */

OrfanPiece.prototype.update = function (currTime) {

	var deltaTime = 0;
	
	if (this.lastCurrTime != 0)
		deltaTime = currTime - this.lastCurrTime;

	this.lastCurrTime = currTime;

	if (this.visible && this.animation.constructor == ArchAnimation) 
		this.animatePieceInArch(deltaTime);
	else if (this.visible && this.animation.constructor == ReplaceAnimation)
		this.replacePiece(deltaTime);

}


/**
 * Method to update the arch animation each iteration
 *	
 * @method animatePieceInArch
 * @param deltaTime		time since last iteration
 *
 */

OrfanPiece.prototype.animatePieceInArch = function (deltaTime) {
	var animation = this.animation;

	if (animation.acumulatedDistance < animation.distance) {

		mat4.copy(this.transformMatrix, this.originalTransformMatrix);
		this.animation.update(deltaTime);

		if (animation.currY < 0) animation.currY = 0;

		mat4.translate(this.transformMatrix, this.transformMatrix, [this.animation.currX, this.animation.currY , this.animation.currZ]);
		mat4.rotate(this.transformMatrix, this.transformMatrix, this.animation.elapsedAngle * 2, [this.animation.dx, 0, this.animation.dz]);

	} else {

		this.animation = null;
		this.visible = false;
		this.scene.board.matrix[this.yf][this.xf].piece = new Piece(this.scene, this.scene.board.cylinder, this.scene.board.top);
		this.scene.board.matrix[this.yf][this.xf].piece.color = this.piece.color;
		this.scene.board.matrix[this.yf][this.xf].piece.display();
		this.scene.board.matrix[this.yf][this.xf].animation = new SpringAnimation(-50);
		this.scene.counter.pieceCounter.checkPieceNumbers();

	}

}


/**
 * Method to animate piece replacer each iteration
 *	
 * @method replacePiece
 * @param deltaTime		time since last iteration
 *
 */

OrfanPiece.prototype.replacePiece = function (deltaTime) {
	var animation = this.animation;

	if (animation.elapsedAngle < animation.angle) {

		mat4.copy(this.transformMatrix, this.originalTransformMatrix);
		
		this.animation.update(deltaTime);

		mat4.translate(this.transformMatrix, this.transformMatrix, [0, this.animation.currY , 0]);
		mat4.rotate(this.transformMatrix, this.transformMatrix, this.animation.elapsedAngle * 3, [0, 0, 1]);

	} else {

		this.animation = null;
		this.visible = false;
		var cylinder = this.piece.cylinder.height == 0.15 ? this.scene.board.towerCylinder : this.scene.board.cylinder;
		this.scene.board.matrix[this.y0][this.x0].piece = new Piece(this.scene, cylinder, this.scene.board.top);
		this.scene.board.matrix[this.y0][this.x0].piece.color = this.piece.color == 'black' ? 'white' : 'black';
		this.scene.board.matrix[this.y0][this.x0].piece.display();
		this.scene.board.matrix[this.y0][this.x0].animation = new SpringAnimation(-50);
		this.scene.counter.pieceCounter.checkPieceNumbers();

	}

}