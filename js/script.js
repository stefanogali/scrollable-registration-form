window.onload = function() {
	//document has loaded
	let button = document.querySelector('.button');
	const formOuterContainer = document.querySelector('.form-outer-container');
	const formInnerContainer = document.querySelector('.visible-container');
	const inputContainers = document.querySelectorAll('.input-container');
	const arrowsContainer = document.getElementsByClassName("arrows")[0];
	const topArrow = arrowsContainer.getElementsByClassName("top-arrow")[0];
	const bottomArrow = arrowsContainer.getElementsByClassName("bottom-arrow")[0];
	let transitioning = false;

	const moveTopPos = (el, heightToMove, moveBackwards = false) => {
		let was = getComputedStyle(el).top;
		if (!moveBackwards){
			el.style.top = `${getComputedStyle(el).top.split('px')[0] - heightToMove}px`
			return;
		}

		el.style.top = `${Number(was.split('px')[0]) + Number(heightToMove)}px`;
		// console.log(`top position is now: ${getComputedStyle(el).top.split('px')[0]}px, was: ${was}`)
	}

	const getStyleFromElement = (element) => {
		let generalStyle = {};
		const style = element.currentStyle || window.getComputedStyle(element);
		generalStyle.height = element.offsetHeight;
		generalStyle.width = element.offsetWidth;
		generalStyle.margins = parseFloat(style.marginLeft) + parseFloat(style.marginRight) + parseFloat(style.marginTop) + parseFloat(style.marginBottom);
		generalStyle.paddings = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight) + parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
		return generalStyle;
	}

	const validateInput = (inputDiv, input) => {
		const validation = {};
		let value = input.value;
		if (value.length < 3) {
			validation.error = true;
			validation.errortext = 'Input should be longer'
			return validation;
		}
		if (inputDiv.contains(inputDiv.getElementsByClassName("error")[0])) {
			inputDiv.getElementsByClassName("error")[0].remove();
		}
		return validation.error = false
	}

	const appendErrorClass = (inputDiv, errorMessage) => {
		inputDiv.classList.add("shake");
		let errorDiv = document.createElement('div');
		errorDiv.className = 'error';
		
		if (!inputDiv.contains(inputDiv.getElementsByClassName("error")[0])) {
			inputDiv.appendChild(errorDiv);
		}
		errorDiv.innerHTML ='';
		errorDiv.innerHTML =`<p>${errorMessage}</p>`;
		inputDiv.addEventListener('animationend', function() {
			inputDiv.classList.remove("shake");
		})
	}

	// button.addEventListener("click", () => {
	// 	regTransition(formInnerContainer, inputContainers);
		// });
		
	const regTransition = (formContainer, inputContainers) => {

		formContainer.ontransitionend = () => {
			if (document.getElementsByClassName("current")[0].classList.contains('success-message-container')){
				return;
			} else {
				document.getElementsByClassName("current")[0].getElementsByTagName('input')[0].focus();
				transitioning = false;
			}
		};

		if(transitioning) {
			return;
		}
		
		let currentInput = document.getElementsByClassName("input-container current")[0];
		currentInput.getElementsByTagName('input')[0].readOnly = true;
		const isValid = validateInput(currentInput, currentInput.getElementsByTagName('input')[0]);
		if(isValid.error === true){
			currentInput.getElementsByTagName('input')[0].readOnly = false;
			appendErrorClass(currentInput, isValid.errortext);
			return;
		}
		if (currentInput.nextElementSibling != null){
			const currentInputStyles = getStyleFromElement(currentInput);
			inputContainers.forEach(node => {
				node.classList.remove("current");
			});
			currentInput.nextElementSibling.classList.add("current");
			transitioning = true;
			moveTopPos(formContainer, currentInputStyles.height + currentInputStyles.margins);
		}
	}

	const regBackwardstransition = (formContainer, inputContainers) => {
		inputContainers.forEach(node => {
			node.getElementsByTagName('input')[0].readOnly = false;
		});
		formContainer.ontransitionend = () => {
			console.log("trnasition ended");
			transitioning = false;
		};

		if(transitioning) {
			return;
		}

		let currentInput = document.getElementsByClassName("input-container current")[0];
		if (currentInput.previousElementSibling != null){
			const currentInputStyles = getStyleFromElement(currentInput);
			console.log("currentInputStyles", currentInputStyles.height + currentInputStyles.margins)
			inputContainers.forEach(node => {
				node.classList.remove("current");
			});
			currentInput.previousElementSibling.classList.add("current");
			transitioning = true;
			moveTopPos(formContainer, currentInputStyles.height + currentInputStyles.margins, true);
		}
	}

	//bind events

	[bottomArrow, button].forEach((element)=>{
		element.addEventListener('click', ()=>{
			regTransition(formInnerContainer, inputContainers);
		});
	});
	
	//bind return key to inputs
	inputContainers.forEach(node => {
		node.addEventListener("keyup", function(event) {
			event.preventDefault();
			if (event.keyCode === 13) {
				regTransition(formInnerContainer, inputContainers);
			}
		});
	});


	formOuterContainer.addEventListener("wheel", function(event) {
		const delta = Math.sign(event.deltaY);
		if (delta > 0) {
			regTransition(formInnerContainer, inputContainers);
		} else {
			regBackwardstransition(formInnerContainer, inputContainers);
		}
	});


	topArrow.addEventListener("click", () => {
		regBackwardstransition(formInnerContainer, inputContainers);
	});
};