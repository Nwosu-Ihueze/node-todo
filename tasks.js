#!/usr/bin/env node

var fs = require('fs');
var chroma = require('@v3rse/chroma');
var moment = require('moment');

//Path to task json file
var TASK_JSON_PATH = "./.database.json";

console.log('')

//Creates a file for keeping track of tasks
function init() {
	//create file if it's present.
	if (!fs.existsSync(TASK_JSON_PATH)) {
		console.log("Initialising storage.\n Creating `.database.json` file");
		setData({
			uncompleted: [],
			completed: []
		});
	}

}

//Used to read some data from the JSON file
function getData() {
	//read file contents
	var contents = fs.readFileSync(TASK_JSON_PATH, 'utf8');

	//parse contents
	var data = JSON.parse(contents);

	return data;
}

//Used to write data to the JSON file
function setData(data) {
	// makes the object a JSON string
	var dataString = JSON.stringify(data, null, 2);

	//write to  file
	fs.writeFileSync(TASK_JSON_PATH, dataString, 'utf8');
}

//Displays usage
function usage() {
	console.log(chroma.lyellow('Usage:\n \nmytask [command]\n \nExamples:\n \nmytask add "My First Task" \nmytask list \nmytask list all \nmytask list done \nmytask check 1 --complete task \nmytask clear --Clear all Pending task from the list \nmytask clear done --Clear all completed task from the list \nmytask clear all --Clear all completed task and pending from the list \nmytask delete 1 --Remove uncompleted task from the list. \nmytask help'));
}

//Adds a task
function add(task) {
	//get data
	var data = getData();

	//add item to uncompleted
	data.uncompleted.push({
		task: task,
		dateCreated: Date.now()
	});

	//set data
	setData(data);

	//list
	list();
}

//Moves task from uncompleted task list to completed task list
function check(task) {
	//get data
	var data = getData();

	if(data.uncompleted[task]){
		//modify the data
		data.uncompleted[task].dateCompleted = Date.now();

		//move to completed tasks
		data.completed.push(
			data.uncompleted[task]
		);

		//remove from uncompleted
		//data.uncompleted.splice(task, task + 1);
		data.uncompleted.splice(task, 1);

		//set data
		setData(data);
	}else{
		displayError("No such task");
	}
	

	//list
	list();
}

//Remove uncompleted task from the list.
function del(task) {
	//get data
	var data = getData();

	if(data.uncompleted[task]){
		//delete item
		//data.uncompleted.splice(task, task + 1);
		//https://stackoverflow.com/a/21660092
		data.uncompleted.splice(task, 1);

		//set data
		setData(data);
	}else{
		displayError("No such task");
	}
	//list
	list();
}

//Clear all pending task from the list
function clear() {
	var data = getData();

	if(data.uncompleted){
		data.uncompleted = [];
		setData(data);
		displayError("All pending tasks cleared");
	}else{
		displayError("No tasks present!!");
	}

}

//Clear all completed task from the list
function clearDone() {
	var data = getData();

	if(data.completed){
		data.completed = [];
		setData(data);
		displayError("All completed tasks cleared");
	}else{
		displayError("No tasks present!!");
	}
}

//Clear all task from the list
function clearAll() {
	var data = getData();
	if(data.uncompleted || data.completed){
		data.uncompleted = [];
		data.completed = [];
		setData(data);
		displayError("All tasks cleared");
	}else{
		displayError("No tasks present!!");
	}
}

//Lists all pending tasks
function list(){
        var data = getData();

	if (data.uncompleted.length) {
		printUncompleted(data);	
	} else {
		displayError("No tasks added!!");
	}
}

//Lists all completed tasks
function listCompleted(){
        var data = getData();

	if (data.completed.length) {
		printCompleted(data);	
	} else {
		displayError("No tasks added!!");
	}
}

//Lists all tasks
function listAll() {

	//data
	var data = getData();

	if (data.uncompleted.length || data.completed.length) {
		
		printUncompleted(data);
		console.log("\n");	
		printCompleted(data);

	} else {
		displayError("No tasks added!!");
	}

}

//Utils

//Formating for errors
function displayError(string){
	console.log(chroma.bggreen(chroma.black(string)));
}

//Prints pending tasks
function printUncompleted(data){
	if (data.uncompleted.length) {
		//print the uncompleted list. using ANSI colors and formating
		console.log(chroma.underline.bgred("Pending:"));
		data.uncompleted.forEach(function (task, index) {
			console.log("\t",chroma.lyellow(index + 1 + ". ["),("❌"),chroma.lyellow("] "),chroma.italics.lblue(" ( Added " + moment(task.dateCreated).fromNow() + " ) "),task.task);
		});
	}
}

//Prints completed tasks
function printCompleted(data){
	if (data.completed.length) {
				//print the uncompleted list. using ANSI colors and formating
				console.log(chroma.underline.bggreen("Completed:"));
				data.completed.forEach(function (task, index) {
					console.log("\t",chroma.lyellow(index + 1 + ". ["),("✅"),chroma.lyellow("] "),chroma.italics.lblue(" ( " + moment(task.dateCompleted).fromNow() + " )"),chroma.strikethrough(task.task));
				});
			}
}

//Entry point
var command = process.argv[2];
var argument = process.argv[3];

init();

switch (command) {
	case "add":
		add(argument);
		break;
	case "check":
		check(argument - 1);
		break;
	case "delete":
		del(argument - 1);
		break;
	case "help":
		usage();
		break;
	case "clear":
		if(argument == "all"){
			clearAll();
		}else if(argument == "done"){
			clearDone();
		}else{
			clear();
		}
		break;
	case "list":
		if(argument == "all"){
			listAll();
		}else if(argument == "done"){
			listCompleted();
		}else{
			list();
		}	
		break;
	case undefined:
		list();
		break;
	default:
		displayError("Command not found!!");
		usage();
		break;
}

console.log('')
