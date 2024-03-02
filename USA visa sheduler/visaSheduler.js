const CITY_DROPDOWN_ID = "#post_select";
const DATE_PICKER_ID = "#datepicker";
const RADIO_BUTTON_SELECTOR = '[name="schedule-entries"]';
const SUBMIT_BUTTON_ID = "#submitbtn";
const MONTH_DROPDOWN_SELECTOR = '[data-handler="selectMonth"]';
const TABLE_FIRST_DATA = ".table tbody tr td";
let isScriptRunning = false;

const cityIndex = {
    // chennai: 1,
    // hydrabad: 2,
    // kolkata: 3,
    mumbai: 4,
    newDelhi: 5,
};

const month_range = 2;
const slow = 1;

// Create UI elements
const container = document.createElement('div');
container.style.position = 'fixed';
container.style.top = '10px';
container.style.right = '10px';
container.style.zIndex = '9999';

const startButton = createButton('Start Script', 'green', startScript);
const stopButton = createButton('Stop Script', 'red', stopScript);
const resultDiv = createResultDiv();
container.appendChild(startButton);
container.appendChild(stopButton);
container.appendChild(resultDiv);
document.body.appendChild(container);

function createButton(text, color, onClick) {
    const button = document.createElement('button');
    button.textContent = text;
    button.style.marginRight = '10px';
    button.style.background = color;
    button.style.color = 'white';
    button.style.border = `1px solid ${color}`;
    button.style.borderRadius = '5px';
    button.style.cursor = 'pointer';
    button.addEventListener('click', onClick);
    return button;
}

function createResultDiv() {
    const resultDiv = document.createElement("div");
    resultDiv.id = "result_div";
    resultDiv.textContent = `Success:0  Faild:0`;
    resultDiv.style.color = '#00cf00';
    resultDiv.style.fontSize = '20px';
    return resultDiv;
}

async function startScript() {
    if (!isScriptRunning) {
        isScriptRunning = true;
        console.log('Script started.');
        while (isScriptRunning) {
            await selectCityFromDropdownSlowly(CITY_DROPDOWN_ID);
        }
    } else {
        console.log('Script is already running.');
    }
}

function stopScript() {
    if (isScriptRunning) {
        isScriptRunning = false;
        console.log('Script stopped.');
    } else {
        console.log('Script is not running.');
    }
}

async function selectCityFromDropdownSlowly(selector) {
    if (typeof selector !== "string") {
        console.error("Invalid argument type. Please provide a string.");
        return;
    }

    const dropdown = document.querySelector(selector);
    if (dropdown) {
        for (const index in cityIndex) {
            if (!isScriptRunning) return;
            dropdown.selectedIndex = cityIndex[index];
            await _triggerEventChange(dropdown);
            await sleep(3000);
            await clickAvailableDate();
        }
    }
}

async function clickAvailableDate() {
    const datePicker = document.querySelector(DATE_PICKER_ID);
    if (datePicker.classList.contains("hasDatepicker")) {
        $(DATE_PICKER_ID).datepicker("show");
        await sleep(500);

        const monthDropdown = document.querySelector(MONTH_DROPDOWN_SELECTOR);

        if (monthDropdown) {
            for (let count = 1; count <= month_range; count++) {
                if (isScriptRunning) {
                    await sleep(50);
                    await _triggerEventChange(monthDropdown);
                    await sleep(500);
                    await clickAllButtons();
                    if (count < month_range) $(`a[data-handler="next"]`)[0].click();
                }
            }
        }
        $(DATE_PICKER_ID).datepicker("hide");
    }
}

async function clickAllButtons() {
    const greenDay = document.querySelector(".greenday");
    if (greenDay) {
        isScriptRunning = false;

        greenDay.click();

        try {
            await waitForElementToBeClickable(SUBMIT_BUTTON_ID, 7000);
            await new Promise((resolve) => setTimeout(resolve, 500));
            document.querySelector(SUBMIT_BUTTON_ID).click();
      
	    const radioButton = document.querySelector('.radio input[type="radio"], .radio-inline input[type="radio"], .checkbox input[type="checkbox"], .checkbox-inline input[type="checkbox"]');
            if (radioButton) {
                radioButton.click();
            }
	    const targetElement = document.querySelector('button, input[type="button"], input[type="reset"], input[type="submit"]');
if (targetElement) {
    targetElement.click();
} else {
    console.error('Element not found');
}
            document.getElementById("result_div").innerText = `Success:1  Faild:0`;
            document.getElementById("result_div").innerText = `Success:1  Faild:0`;
        } catch (error) {
            console.error("Error clicking button:", error.message);
            document.getElementById("result_div").innerText = `Success:0  Faild:1 Error: ${error.message}`;
        }
    }
}

async function sleep(s) {
    await new Promise((resolve) => setTimeout(resolve, s * slow)); // Wait for dates to show.
}

const _triggerEventChange = async (element) => {
    const changeEvent = new Event("change", { bubbles: true });
    element.dispatchEvent(changeEvent);
};

function waitForElementToBeClickable(elementSelector, timeout = 5000) {
    return new Promise((resolve, reject) => {
        const startTime = new Date().getTime();
        let intervalId;

        function checkElement() {
            const element = document.querySelector(elementSelector);

            if (element) {
                const rect = element.getBoundingClientRect();
                const isClickable = rect.width > 0 && rect.height > 0;
                const isDisplayed =
                    window.getComputedStyle(element).display !== "none";

                if (isClickable && isDisplayed) {
                    clearInterval(intervalId);
                    resolve(element);
                }
            }

            const currentTime = new Date().getTime();
            if (currentTime - startTime > timeout) {
                clearInterval(intervalId);
                reject(
                    new Error(
                        `Timeout waiting for element with selector: ${elementSelector}`
                    )
                );
            }
        }

        intervalId = setInterval(checkElement, 1500); // Check every 100 milliseconds
    });
}