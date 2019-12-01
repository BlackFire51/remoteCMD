import net from 'net';
import WebSocket from 'ws';


export default class RemoteServer{
	public socket:net.Socket
	public appName:string
	public appInstanceId:number
	public subscribedWebClients:WebSocket[]
	private functionData:any[]
	
	constructor(socket:net.Socket){
		this.socket=socket
		this.subscribedWebClients=[]
		this.functionData=[]
		socket.on('data', (data)=> {
			let msg = data.toString()
			if(msg=="keepAlive") return;
			console.log( "> " + msg);
			try {
				let obj = JSON.parse(msg);
				if(!this.handleDataLocal(obj)){
					this.subscribedWebClients.forEach(ws=>{
						ws.send(msg)
					})
				}
			} catch (error) {
				console.log("error parsing Msg",error)
				this.subscribedWebClients.forEach(ws=>{
					ws.send(msg)
				})
			}
		});
	}
	public subscribeWebClient(ws:WebSocket){
		this.subscribedWebClients.push(ws)
		let functionStr= JSON.stringify({
			Type:"subscripedTo",
			appName:this.appName,
			appInstanceId:this.appInstanceId,
			functionData:this.functionData
		})
		ws.send(functionStr)
	}
	public Close(){
		this.subscribedWebClients.forEach(ws=>{
			ws.send(JSON.stringify({
				Type:"InstanceClosed"
			}))
		})
		return this.subscribedWebClients;
	}

	private handleDataLocal(obj){
		switch (obj.Type) {
			case "cmdFunctionList":
				this.functionData=obj.Items
				let functionStr= JSON.stringify({
					Type:"updateFunctions",
					appName:this.appName,
					appInstanceId:this.appInstanceId,
					functionData:this.functionData
				})
				this.subscribedWebClients.forEach(c=>{
					c.send(functionStr)
				})
				
				return true;
			default:
				return false;
		}
		
	}
	public execCmd(cmd:string,args:string[]){
		this.socket.write(JSON.stringify({
			Type:"Cmd",
			cmd:cmd,
			args:args
		}))
	}


}


