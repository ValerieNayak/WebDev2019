// THE ALASKA REMOVER

// function doClick() {
//     alaska.style['fill'] = 'none';
// }

// var alaska = document.getElementById('AK');
// alaska.onclick = doClick;


// var VA = document.getElementById('VA');
// VA.onclick = function(ev) {
//     console.log(ev);
// }

// ---------- UNIX TIMER FUNCTIONS ---------- //

function startUnixTimer() {
	timer_2 = setInterval(displayUnixTimer, 100);
}

function stopUnixTimer() {
	clearInterval(timer_2);
}

function displayUnixTimer() {
	
	//DisplayBox.innerHTML = Date.now();
	myTimer += .1;
	// console.log(myTimer);
	DisplayBox.innerHTML = myTimer.toFixed(1);
	//DisplayBox.innerHTML = 0;
}

function clearTimer() {
    myTimer = 0;
    DisplayBox.innerHTML = myTimer;
}

function resetMap() {
    for (var i = 0; i < states.length; i++) {
        console.log(states[i].id);
        var state_name = states[i].id;
        document.getElementById(state_name).style['fill'] = '#AAA';
    }    
    NameBox.innerHTML = 'Click on a state';
}

function clickState(ev) {
    var colors = ['red', 'orange', 'pink', 'purple', 'turquoise', 'blue', 'magenta'];
    
    console.log(ev.target.id);
    var state_name = ev.target.id;
    NameBox.innerHTML = state_name;
    
    var my_color = colors[Math.floor(Math.random() * colors.length)]; //randomly select color from list
    document.getElementById(state_name).style['fill'] = my_color;
}

var DisplayBox = document.getElementById('textField_1');
var myTimer = 0;

var states = document.getElementById('outlines').children;
// var states = document.getElementsByClassName('displayContainer_1')
console.log('states');
console.log(states);

var NameBox = document.getElementById('textStateName');
// var FactBox = document.getElementById('funFact');

for (var i = 0; i < states.length; i++) {
    console.log(states[i]);
    states[i].onclick = clickState;
}