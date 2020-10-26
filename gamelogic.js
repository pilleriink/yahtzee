//counters
var rolled = -1;
var round = 3;
var rounds = 3;
var startTime = 0;
var endTime = 0;

//players
var players = [{name: "", score: 0, rolls: 0}, {name: "", score: 0, rolls: 0}];
var allPlayers = true;
var turn = 1;

//table
var scores = ["Ones", "Twos", "Threes", "Fours", "Fives", "Sixes", "Three of a kind", "Four of a kind", 
"Full house", "Small straight", "Large straight",	"Chance", "YAHTZEE", "TOTAL SCORE"];

//localstorage list
var localStorageList = [{name:"names", list:[]}, {name:"scores", list:[]}, {name:"rolls", list:[]}, {name:"time", list:[]}];
	
//choose score
function chooseScore(element) {
	if (parseInt(element.id.substr(element.id.length - 1)) === turn && element.innerHTML !== "") {
		element.setAttribute("disabled", "true");
		document.getElementById("roll").disabled = false;
		calculateTotalScore();
		resetDiceDisabled();
		clearScores();
		endGameIfRoundsOver();
		giveTurnToNextPlayer();
		setTurnedRolledAndRoundCount("turn", "rolled", "round", 0, 1);
		rolled = -1;
	}
}

//roll the dices when clicking "ROLL DICE"
function rollDice() {
	checkRollCOunt();
	rolled += 1;
	players[turn - 1].rolls += 1;
	setTurnedRolledAndRoundCount("turn", "rolled", "round", rolled, 1);
	disableRollButtonIfTurnOver();
	getRandomDiceValues();
	calculateScore();
}

//end turn
function endTurn() {
	endGameIfRoundsOver();
	rolled = 0;
	giveTurnToNextPlayer();
	clearScores();
	resetDice();
}

//end game
function endGame() {
	endTime = new Date();
	clearScores();
	updatePlayerFinalScore();
	setVisibility("none", "none", "block");
	addToLocalStorageList();
	createResultsTable();
	
}

function updatePlayerFinalScore() {
	for (k=0; k<players.length; k++) {
		players[k].score = parseInt(document.getElementById(scores[13] + (k+1)).innerHTML);
	}
}

function addToLocalStorageList() {
	for (i=0; i< localStorageList.length; i++) {
		localStorageList[i].list = [];	
	}
	getDataFromLocalStorage();
	updateLocalStorage();
	for (i=0; i< localStorageList.length; i++) {
		localStorage.setItem(localStorageList[i].name, localStorageList[i].list);
	}
	for (i=0; i< localStorageList.length; i++) {
		localStorageList[i].list.reverse();
	}
}

function getDataFromLocalStorage() {
	if (localStorage.getItem("names")) {
		for (i=0; i< localStorageList.length; i++) {
			localStorageList[i].list = localStorage.getItem(localStorageList[i].name).split(",");
		}
		if (localStorageList[0].list.length >= 18) {
			for (i=0; i< localStorageList.length; i++) {
				localStorageList[i].list = localStorageList[i].list.slice(localStorageList[i].list.length-18, localStorageList[i].list.length);
			}
		}
	}
}

function updateLocalStorage() {
	for (i=0; i<players.length; i++) {
		localStorageList[0].list.push(players[i].name);
		localStorageList[1].list.push(players[i].score);
		localStorageList[2].list.push(players[i].rolls);
		localStorageList[3].list.push(Math.round(((endTime - startTime)/1000)/60));
	}
}

function createResultsTable() {
	var table = document.getElementById("results");
	for (i=-1; i<20; i++) {
		var row = table.insertRow();
		var cells = [];
		for (j=0; j<4; j++) {
			var cell = row.insertCell();
			cells.push(cell);
		}
		if (i==-1) {
			for (j=0; j<4; j++) {
				cells[j].innerHTML = localStorageList[j].name;
			}
		} else {
			for (j=0; j<4; j++) {
				if (typeof localStorageList[j].list[i] !== "undefined") {
					cells[j].innerHTML = localStorageList[j].list[i];
				}
			}
		}	
	}
}

//choose dices when clicking on a dice
function chooseDice(i) {
	document.getElementById("dice" + i).setAttribute("class", "chosenDice" + document.getElementById("dice" + i).className.substr(10, 11));
	document.getElementById("dice" + i).setAttribute("cursor", "not-allowed");
	document.getElementById("dice" + i).setAttribute("disabled", "true");
}

