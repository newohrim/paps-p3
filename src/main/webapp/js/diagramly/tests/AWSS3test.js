function testSaveFile(fileToSave, title, title, revision, unloading, overwrite, message)
{
	success = function(e) 
	{
		console.log(e.message);
	};
	error = function(e) 
	{
		console.log(e.message);
	};
	fileToSave.saveFile(title, title, revision, success, error, unloading, overwrite, message);
};

function testLoadFile(fileToLoad)
{
	success = function(e) 
	{
		console.log(e.message);
	};
	error = function(e) 
	{
		console.log(e.message);
	};
	fileToLoad.getLatestVersion(title, success, error);
};