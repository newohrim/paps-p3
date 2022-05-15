AWSLibrary = function(ui, data, meta)
{
	GitLabFile.call(this, ui, data, meta);
};

//Extends mxEventSource
mxUtils.extend(AWSLibrary, AWSFile);

/**
 * Overridden to avoid updating data with current file.
 */
AWSLibrary.prototype.doSave = function(title, success, error)
{
	this.saveFile(title, false, success, error);
};

/**
 * Returns the location as a new object.
 * @type mx.Point
 */
AWSLibrary.prototype.open = function()
{
	// Do nothing - this should never be called
};
