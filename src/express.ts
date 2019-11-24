import express from 'express';
const app= express();
export default class mExpress{
	constructor(){
		
		app.use('/', express.static(__dirname+'/html'));
		app.get('/', function (req, res) {
			res.sendFile(__dirname+'/html/console.html')
		});
	}
	getApp(){
		return app;
	}
}