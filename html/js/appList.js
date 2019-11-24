$('.console').hide()
$('.appList').show()

let activeAppName=null;
let activeAppInstanceId=-1;
function fillAppList(array){
	let list=$('.appList-inner')
	list.empty()
	if(array.length<1){
		$('<div/>',{
			text:`No Active App!`
		}).appendTo(list)
		return
	}
	array.forEach(app => {
		$('<div/>',{
			class:'appList-entry',
			text:`${app.name}#${app.instance}`
		}).appendTo(list).click(()=>{
			setConsole(app)
		});
	});
}

function setConsole(app){
	activeAppName=app.name
	activeAppInstanceId=app.instance
	$('.appList').hide()
	$('.console').show()
	clear()
	ws.send(JSON.stringify({
		Type:"subscribeCmd",
		appName:activeAppName,
		appInstanceId:activeAppInstanceId
	}))
}