//create table
function createTable() {
	var table = document.getElementById("table");
	for (i=-1; i<scores.length; i++) {
		var row = table.insertRow();
		var cell1 = row.insertCell();
		if (i==-1) {
			cell1.innerHTML = "";
			for (k=0; k<players.length; k++) {
				var cell2 = row.insertCell();
				cell2.innerHTML = players[k].name;
			}
		} else {
			cell1.innerHTML = scores[i];
			for (j=1; j<=players.length; j++) {
				var cell2 = row.insertCell();
				var btn = document.createElement("BUTTON");
				btn.setAttribute("id", scores[i] + j);
				btn.className = "btn";
				cell2.appendChild(btn);
				btn.onclick = function() {chooseScore(this)};
			}
		}	
	}
	document.getElementById(scores[13] + 1).setAttribute("disabled", "true");
	document.getElementById(scores[13] + 2).setAttribute("disabled", "true");
}

//submit players when starting game
function submitPlayers() {
	startTime = new Date();
	for (i=1; i<=players.length; i++) {
		players[i-1].name = document.getElementById("player" + i).value
		if (document.getElementById("player" + i).value == "") {
			allPlayers = false;
		}
	}
	if (allPlayers == true) {
		round = document.getElementById("turns").value;
		rounds = document.getElementById("turns").value;
		setVisibility("none", "block", "none");
		createTable();
	}
	allPlayers = true;
	resetDiceDisabled();
	setTurnedRolledAndRoundCount("turn", "rolled", "round", 0, 1);
}

//play again after finishing a game
function playAgain() {
	resetPlayers();
	setVisibility("block", "none", "none");
	deleteTable(14, "table");
	deleteTable(20, "results");
	rolled = -1;
}

//calculate score
function calculateScore() {
	fillOutScores();
	findNumberSums();
	for (i=1; i<4; i++) {
		calculateOfAKind(i);
	}
	if (!isChosen(8)) {
		calculateFullHouse();
	}
	calculateStraight();
	calculateCount();
}

function findNumberSums() {
	for (i=1; i<7; i++) {
		if (!isChosen(i-1)) {
			calculateSums(i);
		}
	}
}

function calculateSums(i) {
	var count = 0;
	for (j=1; j<6; j++) {
		if (getDiceValueFromClass(j, 10, 11) === i) {
			count += getDiceValueFromClass(j, 10, 11);
		}
	}
	getScoreValue(i-1).innerHTML = count;
}
	
function calculateOfAKind(i){
	var sameKindList = addSameKindToList(i);
	var count = 0;
	if (sameKindList.length >= 3) {
		for (k=0; k<sameKindList.length; k++) {
			count += sameKindList[k];
		}
		controlIfSameKindAndAdd(sameKindList, 3, 6, count);
		controlIfSameKindAndAdd(sameKindList, 4, 7, count);
		controlIfSameKindAndAdd(sameKindList, 5, 12, 50);
	}
}

function addSameKindToList(i) {
	var sameKindList = [];
	sameKindList.push(getDiceValueFromClass(i, 10, 11));
	for (j=i+1; j<6; j++) {
		if (getDiceValueFromClass(i, 10, 11) === getDiceValueFromClass(j, 10, 11)) {
			sameKindList.push(getDiceValueFromClass(j, 10, 11));
		}
	}
	return sameKindList;
}

function controlIfSameKindAndAdd(sameKindList, length, index, value) {
	if (sameKindList.length === length && !isChosen(index)) {
		getScoreValue(index).innerHTML = value;
	}
}

function calculateFullHouse() {
	var firstKind = [];
	var secondKind = [];
	firstKind.push(getDiceValueFromClass(1, 10, 11));
	for (i=2; i<6; i++) {
		if (firstKind.includes(getDiceValueFromClass(i, 10, 11))) {
			firstKind.push(getDiceValueFromClass(i, 10, 11));
		} else if (secondKind.includes(getDiceValueFromClass(i, 10, 11))) {
			secondKind.push(getDiceValueFromClass(i, 10, 11));
		} else if (secondKind.length === 0) {
			secondKind.push(getDiceValueFromClass(i, 10, 11));
		}
	}
	if (firstKind.length === 3 && secondKind.length === 2 || firstKind.length === 2 && secondKind.length === 3) {
		getScoreValue(8).innerHTML = 25;
	}
}

