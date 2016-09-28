/*
* VoxelLoop Gaming BustaBit Bot (VLG-BB)
* Developed by CurtisVL
* voxelloop.co.uk
* Do not redistribute!
*
* Like the script? Consider donating me a few bits! :)
* BustaBit User: CurtisVL
*
* Disclaimer: No one is responsible if you lose money whilst using this script!
*/

//Version -- Do not change this variable
var version = 1.76;

//----------Site----------//
var BustaBit = true; 
// true = using BustaBit - false = using CS:GO Crash


//----------Bet amount----------//
var autoBaseBetEnabled = true; 
// Default: true - Enable/Disable auto base bet. Described below.

var maxLossCount = 8;
// Default: 8 - Max amount of loses to account for with autoBaseBetEnabled set to true.

var percentageOfTotal = 100;
// Default: 100 - Percentage of total balance to use when max loss is hit. (100 = 100%)

var baseBet = 10; 
// Default: 100 - Manual base bet, only used when autoBaseBetEnabled is false.

var cashOut = 1.50; 
// Default: 1.13 - Cash out at this amount. Some modes will have a locked cash out.

var maxBet = 99999999; 
// The max amount to bet - The lower this number, the slower you will earn back your loses.


//----------Crash Average----------//
//(Only used in modes 1)

var highAverage = 1.85; 
// Default: 1.85 - Average multiplier to use the highAverageMultiplier.

var highAverageMultiplier = 2.0;
// Default: 2.0 - Multiplier to use when crash average is above highAverage.

var lowAverage = 1.70;
// Default: 1.70 - Average multiplier to use the lowAverageMultiplier.

var lowAverageMultiplier = 1.02;
// Default: 1.05 - Multiplier to use when crash average is below lowAverage.

var waitForBeforeRecoveryEnabled = false;
// Default: false - Wait for x multiplier to hit before placing the recovery bet.

var waitForBeforeRecovery = 1.30;
// Default: 1.30 - Amount to wait for before placing recovery bet.

//----------Mode 2 Settings----------//
var mode2multiplyBy = 1.16;
// Default: 1.16 - Amount to multiply the base by on each loss.

var mode2waitAfterWin = 8;
// Default: 8 - How many rounds to wait after a win before placing again. (0 to disable)

//----------Mode 3 Settings----------//
var mode3cashOut = 2.1;
// Default: 2.1 - Amount to cash out in mode 3.

//----------Misc----------//
var maxNegative = 99999999; 
// The max amount to allow the profit to drop to before the bot will stop.

var randomBreak = 0; 
// Default: 0 - When a round starts, the bot will generate a number between 1 and 100.
// If the generated number is smaller than the randomBreak, the bot will wait a game before betting.

var clearConsole = true;
// Default: true - Clear the console after 500 minutes, usefull for running the bot on systems with low RAM.

var limitedConsole = false;
// Default: false - Limited console output, useful for running the bot 24/7, helps keep the browser responsive.

var reserveAmount = 10000;
// Default: 10000 - Amount to reserve after profiting.

//----------Modes----------//
var mode = 4; 

// 1 = Default - Mode will place a bet at the base amount and base multiplier. On loss, it will raise the bet by 4x and increase the multiplier to a max of 1.33x.
// *Deprecated* 2 = 9x Seeker - Mode will place the base amount and 9x multiplier. On loss, it will raise the bet by mode2multiplyBy until a 10x is reached.
// *Deprecated* 3 = Martingale - Multiplies on loss.
// 4 = Modified Pluscoup - The real deal.

//Do not edit below this line!

var user;
var startBalance = engine.getBalance();
var currentGame = -1;
var currentBet;
var lastBet;
var gameResult;
var gameInside;
var random;
var takingBreak = false;
var firstGame = true;
var lossCount = 0;
var winCount = 0;
var currentMultiplier;
var lossBalance = 0;
var firstLoss = true;
var lastResult;
var currency;
var useCrashAverage = true;
var startup = true;
var d = new Date();
var startTime = d.getTime();
var newdate;
var timeplaying;
var lastCrash;
var betPlaced = false;
var tempBet;
var tempCrash;
var gameAverage = 0;
var currentGame = 0;
var game1;
var game2;
var game3;
var game4;
var resetLoss;
var waitTime = -1;
var lossStreak;
var temptime = 120;
var firstGrab = true;
var recovering = false;
var excludeAmount = 0;

