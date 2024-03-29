import "./joypad.min.js";
import "./nipplejs.min.js";
import "./socket.io.min.js";
const gamepadControls = {};
const nippleControls = {};
const controlLastStates = {};
const socket = io();


function initializeSocketIO() {
    socket.on("connect", () => {
        let heading = document.getElementById('heading_socket');
        const message = "WebSocket is connected";
        heading.innerText = ''; //message;
        console.log(message);
    });
    
    socket.on("disconnect", () => {
        let heading = document.getElementById('heading_socket');
        const message = "WebSocket is disconnected";
        heading.innerText = message;
        console.log(message);
    });
}

function initializeGamepadControls() {
    let controlType = '';

    controlType = 'stick';
    for (let element of document.querySelectorAll(`[data-control-type="${controlType}"]`)) {
        let id = element.getAttribute('data-control-id');
        if (id === null) continue;

        // Create control body
        let _ = 'stroke="hsla(200,90%,20%,0.2)" stroke-width="1"';
        let __ = 'stroke="hsl(200,90%,20%)"';
        element.innerHTML = `
            <svg viewBox="0 0 150 150">
                <g transform="translate(75 75) scale(0.95, 0.95)">
                    <circle cx="0" cy="0" r="75" fill="none" ${_} />
                    <line x1="0" y1="-75" x2="0" y2="75" ${_} />
                    <line x1="-75" y1="0" x2="75" y2="0" ${_} />
                    <line id="arrow" x1="0" y1="0" ${__} />
                    <circle id="tip" cx="0" cy="0" r="3" fill="hsl(200,90%,20%)" />
                </g>
            </svg>
        `;

        // Save control to dict of controls
        let id_x = (id === 'left') ? '0' : '2';
        let id_y = (id === 'left') ? '1' : '3';
        gamepadControls[`axis-${id_x}-stick`] = element;
        gamepadControls[`axis-${id_y}-stick`] = element;
    }

    controlType = 'axis';
    for (let element of document.querySelectorAll(`[data-control-type="${controlType}"]`)) {
        let id = element.getAttribute('data-control-id');
        if (id === null) continue;

        // Set default class for control
        let _ = 'gamepad-control';
        if (!element.classList.contains(_)) element.classList.add(_);

        // Create control body
        _ = 'stroke="hsla(200,90%,20%,0.5)" stroke-width="100%"';
        element.innerHTML = `
            <svg>
                <line x1="2.5" y1="17.5" x2="2.5" y2="17.5" ${_}" />
            </svg>
            <div>
                <div class="label">AXIS ${id}</div>
                <div class="value"></div>
            </div>
        `;

        // Save control to dict of controls
        gamepadControls[`${controlType}-${id}`] = element;

        // Set control value
        setGamepadControlValue(`${controlType}-${id}`, 0.0);
    }

    controlType = 'button';
    for (let element of document.querySelectorAll(`[data-control-type="${controlType}"]`)) {
        let id = element.getAttribute('data-control-id');
        if (id === null) continue;

        // Set default class for control
        let _ = 'gamepad-control';
        if (!element.classList.contains(_)) element.classList.add(_);

        // Create control body
        _ = 'stroke="hsla(200,90%,20%,0.5)" stroke-width="5"';
        element.innerHTML = `
            <svg>
                <line x1="2.5" y1="17.5" x2="2.5" y2="17.5" ${_} />
            </svg>
            <div>
                <div class="label">B ${id < 10 ? '0' : ''}${id}</div>
            </div>
        `;

        // Save control to dict of controls
        gamepadControls[`${controlType}-${id}`] = element;

        // Set control value
        setGamepadControlValue(`${controlType}-${id}`, 0.0);
    }
}

function initializeJoyPadModule() {
    let heading = document.getElementById('heading_gamepad');
    let message = document.getElementById('message_gamepad');

    function resetInfo(e) {
        heading.innerText = 'No gamepad connected!';
        message.innerText = 'Please connect a gamepad and press any key to start.';
    };

    function updateInfo(e) {
        const { gamepad } = e;
        heading.innerText = ''; //'Gamepad connected!';
        message.innerText = gamepad.id;
    };

    resetInfo();
    joypad.set({
        axisMovementThreshold: 0.0,
    });
    joypad.on('connect', e => {
        console.log(e);
        return updateInfo(e)
    });
    joypad.on('disconnect', e => {
        console.log(e);
        return resetInfo(e);
    });
    joypad.on('axis_move', e => {
        const { axis, axisMovementValue } = e.detail;
        const axis_minimal_value = 0.00005;
        let value = Math.round(axisMovementValue * 100000) / 100000;
        if (Math.abs(value) < axis_minimal_value) value = 0;
        setGamepadControlValue(`axis-${axis}`, value);
    });
    joypad.on('button_press', (e) => {
        const { index } = e.detail;
        setGamepadControlValue(`button-${index}`, 1);
    });
    joypad.on('button_release', (e) => {
        const { index } = e.detail;
        setGamepadControlValue(`button-${index}`, 0);
    });
}

