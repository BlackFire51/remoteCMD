import net from 'net';
import RemoteServer from './remoteServer'
import WebSocket from 'ws';
import fs from 'fs';


class RemoteServerManager{
	private server:net.Server
	private serverList:RemoteServer[]=[]
	private instanceCounter=0
	private waitingForNewInstance:supendetClient[]
	private appListUpdateCallbacks:Function[]
	
	constructor(){
		this.waitingForNewInstance=[]
		this.appListUpdateCallbacks=[]
		this.server = net.createServer(this.handleNewClient.bind(this))
		this.server.listen(1234);
		console.log("Start RemoteServerMgr on",1234)
	}
	private handleNewClient(socket:net.Socket){
		console.log("new Client ",socket.remoteAddress,socket.remotePort)
		
		// Handle incoming messages from clients.
		socket.on('data', (data)=> {
			let msg = data.toString()
			console.log( "> " + msg);
			if(msg=="keepAlive") return;
			try {
				let obj = JSON.parse(msg);
				if(obj.Type=="authReq"){
					console.log("new app key:",obj.appKey)
					socket.removeAllListeners('data')
					this.addNewServer(socket,obj.appKey)
					

				}
			} catch (error) {
				console.log("error parsing Msg",error)
			}
		});
		socket.on("error",(err)=>{
			console.log("Remote server connection has error",err)
		})
		
		//Remove the client from the list when it leaves
		socket.on('end',  ()=> {
			console.log("Client left",socket.remoteAddress,socket.remotePort)
			this.removeServer(socket)
		});
		socket.setTimeout(1000 * 5); // 5 sec
		socket.on('timeout', () => {
			console.log('socket timeout');
			socket.end();
		  });
	}
	getApp(appName:string,instanceId:number){
		let app =this.serverList.find(srv=>srv.appName==appName && srv.appInstanceId==instanceId)
		return app
	}
	getServerInstanceList(){
		let retArr=[]
		this.serverList.forEach(srv => {
			retArr.push({
				name:srv.appName,
				instance:srv.appInstanceId
			})
		});
		return retArr;
	}
	addNewServer(socket:net.Socket,appKey:string){
		let appTemplate = availableApps.find(app=>app.appKey==appKey)
		if(appTemplate==null){
			console.log("could not find sutable app")
			socket.destroy();
			return null;
		}
		let srv = new RemoteServer(socket);
		srv.appName=appTemplate.name;
		srv.appInstanceId=this.instanceCounter++
		this.serverList.push(srv)
		console.log("create new app instance",srv.appName+"#"+srv.appInstanceId)
		let clean=false;
		this.waitingForNewInstance.forEach(cln=>{
			if(cln.appName!=srv.appName) return;
			clean=true;
			srv.subscribeWebClient(cln.ws);
			cln.ws.send(JSON.stringify({
				Type:"InstanceResume",
				appInstanceId:srv.appInstanceId
			}))
		})
		if(clean){
			this.waitingForNewInstance=this.waitingForNewInstance.filter(cln=>cln.appName==srv.appName)
		}
		let list= this.getServerInstanceList()
		this.appListUpdateCallbacks.forEach(callback=>{
			callback(list)
		})
		socket.write("auth:"+srv.appInstanceId);
		return srv;
	}
	removeServer(socket:net.Socket){
		let idx= this.serverList.findIndex(srv=>srv.socket==socket);
		if(idx<0) return; 
		let srv= this.serverList[idx];
		let clnList=srv.Close();
		clnList.forEach(ws=>{
			this.waitingForNewInstance.push(new supendetClient(srv.appName,ws))
		})
		this.serverList.splice(idx, 1);
		let list= this.getServerInstanceList()
		this.appListUpdateCallbacks.forEach(callback=>{
			callback(list)
		})
	}
	registerToAppListUpdate(callback:(arr:any[])=>void){
		this.appListUpdateCallbacks.push(callback)
	}
}
const mgr= new RemoteServerManager();
export default mgr;

class availableApp{
	public appKey:string
	public name:string
	constructor(name:string,appKey:string){
		this.name=name;
		this.appKey=appKey;
	}
}
let availableApps=[]

function readAppsFile() {
	fs.readFile("./apps.json",(err,data)=>{
		if(err) return console.log("error opening apps file",err)
		try {
			let newApps = JSON.parse(data.toString())
			availableApps=newApps
			console.log("apps.json loaded")
		} catch (error) {
			console.log("apps file parse error",error)
		}
	})
}
readAppsFile()
fs.watchFile("./apps.json",(curr,prev)=>{
	console.log(`apps file Changed`);
	readAppsFile()
})



class supendetClient{
	public appName:string
	public ws:WebSocket
	constructor(name:string,client:WebSocket){
		this.appName=name;
		this.ws=client;
	}
}