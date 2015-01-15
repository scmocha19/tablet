// Simple study demonstrating the use of a tablet-designed webpage. 
// Study is designed using simple JS/HTML/CSS, with data saves to a server
// controlled by call to a short php script. 

// Overview: (i) Parameters (ii) Helper Functions (iii) Control Flow

// ---------------- PARAMETERS ------------------

var numTrials = 15;

//amount of white space between trials
var normalpause = 2500;

//pause after picture chosen, to display red border around picture selected
var timeafterClick = 1000;

//length of filler (every time fill2 comes up, add 1sec of time)
var fillerpause = 5000;

//an array of all the novel words used in the study; used for look-up purposes in pic1type, pic2type, and trialtype
var novelWords = ["modi", "dax", "pifo", "dofa", "toma", "fep", "wug", "kreeb"];

//******for handling sound; see helper function playPrompt(word)
var audioSprite = $("#sound_player")[0];
var handler;

// ---------------- HELPER ------------------

// show slide function
function showSlide(id) {
  $(".slide").hide(); //jquery - all elements with class of slide - hide
  $("#"+id).show(); //jquery - element with given id - show
}

//array shuffle function
shuffle = function (o) { //v1.0
    for (var j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
}

makePermutation = function(n) {
	var p = [];
	for (var i = 0; i < n; ++i) {
		p.push(i);
	}
	shuffle(p);
	return p;
}

shuffleByPermutation = function(arr, perm) {
	var result = [];
	for (var i = 0; i < perm.length; ++i) {
		result.push(arr[perm[i]]);
	}
	return result;
}

flatten = function(arr) {
	return arr.reduce(function(a, b) {
  		return a.concat(b);
	});
}

getCurrentDate = function() {
	var currentDate = new Date();
	var day = currentDate.getDate();
	var month = currentDate.getMonth() + 1;
	var year = currentDate.getFullYear();
	return (month + "/" + day + "/" + year);
}

//currently not called; could be useful for reaction time?
getCurrentTime = function() {
	var currentTime = new Date();
	var hours = currentTime.getHours();
	var minutes = currentTime.getMinutes();

	if (minutes < 10) minutes = "0" + minutes;
	return (hours + ":" + minutes);
}

//returns the word array; in the below order for list 1 and reversed for list 2
makeWordList = function(order, trainPermutation, testPermutation) {
	// order=1 means normal
	// order=2 means noisy
	// order=3 means implausible
	

	var testWords = shuffleByPermutation(
		["tiedie", "goatscoats",
 		"vanfan", "penpan", "ballbowl", "bugsbags", "capcup"],
		testPermutation);
	//var trainWords = shuffleByPermutation(
	//	[["book_table", "book_plane"], ["flowers_basket", "flowers_donut"],
	//	["house_door", "house_nose"], ["knife_fork", "knife_camel"], ["wooden_apples", "wooden_blocks"],
 	//	["cat_kittens", "cat_hammers"], ["bread_peanutbutter", "bread_ketchup"]],
	//	trainPermutation);
	
	if (order === 1) {
	var trainWords = shuffleByPermutation(
		["book_table", "bread_peanutbutter", "wooden_blocks", "flowers_basket", 
		"house_door", "shark_fish", "cat_kittens", "knife_fork"],
		trainPermutation);
	} else if (order === 2) {
	var trainWords = shuffleByPermutation(
		["pook_table", "bread_peanutbotter", "wooden_blucks", "flowers_pasket", "house_toor", 
		"zhark_fish", "cat_kettens", "knife_vork"],


		trainPermutation);
	} else {
		var trainWords = shuffleByPermutation(
			["plane", "ketchup", "apples", "donut", "nose", "racecar", "hammers", "camel"],
			trainPermutation);
	}
	
	// for (var i = 0; i < trainWords.length; ++i) {
	// 	trainWords[i] = trainWords[i][order - 1];
	// }

	var wordList = trainWords.concat(testWords);
	return wordList;

	// TODO: update the train/test words above with the names of the audio segments
	// update spriteData.js with the right info
	// return allWords and kill the stuff below
	//console.log(thingyouwantprinted)


	//var wordList = ["house_door", "shark_fish", "cat_kittens", "knife_fork", "tiedie", "goatscoats",
 	//	"vanfan", "penpan", "ballbowl", "bugsbags", "capcup"];
	//if (order === 2) {
	//	wordList = ["pook_table", "peanutbotter", "wooden_blucks", "flowers_pasket", "house_toor", "zhark_fish", "cat_kettens", "knife_vork", "tiedie", "goatscoats",
 	//	"vanfan", "penpan", "ballbowl", "bugsbags", "capcup"];
	//}
	//return wordList;
}

//returns the image array; in the below order for list 1 and reversed with side-sway for list 2
makeImageArray = function(order, trainPermutation, testPermutation) {
	// [[im1_option1, im1_option2], [im2_left, im2_right], ...]
	var train = shuffleByPermutation(trainImages, trainPermutation);
	var test = shuffleByPermutation(testImages, testPermutation);
	for (var i = 0; i < trainImages.length; i++) {
		shuffle(train[i]);
	}
	for (var i = 0; i < testImages.length; i++) {
		shuffle(test[i]);
	}
	var joinedImages = flatten(train).concat(flatten(test));
	return joinedImages;
}

getTrialType = function(word, leftpic, rightpic) {
   	var trialtype;
   	if (novelWords.indexOf(leftpic) === -1 && novelWords.indexOf(rightpic) === -1) {
  		trialtype = "rec";
   	} else if (novelWords.indexOf(word) === -1) {
   		trialtype = "MEcontrol";
   	} else {
   		trialtype = "MEexperimental";
   	}
   	return trialtype;  
}

createDot = function(dotx, doty, i, tag) {
	var dots;
	if (tag === "smiley") {
		dots = ["smiley1", "smiley2", "smiley3", "smiley4", "smiley5"];
	} else {
		dots = [1, 2, 3, 4, 5];
	}

	var dot = document.createElement("img");
	dot.setAttribute("class", "dot");
	dot.id = "dot_" + dots[i];
	if (tag === "smiley") {
		dot.src = "dots/dot_" + "smiley" + ".jpg";
	} else {
		dot.src = "dots/dot_" + dots[i] + ".jpg";
	}

    var x = Math.floor(Math.random()*950);
    var y = Math.floor(Math.random()*540);

    var invalid = "true";

    //make sure dots do not overlap
    while (true) {
    	invalid = "true";
	   	for (j = 0; j < dotx.length ; j++) {
    		if (Math.abs(dotx[j] - x) + Math.abs(doty[j] - y) < 250) {
    			var invalid = "false";
    			break; 
    		}
		}
		if (invalid === "true") {
 			dotx.push(x);
  		  	doty.push(y);
  		  	break;	
  	 	}
  	 	x = Math.floor(Math.random()*400);
   		y = Math.floor(Math.random()*400);
	}

    dot.setAttribute("style","position:absolute;left:"+x+"px;top:"+y+"px;");
   	training.appendChild(dot);
}

//Handles audio; indexes into the sprite to play the prompt associated with a critical word 
playPrompt = function(word) {
	audioSprite.removeEventListener('timeupdate',handler);
	audioSprite.currentTime = spriteData[word].start;
	audioSprite.play();

	handler = function() {
	    if (this.currentTime >= spriteData[word].start + spriteData[word].length) {
	        this.pause();
	    }
	};
	audioSprite.addEventListener('timeupdate', handler, false);
}

//CONTROL FLOW

//PRELOAD ALL IMAGES//---------------------------
var trainImages = [["book_table", "book_plane"], ["bread_peanutbutter", "bread_ketchup"], ["wooden_apples", "wooden_blocks"], 
		["flowers_basket", "flowers_donut"], ["house_door", "house_nose"], ["shark_fish", "shark_racecar"], ["cat_kittens", "cat_hammers"], 
		["knife_fork", "knife_camel"]];

var testImages = [["tiedie", "die"], ["goatscoats", "coats"],
 ["vanfan", "fan"], ["penpan", "pan"], ["ballbowl", "bowl"], ["bugsbags", "bags"], ["capcup", "cup"]];

var allimages = flatten(trainImages).concat(flatten(testImages));
//for critical trials and fillers
var images = new Array();
for (i = 0; i<allimages.length; i++) {
	images[i] = new Image();
	images[i].src = "tabletobjects/" + allimages[i] + ".jpg";
}

//for dot game
var dots = ["dot_1", "dot_2", "dot_3", "dot_4", "dot_5", "x", "dot_smiley"];
for (i = 0; i<dots.length; i++) {
	images[i] = new Image();
	images[i].src = "dots/" + dots[i] + ".jpg";
}
//-----------------------------------------------


showSlide("instructions");

// MAIN EXPERIMENT
var experiment = {

	subid: "",
		//inputed at beginning of experiment
	trialnum: 0,
		//trial number
	order: 1,
		//whether child received list 1 or list 2
	word: "",
		//word that child is queried on
	pic1: "",
		//the name of the picture on the left
	pic2: "",
		//the name of the picture on the right
	pic1type: "",
		//whether the picture on the left is familiar or novel 
	pic2type: "",
		//whether the picture on the right is familiar or novel
	side: "",
		//whether the child picked the left (L) or the right (R) picture
	chosenpic: "",
		//the name of the picture the child picked
	response: "",
		//whether the response was the correct response (Y) or the incorrect response (N)
	trialtype: "",
		//whether the trial was a word recognition (rec) or mutual exclusivity (me) trial;
		// control (MEcontrol) or experimental (MEexperimental)
	date: getCurrentDate(),
		//the date of the experiment
	timestamp: getCurrentTime(),
		//the time that the trial was completed at 
	reactiontime: 0,
	//TODO : add reaction time variable ***** 

	preStudy: function() {
		document.body.style.background = "black";
		$("#prestudy").hide();
		setTimeout(function () {
			experiment.next();
		}, normalpause);
	},

	//sets up and allows participants to play "the dot game"
	training: function(dotgame) {
		var allDots = ["dot_1", "dot_2", "dot_3", "dot_4", "dot_5", 
						"dot_smiley1", "dot_smiley2", "dot_smiley3", 
						"dot_smiley4", "dot_smiley5"];
		var xcounter = 0;
		var dotCount = 5;

		//preload sound
		if (dotgame === 0) {
			audioSprite.play();
			audioSprite.pause();
		}

		var dotx = [];
		var doty = [];

		if (dotgame === 0) {
			for (i = 0; i < dotCount; i++) {
				createDot(dotx, doty, i, "");
			}
		} else {
			for (i = 0; i < dotCount; i++) {
				createDot(dotx, doty, i, "smiley");
			}
		}
		showSlide("training");
		$('.dot').bind('click touchstart', function(event) {
	    	var dotID = $(event.currentTarget).attr('id');

	    	//only count towards completion clicks on dots that have not yet been clicked
	    	if (allDots.indexOf(dotID) === -1) {
	    		return;
	    	}
	    	allDots.splice(allDots.indexOf(dotID), 1);
	    	document.getElementById(dotID).src = "dots/x.jpg";
	    	xcounter++
	    	if (xcounter === dotCount) {
	    		setTimeout(function () {
	    			$("#training").hide();
	    			if (dotgame === 0) {		
	    				//hide old x marks before game begins again
	    				var dotID;
	    				for (i = 1; i <= dotCount; i++) {
	    					dotID = "dot_" + i;
	    					training.removeChild(document.getElementById(dotID));
	    				}
						experiment.training();
						dotgame++; 
					} else {
						//document.body.style.background = "black";
						setTimeout(function() {
							showSlide("prestudy");
							//experiment.next();
						}, normalpause*2);
					}
				}, normalpause*2);
			}
	    });	   
	},


	//Checks to see whether the experimenter inputted appropriate values before moving on with the experiment
	checkInput: function() {
		//subject ID
  		if (document.getElementById("subjectID").value.length < 1) {
			$("#checkMessage").html('<font color="red">You must input a subject ID</font>');
			return;
		}
  		experiment.subid = document.getElementById("subjectID").value;

		//list
		if (document.getElementById("order").value !== "1" && document.getElementById("order").value !== "2" && document.getElementById("order").value !== "3") {
			$("#checkMessage").html('<font color="red">For list, you must choose either a 1, 2, or 3</font>');
			return;
		}
		experiment.order = parseInt(document.getElementById("order").value);
		experiment.training(0);
	},

	//TODO: second training round?

	//the end of the experiment, where the background becomes completely black
    end: function () {
    	setTimeout(function () {
    		$("#stage").fadeOut();
    	}, normalpause);
    	showSlide("finished");
    	document.body.style.background = "black";
    },

    //for filler rounds; most experimental variables set to "na"; fades in the filler after the regular 
    //amount of time between rounds, and fades it out after the specified time "fillerpause"
	displayFiller: function(fillername, counter) {
		experiment.trialtype = "filler";
		experiment.word = fillername;
		experiment.trialnum = counter;
		experiment.pic1 = "na";
		experiment.pic2 = "na";
		experiment.pic1type = "na";
		experiment.pic2type = "na";
		experiment.side = "na";
		experiment.chosenpic = "na";
		experiment.response = "na";
		experiment.reactiontime = "na";
		experiment.processOneRow();

		var lengthoffiller = fillerpause;

		//boy filler is 1s longer
		if (fillername === "fill2") lengthoffiller += 1000;

		var filler_html = '<table align = "center" cellpadding="30"><tr><td align="center"><img class="pic" src="' + 'tabletobjects/' + fillername + '.jpg" id= "fillerPic"/></td></tr></table>';
		$("#filler").html(filler_html); 
		setTimeout(function() {
		 	$("#filler").fadeIn();
		 	playPrompt(fillername);
		}, normalpause);
		setTimeout(function() {
			$("#filler").fadeOut();
		}, lengthoffiller);
	},

	//concatenates all experimental variables into a string which represents one "row" of data in the eventual csv, to live in the server
	processOneRow: function() {
		var dataforRound = experiment.subid; 
		dataforRound += "," + experiment.order + "," + experiment.trialnum + "," + experiment.word;
		dataforRound += "," + experiment.pic1 + "," + experiment.pic2 + "," + experiment.pic1type + "," + experiment.pic2type;
		dataforRound += "," + experiment.side + "," + experiment.chosenpic + "," + experiment.response + "," + experiment.trialtype;
		dataforRound += "," + experiment.date + "," + experiment.timestamp + "," + experiment.reactiontime + "\n";
		$.post("http://langcog.stanford.edu/cgi-bin/SC_noisy/tabletstudysave.php", {postresult_string : dataforRound});	
	},

	// MAIN DISPLAY FUNCTION
  	next: function() {

  		var trainPermutation = makePermutation(trainImages.length);
  		var testPermutation = makePermutation(testImages.length);
		//returns the list of all words to use in the study - list dependent
  		var wordList = makeWordList(experiment.order, trainPermutation, testPermutation);
  		//returns the list of all images to use in the study - list dependent
		var imageArray = makeImageArray(experiment.order, trainPermutation, testPermutation);

		var objects_html = "";
		var counter = 1;
 			
   		// Create the object table (tr=table row; td= table data)
		//objects_html = '<table class = "centered" ><tr><td id=word colspan="2">' + wordList[0] + '</td></tr><tr>';;
	    
	   	//HTML for the first object on the left
		leftname = "tabletobjects/" + imageArray[0] + ".jpg";
		objects_html += '<table align = "center" cellpadding="30"><tr></tr><tr><td align="center"><img class="pic" src="' + leftname +  '"alt="' + leftname + '" id= "leftPic"/></td>';
	
		//HTML for the first object on the right
		rightname = "tabletobjects/" + imageArray[1] + ".jpg";
	   	objects_html += '<td align="center"><img class="pic" src="' + rightname +  '"alt="' + rightname + '" id= "rightPic"/></td>';
		
    	objects_html += '</tr></table>';
	    $("#objects").html(objects_html); 

	    $("#stage").fadeIn();

	    var startTime = (new Date()).getTime();
	    playPrompt(wordList[0]);
		
		//click disable for the first slide
		var clickDisabled = true;
		setTimeout(function() {clickDisabled = false;}, (spriteData[wordList[0]].length)*1000 + 300);

	    $('.pic').bind('click touchstart', function(event) {

	    	if (clickDisabled) {
	    		return;
	    	}
	    	
	    	//disable subsequent clicks once the participant has made their choice
			clickDisabled = true; 

	    	//time the participant clicked - the time the audio began - the amount of time between the beginning of the audio and the 
	    	//onset of the word 
	    	experiment.reactiontime = (new Date()).getTime() - startTime - (spriteData[wordList[0]].onset-spriteData[wordList[0]].start)*1000; 

	    	experiment.trialnum = counter;
	    	experiment.word = wordList[0];
	    	experiment.pic1 = imageArray[0];
	    	experiment.pic2 = imageArray[1];

	    	//get whether the left and right pictures were familiar or novel
	    	if (novelWords.indexOf(imageArray[0]) === -1) {
	    		experiment.pic1type = "familiar";
	    	} else {
	    		experiment.pic1type = "novel";
	    	}
	    	if (novelWords.indexOf(imageArray[1]) === -1) {
	    		experiment.pic2type = "familiar";
	    	} else {
	    		experiment.pic2type = "novel";
	    	}

	    	//Was the picture clicked on the right or the left?
	    	var picID = $(event.currentTarget).attr('id');
	    	if (picID === "leftPic") {
				experiment.side = "L";
				experiment.chosenpic = imageArray[0];
	    	} else {
				experiment.side = "R";
				experiment.chosenpic = imageArray[1];
			}
			
			//If the child picked the picture that matched with the word, then they were correct. If they did not, they were not correct.
			if (experiment.chosenpic === experiment.word) {
				experiment.response = "Y";
			} else {
				experiment.response = "N"
			}

			//what kind of trial was this?
			experiment.trialtype = getTrialType(experiment.word, imageArray[0], imageArray[1]);

			//Add one to the counter and process the data to be saved; the child completed another "round" of the experiment
			experiment.processOneRow();
	    	counter++;

	    	$(document.getElementById(picID)).css('margin', "-8px");
			$(document.getElementById(picID)).css('border', "solid 8px red");

			//remove the pictures from the image array that have been used, and the word from the wordList that has been used
			imageArray.splice(0, 2);
			wordList.splice(0, 1);

		
			setTimeout(function() {
				$("#stage").fadeOut();

				//there are no more trials for the experiment to run
				console.log("Counter: " + counter);
				if (counter === numTrials + 1) {
					experiment.end();
					return;
				}	

				var gap;
				//check to see if the next round is going to be a filler round; if so, display a filler
				if (wordList[0].indexOf("fill") !== -1) {
					experiment.displayFiller(wordList[0], counter);
					//remove the filler word so that the next round features the next critical word (do not change the images array)
					
					gap = fillerpause;

					//boy filler is 1s longer
					if (wordList[0] === "fill2") gap += 1000;

					//another round has now passed, so increment the counter and remove the filler word from the list
					wordList.splice(0, 1);
					counter++;

				} else {
					gap = 0;
				}

				//move on to the next round after either the normal amount of time between critical rounds, or after 
				//the filler has occurred
				setTimeout(function() {			
						document.getElementById("leftPic").src = "tabletobjects/" + imageArray[0] + ".jpg";
						document.getElementById("rightPic").src = "tabletobjects/" + imageArray[1] + ".jpg";

						//to make word display visible (as an alternative to sound), uncomment just change background of display to white
						//document.getElementById("word").innerHTML = wordList[0];

						$(document.getElementById(picID)).css('border', "none"); 
						$(document.getElementById(picID)).css('margin', "0px");

						$("#stage").fadeIn();

						//reactivate clicks only after a little bit after the prompt's word
						setTimeout(function() {clickDisabled = false;}, (spriteData[wordList[0]].length)*1000 + 300);

						startTime = (new Date()).getTime();
						playPrompt(wordList[0]);
				}, gap + normalpause);
			}, timeafterClick);
	    });
    },
}
		