function initializeNippleJSControls() {
    let options = {
        color: 'none',
        mode: 'static',
        position: { left: '50%', top: '48.5%' },
        shape: 'square',
    };

    for (const id of ['left', 'right']) {
        let element = document.querySelector(
            `[data-control-type="stick"][data-control-id="${id}"]`
        )
        if (!element) continue;

        nippleControls[id] = nipplejs.create(Object.assign({}, options, { zone: element }));
        nippleControls[id].on("move end", (evt, data) => {
            let id = evt.target.options.zone.getAttribute('data-control-id');
            let id_x = (id === 'left') ? '0' : '2';
            let id_y = (id === 'left') ? '1' : '3';
            let x = 0, y = 0;
            if (evt.type == 'move') {
                x = Math.round(data.vector.x * 100000) / 100000;
                y = -Math.round(data.vector.y * 100000) / 100000;
            }

            setGamepadControlValue(`axis-${id_x}`, x);
            setGamepadControlValue(`axis-${id_y}`, y);
        });
    }

    function resizeNippleJSControls() {
        if (!window.nipplejs) return;
        for (const id of window.nipplejs.factory) {
            id[0].options.size = id[0].ui.back.clientWidth;
        }
    }
    // Resize sizes of all NippleJS after initialization
    resizeNippleJSControls();
    // Automatically change the sizes of all NippleJS after changing the size of the browser
    window.addEventListener('resize', resizeNippleJSControls);
}

function initializeTesting() {
    //return;
    // Set random values for axis and button controls
    function randomIntFromInterval(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min)
    }
    for (let i = 0; i < 4; i++) {
        let value = randomIntFromInterval(-100000, 100000) / 100000.0;
        setGamepadControlValue(`axis-${i}`, value);
    }
    for (let i = 0; i < 16; i++) {
        let value = randomIntFromInterval(0, 1);
        setGamepadControlValue(`button-${i}`, value);
    }
}

function getGamepadControlFloatValue(control_id) {
    if (!control_id || !gamepadControls[control_id]) return 0.0;
    let control = gamepadControls[control_id];
    let value = parseFloat(control.getAttribute('data-control-value'));
    if (value === null || isNaN(value)) value = 0.0;
    return value;
}

function setGamepadControlValue(control_id, value_) {
    if (!control_id || !gamepadControls[control_id]) return;
    let control = gamepadControls[control_id];
    let value_new = parseFloat(value_);
    if (value_new === null || isNaN(value_new)) value_new = 0.0;
    let value = parseFloat(control.getAttribute('data-control-value'));
    if (value === value_new) return;
    value = value_new;

    // Set data control value attribute
    control.setAttribute('data-control-value', value);

    if (String(control_id).startsWith('axis')) {
        // Set visible text value
        let value_text = (Math.round(value * 100000) / 100000).toFixed(5);
        let element = control.getElementsByClassName('value')[0];
        if (element) element.innerHTML = value_text;

        // Set visible svg line
        control.getElementsByTagName('svg')[0]
            ?.getElementsByTagName('line')[0]
            ?.setAttribute('y2', 17.5 * (value + 1));

        // Update stick value
        updateGamepadStickValue(`${control_id}-stick`);
    } else if (String(control_id).startsWith('button')) {
        // Set visible svg line
        control.getElementsByTagName('svg')[0]
            ?.getElementsByTagName('line')[0]
            ?.setAttribute('y2', 17.5 * (1 - value));
    }

    sendSocketControlMessage(control_id, value);
}

function sendSocketControlMessage(control_name, value) {
    const axis_significant_decimals = 3;
    let message = {}
    message[control_name] = value;
    if (String(control_name).startsWith('axis')) {
        message[control_name] = (
            Math.round(value * Math.pow(10, axis_significant_decimals)) /
            Math.pow(10, axis_significant_decimals)
        );
    }
    if (controlLastStates[control_name] === message[control_name]) return;
    controlLastStates[control_name] = message[control_name];
    socket.send(message);
}

function updateGamepadStickValue(control_id) {
    if (!control_id || !gamepadControls[control_id]) return;
    let control = gamepadControls[control_id];

    let id = control.getAttribute('data-control-id');
    let id_x = (id === 'left') ? '0' : '2';
    let id_y = (id === 'left') ? '1' : '3';
    let value_x = getGamepadControlFloatValue(`axis-${id_x}`) * 75;
    let value_y = getGamepadControlFloatValue(`axis-${id_y}`) * 75;

    // Set visible svg arrow and tip
    control.getElementsByTagName('svg')[0]
        ?.getElementById('arrow')?.setAttribute('x2', value_x);
    control.getElementsByTagName('svg')[0]
        ?.getElementById('arrow')?.setAttribute('y2', value_y);
    control.getElementsByTagName('svg')[0]
        ?.getElementById('tip')?.setAttribute('cx', value_x);
    control.getElementsByTagName('svg')[0]
        ?.getElementById('tip')?.setAttribute('cy', value_y);
}

document.addEventListener("DOMContentLoaded", function(event) {
    initializeSocketIO();
    initializeGamepadControls();
    initializeJoyPadModule();
    initializeNippleJSControls();
    //initializeTesting();
});