if(startup == true){
	if(mode == 2 || mode == 3){
		window.alert("These modes have been removed! Please use modes 1 or 4.");
		engine.stop();
	}
	
    printStartup();
	startup = false;
}

if(BustaBit == true){
	user = engine.getUsername();
	currency = "bits";
}
else{
	user = engine.getSteamID();
	currency = "coins";
}

//Game Starting
engine.on('game_starting', function(info){
	currentGameID = info.game_id;
	var random = randNum(1,100);
	
	if(game4 != null){
		gameAverage = (((game1 + game2) + (game3 + game4)) / 4);
	}
	else{
		gameAverage = 0;
	}
	
	if(random < randomBreak){
		takingBreak = true;
		console.log("Taking a random break this round!");
	}
	else{
		takingBreak = false;
	}
	
	if(gameAverage != 0 && mode == 1){
		console.log("Crash average: " + gameAverage + "x");
	}
	
	//Mode 4 Exclude
	if(mode == 4 & firstGame == true){
		if((engine.getBalance() - (excludeAmount * 100)) >= ((reserveAmount * 2) * 100)){
			mode4Exclude();
		}
	}
	
	function mode4Exclude(){
		if((engine.getBalance() - (excludeAmount * 100)) >= ((reserveAmount * 2) * 100)){
			console.log("Doubled exclude balance! Reserving balance for bust.");
			excludeAmount += reserveAmount;
		}
		if((engine.getBalance() - (excludeAmount * 100)) >= ((reserveAmount * 2) * 100)){
			mode4Exclude();
		}
	}
	
	//Auto base bet
	if(autoBaseBetEnabled == true && lastResult == "WON" && mode != 4 || firstGame == true && mode != 4){
		var divider = 100;
		for (i = 0; i < maxLossCount; i++) {
			if(mode == 1){
				divider += (100 * Math.pow(4, (i + 1)));
			}
			if(mode == 2){
				divider += (100 * Math.pow(mode2multiplyBy, (i + 1)));
			}
			if(mode == 3 || mode == 4){
				divider += (100 * Math.pow(2, (i + 1)));
			}
		}
		baseBet = Math.min(Math.max(1, Math.floor((percentageOfTotal/100) * engine.getBalance() / divider)), maxBet * 100);
	}
	
	//Mode 4 Auto base bet
	if(autoBaseBetEnabled == true && lastResult == "WON" && mode == 4 || firstGame == true && mode == 4){
		//var tempBalance = (engine.getBalance() - (excludeAmount * 100));
		var divider = 100;
		for (i = 0; i < maxLossCount; i++) {
			if(mode == 4){
				divider += (100 * Math.pow(2, (i + 1)));
			}
		}
		baseBet = Math.min(Math.max(1, Math.floor((percentageOfTotal/100) * (engine.getBalance() - (excludeAmount * 100)) / divider)), maxBet * 100);
	}
	
	if(takingBreak == false){
		
		//Gamemode 1 (Default)
		if(mode == 1){
			
			//Shutdown on max loss
			if(lossCount > maxLossCount){
				console.log("Max loss count reached! Shutting down...");
				engine.stop();
			}
			
			//Reset cooldown
			if (resetLoss == true) {
				if (lossCount == 0) {
				resetLoss = false;
			}
			else {
				lossCount--;
				console.log('Waiting a few games! Games remaining: ' + lossCount);
				return;
				}
			}
			
			//First Game
			if(firstGame == true && betPlaced == false){
				currentBet = baseBet;
				currentMultiplier = cashOut;
				if(game4 == null){
					currentMultiplier = 1.02;
				}
				firstGame = false;
				placeBet();
				newdate = new Date();
				timeplaying = ((newdate.getTime() - startTime) / 1000) / 60;
				betPlaced = true;
			}
			
			//On Lost
			if(lastResult == "LOST" && betPlaced == false && firstGame == false){
				
				if(firstLoss == true){
					lossBalance = 0;
					lossStreak = 0;
					firstLoss = false;
				}
				
				if(lastCrash >= waitForBeforeRecovery && waitForBeforeRecoveryEnabled == true){
					var lastLoss = currentBet;
					lossBalance += lastLoss;
					lastLoss /= 4;
					lossStreak++;
					
					currentBet *= 4;
					currentMultiplier = 1 + (lossBalance / currentBet);
					console.log("Bet changed to: " + currentBet);
					if(game4 == null){
						currentMultiplier = 1.02;
					}
					placeBet();
					betPlaced = true;
				}
				else if (waitForBeforeRecoveryEnabled == true){
					console.log("Waiting for " + waitForBeforeRecovery + "x before placing recovery bet.");
					console.log("----------------------------");
				}
				else if (waitForBeforeRecoveryEnabled == false){
					var lastLoss = currentBet;
					lossBalance += lastLoss;
					lastLoss /= 4;
					lossStreak++;
					
					currentBet *= 4;
					currentMultiplier = 1 + (lossBalance / currentBet);
					console.log("Bet changed to: " + currentBet);
					if(game4 == null){
						currentMultiplier = 1.02;
					}
					placeBet();
					betPlaced = true;
				}
			}
			
			//On Win
			if(lastResult == "WON" && betPlaced == false){
				
				currentBet = baseBet;
				currentMultiplier = cashOut;
				firstLoss = true;
				
				if(lossCount == 0 && useCrashAverage == true && gameAverage != 0){
					if(gameAverage < highAverage){
						currentMultiplier = cashOut;
					}
					if(gameAverage >= highAverage){
						currentMultiplier = highAverageMultiplier;
					}
					
					if(gameAverage < lowAverage){
						currentMultiplier = lowAverageMultiplier;
					}
				}
				
				if(game4 == null){
					currentMultiplier = 1.02;
				}
			
				placeBet();
				betPlaced = true;
			}
		}
		
		//Gamemode 4 (Pluscoup Modified)
		if(mode == 4){
			
			//First Game
			if(firstGame == true && betPlaced == false){
				currentBet = baseBet;
				currentMultiplier = cashOut;
				firstGame = false;
				placeBet();
				newdate = new Date();
				timeplaying = ((newdate.getTime() - startTime) / 1000) / 60;
				betPlaced = true;
			}
			
			//On Lost
			if(lastResult == "LOST" && betPlaced == false){
				if(firstLoss == true){
					lossBalance = 0;
					firstLoss = false;
					recovering = true;
				}
				lossBalance += lastBet;
				Math.ceil(lossBalance);
				console.log("Amount to recover: " + lossBalance);
				
				if(currentBet >= ((engine.getBalance() / 100) - excludeAmount)){
					console.log("Not enough balance to place next recovery bet!");
					if(excludeAmount > 0){
						excludeAmount -= reserveAmount;
						console.log("Using reserve balance...");
					}
					currentBet = baseBet;
					recovering = false;
					firstLoss = true;
					lossBalance = 0;
					placeBet();
					betPlaced = true;
				}
				
				else{
					placeBet();
					betPlaced = true;
				}
			}
			
			//On Win
			if(lastResult == "WON" && betPlaced == false){
				if(excludeAmount < 0){
					excludeAmount = 0;
				}
				
				if (recovering == true && lossBalance > 0){
					lossBalance -= ((currentBet * cashOut) - currentBet);
					Math.ceil(lossBalance);
					console.log("Amount to recover: " + lossBalance);
					currentBet *= 2;
					if((lossBalance * 2) < currentBet && lossBalance != 0){
						currentBet = (lossBalance * 2);
					}
					if (lossBalance <= 0) {
					    currentBet = baseBet;
					}
				}
				else if(lossBalance <= 0 && recovering == true){
					lossBalance = 0;
					console.log("Loss recovered!");
					firstLoss = true;
					currentBet = baseBet;
					recovering = false;
					
					if((engine.getBalance() - (excludeAmount * 100)) >= ((reserveAmount * 2) * 100)){
						console.log("Doubled start balance! Reserving balance for bust.");
						excludeAmount += reserveAmount;
					}
				}
				
				if(currentBet >= ((engine.getBalance() / 100) - excludeAmount)){
					console.log("Not enough balance to place next recovery bet!");
					if(excludeAmount > 0){
						excludeAmount -= reserveAmount;
						console.log("Using reserve balance...");
					}
					currentBet = baseBet;
					recovering = false;
					firstLoss = true;
					lossBalance = 0;
					placeBet();
					betPlaced = true;
				}
				
				else{
					placeBet();
					betPlaced = true;
				}
			}
		}
	}
});

