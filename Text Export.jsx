﻿/*
 *
 * TextExport 1.3 - by Bramus! - http://www.bram.us/
 * text layer style export added by Max Glenister (@omgmog) http://www.omgmog.net
 * fix for photohop 2019 and some changes (@SmilingJey) https://github.com/SmilingJey/
 *
 * v 1.4 - 2019.01.07 - fix for photohop 2019 and chande output format and export order
 * v 1.3 - 2008.03.16 - UPD: Base rewrite, now gets all layers (sets & regular ones) in one variable.
 *                    - ADD: Layer Path & Layer Name in export
 *                    - ADD: Cycle Multiple Files
 * v 1.2 - 2008.03.11 - User friendly version	Added filesave dialog (*FIRST RELEASE*)
 * v 1.1 - 2008.03.11 - Extended version, 	Loops sets too (I can haz recursiveness)
 * v 1.0 - 2008.03.11 - Basic version, 		Loops all layers (no sets though)
 *
 * Licensed under the Creative Commons Attribution 2.5 License - http://creativecommons.org/licenses/by/2.5/
 *
 */
 /**
  * CONFIG - CHANGE THESE IF YOU LIKE
  * -------------------------------------------------------------
  */
	// Use save as dialog (true/false)? - This will be overriden to false when running TextExport on multiple files!
	var useDialog	= true;
	// Open file when done (true/false)? - This will be overriden to true when running TextExport on multiple files!
	var openFile	= true;
	// text separator
	var separator	= "*************************************";
	// Export layer path 
	var exportLayerPath = true;
	// Export styles
	var exportStyles = false;
 /**
  * NO NEED TO CHANGE ANYTHING BENEATH THIS LINE
  * -------------------------------------------------------------
  */
	/**
	 *  TextExport Init function
	 * -------------------------------------------------------------
	 */
	 	function initTextExport() {
			// Linefeed shizzle
			if ($.os.search(/windows/i) != -1)
				fileLineFeed = "windows";
			else
				fileLineFeed = "macintosh";
			// Do we have a document open?
			if (app.documents.length < 1) {
				alert("Please open at least one file", "TextExport Error", true);
				return;
			}
			// Oh, we have more than one document open!
			if (app.documents.length > 1) {
				var runMultiple = confirm("TextExport has detected Multiple Files.\nDo you wish to run TextExport on all opened files?", true, "TextExport");
				if (runMultiple === true) {
					docs = app.documents;					
				} else {				
					docs = [app.activeDocument];
				}
			} else {
				runMultiple 	= false;
				docs 		= [app.activeDocument];
			}
			// Loop all documents
			for (var i = 0; i < docs.length; i++) {
				// useDialog (but not when running multiple
				if ((runMultiple !== true) && (useDialog === true)) {
					// Pop up save dialog
					var saveFile = File.saveDialog("Please select a file to export the text to:");
					// User Cancelled
					if(saveFile == null) {
						alert("User Cancelled");
						return;
					}
					// set filePath and fileName to the one chosen in the dialog
					filePath = saveFile.path + "/" + saveFile.name + ".txt";
				} 
				// Don't use Dialog
				else {
					// Auto set filePath and fileName
					filePath = Folder.myDocuments + '/' + docs[i].name + '.txt';
				}
				// create outfile
				var fileOut	= new File(filePath);
				// clear dummyFile
				dummyFile = null;
				// set linefeed
				fileOut.linefeed = fileLineFeed;
				// open for write
				fileOut.open("w", "TEXT", "????");
				// Append title of document to file
				fileOut.writeln("* START TextExport for " + docs[i].name);
				// Set active document
				app.activeDocument = docs[i];
				// call to the core with the current document
				goTextExport2(app.activeDocument, fileOut, '/');
				// close the file
				fileOut.close();
				// Give notice that we're done or open the file (only when running 1 file!)
				if (runMultiple === false)
				{
					if (openFile === true)
						fileOut.execute();
					else
						alert("File was saved to:\n" + Folder.decode(filePath), "TextExport");
				}
			}
			if (runMultiple === true) {
				alert("Parsed " + documents.length + " files;\nFiles were saved in your documents folder", "TextExport");
			}
		}
  	/**
  	 * TextExport Core Function (V2)
  	 * -------------------------------------------------------------
	 */
		function goTextExport2(el, fileOut, path) 
		{
			// Get the layers
			var layers = el.layers;
			// Loop 'm
			for (var layerIndex = 0; layerIndex < layers.length; layerIndex++)
			{
				// curentLayer ref
				var currentLayer = layers[layerIndex];
				// currentLayer is a LayerSet
				if (currentLayer.typename == "LayerSet") {
					goTextExport2(currentLayer, fileOut, path + currentLayer.name + '/');
				// currentLayer is not a LayerSet
				} else {
					// Layer is visible and Text --> we can haz copy paste!
					if ( (currentLayer.visible) && (currentLayer.kind == LayerKind.TEXT) ) {
						if (exportLayerPath) fileOut.writeln('Path: ' + path + currentLayer.name);
						fileOut.writeln(currentLayer.textItem.contents);

						if(exportStyles && currentLayer.textItem.contents){
							//fileOut.writeln('Styles:');
							fileOut.writeln('font-family: "'+currentLayer.textItem.font + '";');
							var fontSize = parseInt(currentLayer.textItem.size);
							fileOut.writeln('font-size: ' + fontSize + 'px;');
							fileOut.writeln('color: #'+(currentLayer.textItem.color.rgb.hexValue?currentLayer.textItem.color.rgb.hexValue:'') + ';');
							fileOut.writeln('color: #'+(currentLayer.textItem.color.rgb.hexValue?currentLayer.textItem.color.rgb.hexValue:'') + ';');
							//fileOut.writeln('* capitalization: '+(currentLayer.textItem.capitalization=="TextCase.NORMAL"?"normal":"uppercase"));
							//fileOut.writeln('* fauxBold: '+(currentLayer.textItem.fauxBold?currentLayer.textItem.fauxBold:''));
							//fileOut.writeln('* fauxItalic: '+(currentLayer.textItem.fauxItalic?currentLayer.textItem.fauxItalic:''));
							//fileOut.writeln('leading: '+(currentLayer.textItem.leading=='auto-leading'?'auto':currentLayer.textItem.leading));
							//fileOut.writeln('* tracking: '+(currentLayer.textItem.fauxItalic?currentLayer.textItem.fauxItalic:''));
						}
						fileOut.writeln('');
					}
				}
			}
		}
	/**
	 *  TextExport Boot her up
	 * -------------------------------------------------------------
	 */
	 	initTextExport();