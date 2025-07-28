window.addEventListener("DOMContentLoaded", () => {
	// Initialize all DOM elements
	const elements = {
		button: document.querySelector(".button"),
		formOuterContainer: document.querySelector(".form-outer-container"),
		formInnerContainer: document.querySelector(".visible-container"),
		inputContainers: document.querySelectorAll(".input-container"),
		topArrow: document.querySelector(".top-arrow"),
		topTransparency: document.querySelector(".top-transparency"),
		bottomTransparency: document.querySelector(".bottom-transparency"),
	};

	let transitioning = false;

	// Utility functions
	const moveTopPos = (element, heightToMove, moveBackwards = false) => {
		const currentTop = parseInt(getComputedStyle(element).top) || 0;
		const newTop = moveBackwards ? currentTop + heightToMove : currentTop - heightToMove;
		element.style.top = `${newTop}px`;
	};

	const getElementDimensions = (element) => {
		const style = window.getComputedStyle(element);
		const parseStyleValues = (properties) => {
			return properties.reduce((sum, prop) => sum + (parseFloat(style[prop]) || 0), 0);
		};

		return {
			height: element.offsetHeight,
			width: element.offsetWidth,
			margins: parseStyleValues(["marginLeft", "marginRight", "marginTop", "marginBottom"]),
			marginBottom: parseFloat(style.marginBottom) || 0,
		};
	};

	const validateInput = (inputDiv, input) => {
		const value = input.value.trim();

		if (value.length < 3) {
			return {
				error: true,
				errorText: "Input should be longer",
			};
		}

		// Remove existing error if validation passes
		const existingError = inputDiv.querySelector(".error");
		if (existingError) {
			existingError.remove();
		}

		return { error: false };
	};

	const showError = (inputDiv, errorMessage) => {
		inputDiv.classList.add("shake");

		let errorDiv = inputDiv.querySelector(".error");
		if (!errorDiv) {
			errorDiv = document.createElement("div");
			errorDiv.className = "error";
			inputDiv.appendChild(errorDiv);
		}

		errorDiv.innerHTML = `<p>${errorMessage}</p>`;

		// Remove shake class after animation
		inputDiv.addEventListener(
			"animationend",
			() => {
				inputDiv.classList.remove("shake");
			},
			{ once: true }
		);
	};

	const getCurrentInput = () => {
		return document.querySelector(".input-container.current");
	};

	const handleTransitionEnd = () => {
		const currentElement = document.querySelector(".current");

		if (currentElement?.classList.contains("success-message-container")) {
			transitioning = false;
			return;
		}

		const currentInput = currentElement?.querySelector("input");
		if (currentInput) {
			currentInput.focus();
		}

		transitioning = false;
	};

	const performTransition = (fromInput, toInput, isBackward) => {
		const dimensions = getElementDimensions(fromInput);

		// Update current class
		elements.inputContainers.forEach((container) => {
			container.classList.remove("current");
		});
		toInput.classList.add("current");

		transitioning = true;

		// Set up transition end handler
		elements.formInnerContainer.ontransitionend = handleTransitionEnd;

		// Move the container
		moveTopPos(
			elements.formInnerContainer,
			dimensions.height + dimensions.marginBottom,
			isBackward
		);
	};

	const transitionToNext = () => {
		if (transitioning) return;

		const currentInput = getCurrentInput();
		if (!currentInput) return;

		const input = currentInput.querySelector("input");
		input.readOnly = true;

		const validation = validateInput(currentInput, input);
		if (validation.error) {
			input.readOnly = false;
			showError(currentInput, validation.errorText);
			return;
		}

		const nextSibling = currentInput.nextElementSibling;
		if (!nextSibling) return;

		performTransition(currentInput, nextSibling, false);
	};

	const transitionToPrevious = () => {
		if (transitioning) return;

		// Make all inputs editable
		elements.inputContainers.forEach((container) => {
			const input = container.querySelector("input");
			if (input) input.readOnly = false;
		});

		const currentInput = getCurrentInput();
		if (!currentInput) return;

		const previousSibling = currentInput.previousElementSibling;
		if (!previousSibling) return;

		performTransition(currentInput, previousSibling, true);
	};

	// Event binding
	const bindEvents = () => {
		// Forward navigation
		elements.button?.addEventListener("click", transitionToNext);

		elements.topTransparency?.addEventListener("click", () => {
			const currentInput = getCurrentInput();
			const previousInput = currentInput?.previousElementSibling;

			if (previousInput) {
				transitionToPrevious();
			}
		});

		elements.bottomTransparency?.addEventListener("click", () => {
			const currentInput = getCurrentInput();
			const nextInput = currentInput?.nextElementSibling;

			if (nextInput) {
				transitionToNext();
			}
		});

		// Keyboard navigation
		elements.inputContainers.forEach((container) => {
			container.addEventListener("keyup", (event) => {
				if (event.key === "Enter") {
					event.preventDefault();
					transitionToNext();
				}
			});
		});

		// Optional: Mouse wheel navigation
		/*
        elements.formOuterContainer?.addEventListener("wheel", (event) => {
            const delta = Math.sign(event.deltaY);
            if (delta > 0) {
                transitionToNext();
            } else {
                transitionToPrevious();
            }
        });
        */
	};

	// Initialize the form
	bindEvents();
});