engine.on('cashed_out', function(data){
	
});

engine.on('game_crash', function(data){
	betPlaced = false;
	gameResult = engine.lastGamePlay();
	gameInside = engine.lastGamePlayed();
	lastCrash = (data.game_crash / 100);
	
	newdate = new Date();
	timeplaying = ((newdate.getTime() - startTime) / 1000) / 60;
	
	if(takingBreak == true)
	{
		takingBreak = false;
	}
	
	if(mode == 4 && gameResult == "WON"){
		if((engine.getBalance() - (excludeAmount * 100)) >= ((reserveAmount * 2) * 100)){
			console.log("Doubled exclude balance! Reserving balance for bust.");
			excludeAmount += reserveAmount;
		}
	}
	
	if(gameResult == "WON" && gameInside == true){
		lastResult = "WON";
		winCount += 1;
		lossCount = 0;
		printResults();
	}
	else if(gameResult == "LOST" && gameInside == true){
		lastResult = "LOST";
		lossCount += 1;
		winCount = 0;
		printResults();
	}
	
	if(clearConsole == true){
		if(timeplaying == temptime){
			temptime += 120;
			console.clear();
		}
	}
	
	currentGame++;
	tempCrash = (data.game_crash / 100);
	if (tempCrash >= 2.0){
		tempCrash = 2.0;
	}
	if (tempCrash < 1.0){
		tempCrash = 1.0;
	}
	if (currentGame == 1){
		game1 = tempCrash;
	}
	else if(currentGame == 2){
		game2 = tempCrash;
	}
	else if(currentGame == 3){
		game3 = tempCrash;
	}
	else if(currentGame == 4){
		game4 = tempCrash;
	}
	else if(currentGame >= 5){
		currentGame = 1;
		game1 = tempCrash;
	}
});

