        const display = document.getElementById('display');

        function appendToDisplay(value) {
            if (display.value === "0" && value !== ".") {
                if (value === '%') display.value += value;
                else display.value = value;
            } else {
                display.value += value;
            }
        }

        function clearDisplay() {
            display.value = "0";
        }

        function backspace() {
            if (display.value.length === 1) {
                display.value = "0";
            } else {
                display.value = display.value.slice(0, -1);
            }
        }

        function calculate() {
            let expression = display.value;
            try {
                // Convert percent signs
                expression = expression.replace(/(\d+(\.\d+)?)%/g, '($1/100)');
                // Evaluate safely
                let result = evaluateExpression(expression);
                if (isNaN(result) || !isFinite(result)) {
                    display.value = "Error";
                } else {
                    display.value = +parseFloat(result.toFixed(10)); // Remove float errors
                }
            } catch {
                display.value = "Error";
            }
        }

        // Shunting Yard Algorithm to evaluate the expression safely
        function evaluateExpression(expr) {
            let outputQueue = [];
            let operatorStack = [];
            let operators = {
                '+': { precedence: 2, associativity: 'Left' },
                '-': { precedence: 2, associativity: 'Left' },
                '*': { precedence: 3, associativity: 'Left' },
                '/': { precedence: 3, associativity: 'Left' }
            };

            let tokens = expr.match(/(\d+(\.\d+)?|\+|\-|\*|\/|\(|\))/g);
            if (!tokens) return NaN;
            for (let token of tokens) {
                if (/\d/.test(token)) {
                    outputQueue.push(parseFloat(token));
                } else if ("+-*/".includes(token)) {
                    while (
                        operatorStack.length &&
                        "+-*/".includes(operatorStack[operatorStack.length - 1]) &&
                        (
                            (operators[token].associativity === "Left" &&
                            operators[token].precedence <= operators[operatorStack[operatorStack.length - 1]].precedence) ||
                            (operators[token].associativity === "Right" &&
                            operators[token].precedence < operators[operatorStack[operatorStack.length - 1]].precedence)
                        )
                    ) {
                        outputQueue.push(operatorStack.pop());
                    }
                    operatorStack.push(token);
                } else if (token === '(') {
                    operatorStack.push(token);
                } else if (token === ')') {
                    while (operatorStack.length && operatorStack[operatorStack.length - 1] !== '(') {
                        outputQueue.push(operatorStack.pop());
                    }
                    operatorStack.pop();
                }
            }
            while (operatorStack.length) {
                outputQueue.push(operatorStack.pop());
            }

            // Evaluate RPN
            let stack = [];
            for (let item of outputQueue) {
                if (typeof item === 'number') {
                    stack.push(item);
                } else {
                    let b = stack.pop();
                    let a = stack.pop();
                    let r = 0;
                    switch (item) {
                        case '+': r = a + b; break;
                        case '-': r = a - b; break;
                        case '*': r = a * b; break;
                        case '/': r = a / b; break;
                        default: return NaN;
                    }
                    stack.push(r);
                }
            }
            return stack[0];
        }

        // Optional: Keyboard support
        document.addEventListener('keydown', function(event) {
            const key = event.key;
            if ((/\d/).test(key)) {
                appendToDisplay(key);
            } else if (key === '.') {
                appendToDisplay('.');
            } else if (['+', '-', '*', '/'].includes(key)) {
                appendToDisplay(key);
            } else if (key === 'Enter' || key === '=') {
                event.preventDefault();
                calculate();
            } else if (key === 'Backspace') {
                backspace();
            } else if (key.toLowerCase() === 'c') {
                clearDisplay();
            } else if (key === '%') {
                appendToDisplay('%');
            }
        });
    