let ws=null
function connect(){
	ws = new WebSocket(`ws://${window.location.hostname}:8080/echo`);
	ws.onopen = function() {            
		// Web Socket is connected, send data using send()
		ws.send("Message to send");
		console.log("Message is sent...");
	};
	ws.onmessage = function (evt) { 
		let received_msg = evt.data;
		console.log("Message is received...",received_msg);
		try {
			let msgObj = JSON.parse(received_msg)
			switch (msgObj.Type) {
				case "appList":
					fillAppList(msgObj.appList)
					break;
				case "Log":
					output(msgObj.LogType+":"+msgObj.LogMsg)
					break;
				case "InstanceClosed":
					output("Server Closed Connection. Instance Shutting Down.")
					break;
				case "InstanceResume":
					output("New Server Instance of app Started joining instance #"+msgObj.appInstanceId)
					activeAppInstanceId=msgObj.appInstanceId
					break;
				case "subscripedTo":
					resetCmds()
					msgObj.functionData.forEach(func => {
						cmds[func.Name]=function(...args){
							console.log("exec",func.Name,args)
							ws.send(JSON.stringify({
								Type:"cmdExec",
								appName:activeAppName,
								appInstanceId:activeAppInstanceId,
								cmd:func.Name,
								args:args
							}))
						}
						cmds[func.Name].usage=func.Usage
						cmds[func.Name].doc=func.Help
					});
					output("Subscriped to "+msgObj.appName+"#"+msgObj.appInstanceId)
					break
					case "updateFunctions":
						resetCmds()
						msgObj.functionData.forEach(func => {
							cmds[func.Name]=function(...args){
								console.log("exec",func.Name,args)
								ws.send(JSON.stringify({
									Type:"cmdExec",
									appName:activeAppName,
									appInstanceId:activeAppInstanceId,
									cmd:func.Name,
									args:args
								}))
							}
							cmds[func.Name].usage=func.Usage
							cmds[func.Name].doc=func.Help
						});
						break
				default:
					break;
			}
		} catch (error) {
			
		}
	};

	ws.onclose = function() { 
		// websocket is closed.
		console.log("Connection is closed..."); 
	};
}
if (!("WebSocket" in window)) {
	console.log("Your browser does not support websockets!")
}else{
	connect()
}