function placeBet(){
	if(((engine.getBalance() / 100) - currentBet) < ((startBalance / 100) - maxNegative)){
		console.log('Max negative reached! Stopping bot.');
		engine.stop();
	}
	if(currentBet > maxBet){
		console.log("Max bet reached!");
		currentBet = maxBet;
	}
	engine.placeBet(currentBet * 100, Math.round(currentMultiplier * 100), false);
	console.log("----------------------------");
	console.log("Betting " + currentBet + " " + currency + ", cash out at " + currentMultiplier + "x");
	lastBet = currentBet;
}

function printStartup(){
	console.log("Bot started!");
	console.log(" ");
	console.log("VoxelLoop Bet-Bot");
	console.log("Version " + version);
	console.log("Start balance: ", (startBalance / 100));
	console.log(" ");
}

function printResults(){
	if(limitedConsole == false){
		if(currentGameID != null){
			console.log("Game ID: ", currentGameID);
		}
		console.log("Crashed at: " + lastCrash + "x"); 
		if(lastResult == "LOST"){
			console.log("Result: %c LOST", 'background: #ffffff; color: #ff0000');
		}
		else{
			console.log("Result: %c WON", 'background: #ffffff; color: #339933');
		}
		console.log("Win Count: ", winCount);
		console.log("Loss Count: ", lossCount);
		console.log(" ");
		console.log('Session profit: ' + ((engine.getBalance() - startBalance) / 100).toFixed(2) + ' ' + currency + ' in ' + Math.round(timeplaying) + ' minutes.');
		console.log(" ");
		if(mode == 4 && excludeAmount != 0){
			console.log("Reserve balance: " + excludeAmount);
		}
	}
	else{
		if(currentGameID != null){
			console.log("Game ID: ", currentGameID);
		}
		console.log('Session profit: ' + ((engine.getBalance() - startBalance) / 100).toFixed(2) + ' ' + currency + ' in ' + Math.round(timeplaying) + ' minutes.');
		if(mode == 4 && excludeAmount != 0){
			console.log("Reserve balance: " + excludeAmount);
		}
	}
}

function randNum(min,max)
{
    return Math.floor(Math.random()*(max-min+1)+min);
}