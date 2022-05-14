/**
 * Copyright (c) 2006-2017, JGraph Ltd
 * Copyright (c) 2006-2017, Gaudenz Alder
 */
AWSFile = function(ui, data, meta)
{
	DrawioFile.call(this, ui, data);
	
	this.meta = meta;
	this.peer = this.ui.gitHub;
};

//Extends mxEventSource
mxUtils.extend(AWSFile, DrawioFile);

/**
 * Translates this point by the given vector.
 * 
 * @param {number} dx X-coordinate of the translation.
 * @param {number} dy Y-coordinate of the translation.
 */
AWSFile.prototype.share = function()
{
	this.ui.editor.graph.openLink('https://github.com/' +
		encodeURIComponent(this.meta.org) + '/' +
		encodeURIComponent(this.meta.repo) +'/settings/access');
};

/**
 * Translates this point by the given vector.
 * 
 * @param {number} dx X-coordinate of the translation.
 * @param {number} dy Y-coordinate of the translation.
 */
AWSFile.prototype.getId = function()
{
	return encodeURIComponent(this.meta.org) + '/' +
		((this.meta.repo != null) ? encodeURIComponent(this.meta.repo) + '/' +
		((this.meta.ref != null) ? this.meta.ref +
		((this.meta.path != null) ? '/' + this.meta.path : '') : '') : '');
};

/**
 * Translates this point by the given vector.
 * 
 * @param {number} dx X-coordinate of the translation.
 * @param {number} dy Y-coordinate of the translation.
 */
AWSFile.prototype.getHash = function()
{
	return encodeURIComponent('H' + this.getId());
};

/**
 * Returns true if copy, export and print are not allowed for this file.
 */
AWSFile.prototype.getPublicUrl = function(fn)
{
	// LATER: Check if download_url is always null for private repos
	if (this.meta.download_url != null)
	{
		mxUtils.get(this.meta.download_url, mxUtils.bind(this, function(req)
		{
			fn((req.getStatus() >= 200 && req.getStatus() <= 299) ? this.meta.download_url : null);
		}), mxUtils.bind(this, function()
		{
			fn(null);
		}));
	}
	else
	{
		fn(null);
	}
};

/**
 * Adds the listener for automatically saving the diagram for local changes.
 */
AWSFile.prototype.isConflict = function(err)
{
	return err != null && err.status == 409;
};

/**
 * Translates this point by the given vector.
 * 
 * @param {number} dx X-coordinate of the translation.
 * @param {number} dy Y-coordinate of the translation.
 */
AWSFile.prototype.getMode = function()
{
	return App.MODE_GITHUB;
};

/**
 * Overridden to enable the autosave option in the document properties dialog.
 */
AWSFile.prototype.isAutosave = function()
{
	return false;
};

/**
 * Translates this point by the given vector.
 * 
 * @param {number} dx X-coordinate of the translation.
 * @param {number} dy Y-coordinate of the translation.
 */
AWSFile.prototype.getTitle = function()
{
	return this.meta.name;
};

/**
 * Translates this point by the given vector.
 * 
 * @param {number} dx X-coordinate of the translation.
 * @param {number} dy Y-coordinate of the translation.
 */
AWSFile.prototype.isRenamable = function()
{
	return false;
};

/**
 * Adds the listener for automatically saving the diagram for local changes.
 */
AWSFile.prototype.getLatestVersion = function(success, error)
{
	this.peer.getFile(this.getId(), success, error);
};

/**
 * Translates this point by the given vector.
 * 
 * @param {number} dx X-coordinate of the translation.
 * @param {number} dy Y-coordinate of the translation.
 */
AWSFile.prototype.isCompressedStorage = function()
{
	return false;
};

/**
 * Hook for subclassers to update the descriptor from given file
 */
AWSFile.prototype.getDescriptor = function()
{
	return this.meta;
};

/**
 * Hook for subclassers to update the descriptor from given file
 */
AWSFile.prototype.setDescriptor = function(desc)
{
	this.meta = desc;
};

/**
 * Adds all listeners.
 */
AWSFile.prototype.getDescriptorEtag = function(desc)
{
	return desc.sha;
};

/**
 * Adds the listener for automatically saving the diagram for local changes.
 */
AWSFile.prototype.setDescriptorEtag = function(desc, etag)
{
	desc.sha = etag;
};

/**
 * Translates this point by the given vector.
 * 
 * @param {number} dx X-coordinate of the translation.
 * @param {number} dy Y-coordinate of the translation.
 */
AWSFile.prototype.save = function(revision, success, error, unloading, overwrite, message)
{
	this.doSave(this.getTitle(), success, error, unloading, overwrite, message);
};

/**
 * Translates this point by the given vector.
 * 
 * @param {number} dx X-coordinate of the translation.
 * @param {number} dy Y-coordinate of the translation.
 */
AWSFile.prototype.saveAs = function(title, success, error)
{
	this.doSave(title, success, error);
};

/**
 * Translates this point by the given vector.
 * 
 * @param {number} dx X-coordinate of the translation.
 * @param {number} dy Y-coordinate of the translation.
 */
AWSFile.prototype.doSave = function(title, success, error, unloading, overwrite, message)
{
	// Forces update of data for new extensions
	var prev = this.meta.name;
	this.meta.name = title;
	
	DrawioFile.prototype.save.apply(this, [null, mxUtils.bind(this, function()
	{
		this.meta.name = prev;
		this.saveFile(title, false, success, error, unloading, overwrite, message);
	}), error, unloading, overwrite]);
};

/**
 * Translates this point by the given vector.
 * 
 * @param {number} dx X-coordinate of the translation.
 * @param {number} dy Y-coordinate of the translation.
 */
AWSFile.prototype.saveFile = function(title, revision, success, error, unloading, overwrite, message)
{
	if (!this.isEditable())
	{
		if (success != null)
		{
			success();
		}
	}
	else if (!this.savingFile)
	{
		var doSave = mxUtils.bind(this, function(message)
		{
			// Load the AWS SDK for Node.js
			var AWS = require('aws-sdk');
			// Set the region 
			AWS.config.update({region: 'REGION'});
			
			// Create S3 service object
			var s3 = new AWS.S3({apiVersion: '2006-03-01'});
			
			// call S3 to retrieve upload file to specified bucket
			var uploadParams = {Bucket: process.argv[2], Key: '', Body: ''};
			var file = process.argv[3];
			
			// Configure the file stream and obtain the upload parameters
			var fs = require('fs');
			var fileStream = fs.createReadStream(file);
			fileStream.on('error', function(err) {
			console.log('File Error', err);
			});
			uploadParams.Body = fileStream;
			var path = require('path');
			uploadParams.Key = path.basename(file);
			
			// call S3 to retrieve upload file to specified bucket
			s3.upload (uploadParams, function (err, data) {
				if (err) {
					console.log("Error", err);
				} if (data) {
					console.log("Upload Success", data.Location);
				}
			});
		});
		
		if (message != null)
		{
			doSave(message);
		}
		else
		{
			this.peer.showCommitDialog(this.meta.name,
				this.getDescriptorEtag(this.meta) == null ||
				this.meta.isNew, mxUtils.bind(this, function(message)
			{
				doSave(message);	
			}), error);
		}
	}
	else if (error != null)
	{
		error({code: App.ERROR_BUSY});
	}
};