function calculateStraight() {
	var straightList = [];
	var diceList = [];
	for (i=1; i<6; i++) {
		diceList.push(getDiceValueFromClass(i, 10, 11));
	}
	diceList.sort(function(a, b){return a - b});
	straightList.push(diceList[0]);
	var count = 0;
	for (i=1; i<diceList.length; i++) {
		if (straightList[count] === diceList[i] - 1) {
			straightList.push(diceList[i]);
			count += 1;
		}
	}
	if (straightList.length === 4 && !isChosen(9)) {
		getScoreValue(9).innerHTML = 30;
	}
	if (straightList.length === 5 && !isChosen(10)) {
		getScoreValue(10).innerHTML = 40;
	}
}

function calculateCount() {
	if (!isChosen(11)) {
		var count = 0;
		for (i=1; i<7; i++) {
			if (!getScoreValue(i).disabled) {
				count += parseInt(getScoreValue(i).innerHTML);
			}
		}
		getScoreValue(11).innerHTML = count;
	}
}

function isChosen(index) {
	return getScoreValue(index).disabled
}

function calculateTotalScore() {
	var count = 0;
	for (i=0; i<13; i++) {
		if (getScoreValue(i).disabled) {
			count += parseInt(getScoreValue(i).innerHTML);
		}
	}
	getScoreValue(13).innerHTML = count;
}

//smaller helping functions

function getScoreValue(i) {
	return document.getElementById(scores[i] + turn);
}

function getDiceValueFromClass(i, j, k) {
	return parseInt(document.getElementById("dice" + i).className.substr(j, k));
}


function clearScores() {
	for (i=0; i<scores.length-1; i++) {
		if (!isChosen(i)) {
			document.getElementById(scores[i] + turn).innerHTML = "";
		}
	}
}

function fillOutScores() {
	for (i=0; i<scores.length-1; i++) {
		if (!isChosen(i)) {
			document.getElementById(scores[i] + turn).innerHTML = "0";
		}
	}
}

function resetDiceNotDisabled() {
	for (i=1; i<6; i++) {
		document.getElementById("dice" + i).setAttribute("class", "rolledDice" + getDiceValueFromClass(i, 10, 11));
		document.getElementById("dice" + i).removeAttribute("disabled");
	}
}

function resetDiceDisabled() {
	for (i=1; i<6; i++) {
		document.getElementById("dice" + i).setAttribute("class", "rolledDice" + getDiceValueFromClass(i, 10, 11));
		document.getElementById("dice" + i).setAttribute("disabled", "true");
	}
}

function setTurnedRolledAndRoundCount(turnName, rolledName, roundName, i, j) {
	document.getElementById(turnName).innerHTML = players[turn-j].name + "'s turn";
	document.getElementById(rolledName).innerHTML = "Rolled: " + i + "/3";
	document.getElementById(roundName).innerHTML = "Round: " + (rounds - round + 1) + "/" + rounds;
}

function checkRollCOunt() {
	if (rolled === -1) {
		rolled = 0;
		resetDiceNotDisabled();
	} else if (rolled === 3) {
		endTurn();
	}
}

function getRandomDiceValues() {
	for (i=1; i<6; i++) {
		if (document.getElementById("dice" + i).className.substr(0, 10) !== "chosenDice") {
			var value = Math.floor(Math.random() * 6 + 1);
			document.getElementById("dice" + i).setAttribute("class", "rolledDice" + value);
		}
	}
}

function disableRollButtonIfTurnOver() {
	if (rolled === 3) {
		document.getElementById("roll").setAttribute("disabled", "true");
	}
}

function giveTurnToNextPlayer() {
	if (turn === 1) {
		turn = 2;
	}
	else {
		turn = 1;
	}
}

function deleteTable(i, tableName) {
	for (k=i; k>=0; k--) {
		document.getElementById(tableName).deleteRow(k);	
	}
}

function resetPlayers() {
	for (i=0; i<players.length; i++) {
		players[i].name = "";
		players[i].score = 0;
		document.getElementById("player" + (i+1)).innerHTML = "";
	}
}

function endGameIfRoundsOver() {
	if (turn === 2) {
			round -= 1;
			if (round === 0) {
				endGame();
			}
		}
}

function setVisibility(register, game, results) {
	document.getElementById("submitBlock").style.display = register;
	document.getElementById("gameBlock").style.display = game;
	document.getElementById("resultsBlock").style.display = results;
}
