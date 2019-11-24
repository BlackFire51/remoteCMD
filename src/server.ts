import http from 'http';
import WebSocket from 'ws';
import mExpress from './express';
import remoteServerMgr from './remoteServerMgr'

const myApp = new mExpress();
//initialize a simple http server
const server = http.createServer(myApp.getApp());

//initialize the WebSocket server instance
const wss = new WebSocket.Server({ server });

let websocketClientList:WebSocket[]=[]

wss.on('connection', (ws: WebSocket) => {
    //connection is up, let's add a simple simple event
    ws.on('message', (message: string) => {
        //log the received message and send it back to the client
        console.log('received: %s', message);
		try {
			let msgObj= JSON.parse(message)
			switch (msgObj.Type) {
				case 'subscribeCmd':
					let app = remoteServerMgr.getApp(msgObj.appName,msgObj.appInstanceId)
					if(app){
						app.subscribeWebClient(ws)
					}
					break;
				case 'cmdExec':
					let app1 = remoteServerMgr.getApp(msgObj.appName,msgObj.appInstanceId)
					if(app1){
						app1.execCmd(msgObj.cmd,msgObj.args)
					}
					break;
				default:
					break;
			}
		} catch (error) {
			
		}
	});
	ws.on('close', () => {
		websocketClientList=websocketClientList.filter(cln=>cln!=ws && cln.readyState!=3)
	})

    //send immediatly a feedback to the incoming connection    
	//ws.send('Hi there, I am a WebSocket server');
	ws.send(JSON.stringify({
		Type:"appList",
		appList:remoteServerMgr.getServerInstanceList()
	}))
	websocketClientList.push(ws);
});
remoteServerMgr.registerToAppListUpdate((list)=>{
	let str=JSON.stringify({
		Type:"appList",
		appList:list
	})
	websocketClientList.forEach(ws=>{
		ws.send(str)
	})
})

//start our server
server.listen(process.env.PORT || 8080, () => {
    console.log(`Server started on port ${server.address().port}`);
});

let retArr=[]
for (let index = 0; index < 3; index++) {
	retArr.push({
		name:"test",
		instance:index
	})
	
}