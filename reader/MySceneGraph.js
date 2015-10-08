
function MySceneGraph(filename, scene) {
	this.loadedOk = null;
	
	// Establish bidirectional references between scene and graph
	this.scene = scene;
	scene.graph=this;
		
	// File reading 
	this.reader = new CGFXMLreader();

	/*
	 * Read the contents of the xml file, and refer to this class for loading and error handlers.
	 * After the file is read, the reader calls onXMLReady on this object.
	 * If any error occurs, the reader calls onXMLError on this object, with an error message
	 */
	 
	this.reader.open('scenes/'+filename, this);  
}

/*
 * Callback to be executed after successful reading
 */
MySceneGraph.prototype.onXMLReady=function() 
{
	console.log("XML Loading finished.");
	var rootElement = this.reader.xmlDoc.documentElement;
	
	// Here should go the calls for different functions to parse the various blocks
	var error = this.parser(rootElement);

	if (error != null) {
		this.onXMLError(error);
		return;
	}	

	this.loadedOk=true;
	
	// As the graph loaded ok, signal the scene so that any additional initialization depending on the graph can take place
	this.scene.onGraphLoaded();
};



/*
 * Example of method that parses elements of one block and stores information in a specific data structure
 */
MySceneGraph.prototype.parser= function(rootElement) {
	
	// getting illumination node
	var illumination =  rootElement.getElementsByTagName('ILLUMINATION');
	if (illumination == null) {
		return "illumi element is missing.";
	}

	if (illumination.length != 1) {
		return "either zero or more than one 'illumi' element found.";
	}
	
	var illumi = illumination[0].children;
	this.ambient = [];
	this.ambient['r'] = illumi[0].attributes.getNamedItem("r").value;
	this.ambient['g'] = illumi[0].attributes.getNamedItem("g").value;
	this.ambient['b'] = illumi[0].attributes.getNamedItem("b").value;
	this.ambient['a']= illumi[0].attributes.getNamedItem("a").value;
	
	this.background = [];
	this.background['r'] = illumi[1].attributes.getNamedItem("r").value;
	this.background['g'] = illumi[1].attributes.getNamedItem("g").value;
	this.background['b'] = illumi[1].attributes.getNamedItem("b").value;
	this.background['a']= illumi[1].attributes.getNamedItem("a").value;
	
	//getting lights
	var lights =  rootElement.getElementsByTagName('LIGHTS');
	
	if (lights == null) {
		return "lights element is missing.";
	}

	if (lights.length != 1) {
		return "either zero or more than one 'lights' element found.";
	}
	
	var lightsArray = lights[0].children;
	
};
	
/*
 * Callback to be executed on any read error
 */
 
MySceneGraph.prototype.onXMLError=function (message) {
	console.error("XML Loading Error: "+message);	
	this.loadedOk=false;
};


