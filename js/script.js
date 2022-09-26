const currentValue = document.querySelector('#current-value');
const total = document.querySelector('#total');

const inputArray = [];

// CHECKERS:
const checkInput			= /^(?:-|\+|\*|\/|\d|\.|\(|\))$/;
const checkSymbol			= /^(?:-|\+|\*|\/)$/;
const checkNumber			= /^(?:[-|\+]?\d*(?:\.\d?)?)$/;
const checkSign				= /^(?:-|\+)$/;
const checkDigit			= /^(?:\d|\.)$/;
let dotAvailable = true;


// -----------------------------------------------------------------------------

// Keydown -> numbers and operators:
document.querySelector('#calculator').addEventListener(
		'keydown',
		(event) => setOperation(event.key)
		);
// Numbers:
document.querySelectorAll('#numbers .number').forEach( (number) => {
			number.addEventListener('click', () => {
				setOperation(number.textContent);
			});
		});
// Operators:
document.querySelectorAll('#operators > button').forEach( (operator) => {
			operator.addEventListener('click', () => {
				setOperation(operator.id);
			});
		});
// Equal:
document.querySelector('#equal').addEventListener('click', equal);
// Clear:
document.querySelector('#clear').addEventListener('click', clear);


// -----------------------------------------------------------------------------

function clear() {
	currentValue.textContent = '0';
	inputArray.splice(0);
}
function equal() {
	const array = inputArray.map( value => {
				if (value[0] === '.') value = '0' + value;
				if (value[value.length-1] === '.') value += '0';
				return value;
			});
	total.textContent = getResults(array);
	inputArray.length = 0;
}

function runKeyEvent(key) {
	if (key === 'Delete') clear();
	if (key === 'Enter') equal();
	if (key === 'Backspace' && inputArray.length) {
		let index = inputArray.length - 1;
		let subArr = inputArray[index].split('');
		subArr.pop();
		inputArray[index] = subArr.join('');
		if (inputArray[index] === '') inputArray.pop();
		currentValue.textContent = inputArray.join('');
	}
}


// -----------------------------------------------------------------------------

function setOperation(newInput) {
	let lastInput = inputArray[inputArray.length-1] ?? '';
	let pushValue = newInput;

	dotAvailable = (lastInput.includes('.')) ? false : true;
	if (newInput === '.' && !dotAvailable) return;

	if ( !checkInput.test(newInput) ) return runKeyEvent(newInput);
	else if (checkSymbol.test(lastInput) &&
			 checkSymbol.test(newInput) ) {
		inputArray.pop();
	}
	// working with numbers: 123.45
	else if ((checkNumber.test(lastInput)  ||
				checkSign.test(lastInput)) &&
			   checkDigit.test(newInput) ) {
		console.log('here')
		inputArray.pop()
		pushValue = lastInput + newInput;
	}
	// cancel if not add some operator:
	if (!checkNumber.test(lastInput) &&
		!checkSymbol.test(lastInput) &&
		checkDigit.test(pushValue)) return;

	inputArray.push(pushValue);
	currentValue.textContent = inputArray.join('');
	console.log(inputArray);
}

function runOperation(operation) {
	console.log(operation)
	if (operation.length < 2) return operation[0] ?? 0;
	if (operation.every( i => !isNaN(i) )) {
		return operation.reduce( (a,b) => +a + +b );
	}

	let operate = (index) => {
		let operated = calc[`${operation[index]}`](operation[index-1],
												   operation[index+1]);
		(typeof operated === 'number') ?
		operation.splice(index-1, 3, operated.toFixed(5).replace(/(\.0+|0+)$/, '')):
		operation.splice(index-1, 3, operated);
	}

	let where = (symbol) => {
		let index = operation.indexOf(symbol);
		return (index >= 0) ? index : operation.length
	}
	// Third on precedence: multiply - divide
	let thirdPrecedence = /^(?:\*|\/)$/;
	if (operation.some( item => thirdPrecedence.test(item) )) {
		let multiplyIndex = where('*');
		let divideIndex = where('/');

		let operatorIndex = ( (multiplyIndex < divideIndex) ) ?
								multiplyIndex :
								divideIndex;
		operate(operatorIndex);
		return runOperation(operation);
	}
	return 0;
}

function getResults(operations) {
	if (checkSymbol.test( inputArray[inputArray.length-1] )) inputArray.pop();

	// ---------------------------------------------------------
	// I trying to support '(' ')'
	// so I'm going to leave this code that doesn't works:
	if (operations.some( i => i === '(' || i=== ')' )) {
		let start = (operations.includes('(')) ?
					operations.indexOf('(') + 1 :
					0;
		let end = (operations.includes(')')) ?
					operations.indexOf(')') :
					operations.length;
		console.log(`${start} <---> ${end}`);
		operations[start-1] = getResults(operations.slice(start, end));
		console.log(operations);
		operations.splice(start, end);

	}
	// ---------------------------------------------------------

	return runOperation(operations);
}


// -----------------------------------------------------------------------------

const calc = {
	'+': (a, b) => {return a + b},
	'-': (a, b) => {return a - b},
	'*': (a, b) => {return a * b},
	'/': (a, b) => {return (b==0)?'no by zero': a / b},
}


// TODO: I need to add code for Exponent, Root, Factorial...
//   NOTE: string.split('e|r|f') to find the values to work with
