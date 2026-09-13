const screen = document.getElementById("screen");

function addValue(value) {
    screen.value += value;
}

function resetCalc() {
    screen.value = "";
}

function calculateResult() {
    if (screen.value === "") {
        return;
    }

    try {
        screen.value = Function("return " + screen.value)();
    } catch {
        screen.value = "Error";
    }
}
