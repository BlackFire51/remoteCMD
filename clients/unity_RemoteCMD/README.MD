## Install
Create a new "RemoteCMD" folder in your Unity project .
drag and drop all files in that folder.

## Setup
Create a new Empty Object .
drag and drop the "RemoteCMD" script on it.
Set Host and Port to your server
Enter the appKey specifid in the apps.json file on your server


## Custom functions
You can add Custom funktion for the remote end 

Name: Name of the comand
Usage: example usage
Help: hext to be displayed by the Help command
Callback: function to be called on execution with string array as parameter
```c#
RemoteCMD.registerComand("test1", "this is a test", "testing Stuff", (string[] args) =>
{
	Debug.Log("Exec test 1 ");
});
```