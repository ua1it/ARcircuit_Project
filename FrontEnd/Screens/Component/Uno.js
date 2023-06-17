'use strict';

import React from 'react';

import { StyleSheet } from 'react-native';

import { Viro3DObject, ViroSpotLight, ViroQuad, ViroNode } from '@viro-community/react-viro';

import { PinState } from 'avr8js';

import { buildHex } from './runner/compile';
import { CPUPerformance } from './runner/cpu-performance';
import { AVRRunner } from './runner/execute';
import { formatTime } from './runner/format-time';

import { modeConstant } from '../ARCircuitScene';

import { ViroUtil, text_styles } from '../Util/ViroUtil'
import MathUtil from '../Util/MathUtil';
const text_style = text_styles.default;

const default_code = `void setup() {
	pinMode(8, OUTPUT);
}

void loop() {
    delay(100);
    Serial.print("LED on\\n");
    digitalWrite(8, HIGH);

    delay(100);
    Serial.print("LED off\\n");
    digitalWrite(8, LOW);
}`;

export class ArduinoUno extends React.Component
{
	constructor(props)
	{
		super(props);
		
		this.sendScene = props.sendScene;
		
		this.onDrag = this._drag.bind(this);
		this.onClick = this._click.bind(this);
		this._compile = this._compile.bind(this);
		this._execute = this._execute.bind(this);
		this._stop = this._stop.bind(this);
		this._callback = this._callback.bind(this);
		this.onDisconnect = this._disconnect.bind(this);
		
		this.updatePortB = this._updatePortB.bind(this);
		this.updatePortD = this._updatePortD.bind(this);
		
		this._animend = this._animend.bind(this);

		this.makeToast = ViroUtil.makeToast.bind(this);
		
		// react
		this.state = {
			selected: false,
			chosen: false,

			in_compile: false,
			in_running: false,
			result: 0,
			
			position: [0, -.5, -.5]
		}
		
		// circuit data (external data that is not related with react)
		this.cstate = {
			connected: [],
			
			// drag
			is_dragging: false,
			
			// compile
			code: default_code,
			
			// runner
			hex: null,
			runner: null,
			runner_text: null,
			time: null,
			speed: null
		}
	}

    render()
    {
		const camera = this.props.getState().cameraTransform;
		let cameraAngle = MathUtil.vecCopy(camera.rotation);
		cameraAngle[1] = cameraAngle[2] = 0.0; // execept the y-z rotation (only receives x axis)

		const options = [
			// Menu1: Connect
			{
				sphere_props: {
					materials: ["white_sphere"],
					position: [-.225, .15, 0],
					onClick: this._menu1.bind(this),
					animation: {
						name: "tapAnimation",
						run: this.state.chosen,
						onFinish: this._animend
					}
				},
				text_props: {
					text: "Connect",
					scale: [.25, .25, .25],
					position: [-.225, .25, 0],
					rotation: cameraAngle,
					style: text_style
				}
			},

			// Menu2: Edit codes
			{
				sphere_props: {
					materials: ["blue_sphere"],
					position: [-.075, .15, 0],
					onClick: this._menu2.bind(this),
					animation: {
						name: "tapAnimation",
						run: this.state.chosen,
						onFinish: this._animend
					}
				},
				text_props: {
					text: "Edit",
					scale: [.25, .25, .25],
					position: [-.075, .25, 0],
					rotation: cameraAngle,
					style: text_style
				}
			},

			// Menu3: Run
			{
				sphere_props: {
					materials: ["yellow_sphere"],
					position: [.075, .15, 0],
					onClick: this._menu3.bind(this),
					animation: {
						name: "tapAnimation",
						run: this.state.chosen,
						onFinish: this._animend
					}
				},
				text_props: {
					text: !this.state.in_running ? "Run" : "Stop",
					scale: [.25, .25, .25],
					position: [.075, .25, 0],
					rotation: cameraAngle,
					style: text_style
				}
			},

			// Menu4: Show console
			{
				sphere_props: {
					materials: ["red_sphere"],
					position: [.225, .15, 0],
					onClick: this._menu4.bind(this),
					animation: {
						name: "tapAnimation",
						run: this.state.chosen,
						onFinish: this._animend
					}
				},
				text_props: {
					text: "Output",
					scale: [.25, .25, .25],
					position: [.225, .25, 0],
					rotation: cameraAngle,
					style: text_style
				}
			}
		];
		
		let optionComp = null;
		
		if (this.state.selected)
			optionComp = ViroUtil.buildOption(this.props.name, options);

		var direction = MathUtil.vecNormalize(MathUtil.vecSubtract(this.state.position, camera.position));
		let scaled = MathUtil.vecScale(direction, -0.1);
		var imagePos = MathUtil.vecAdd([0, 0.05, 0], scaled);

		let imageComp = null;
		if (this.state.selected)
		{
			var image = require('./icon/checkred_transparent.png');
			imageComp = ViroUtil.buildImage(this.props.name, 'check001', image, imagePos, cameraAngle);
		}
		else if (this.state.in_compile)
		{
			var image = require('./icon/compile_orange_transparent.png');
			imageComp = ViroUtil.buildImage(this.props.name, 'progress001', image, imagePos, cameraAngle);
		}
		else if (this.state.in_running)
		{
			var image = require('./icon/executing_red_transparent.png');
			imageComp = ViroUtil.buildImage(this.props.name, 'progress001', image, imagePos, cameraAngle);
		}
		else if (this.state.result != 0)
		{
			var image = [
				undefined,
				require('./icon/success_green_transparent.png'),
				require('./icon/failure_red_transparent.png')
			]

			imageComp = ViroUtil.buildImage(this.props.name, 'result001', image[this.state.result], imagePos, cameraAngle);
		}
		
        const source = require('./res/arduino_uno.glb');
        const resources = [require('./res/1775.png'),
            require('./res/1785.png'),
            require('./res/1795.png'),
            require('./res/1805.png'),
            require('./res/1815.png'),
            require('./res/1825.png'),
            require('./res/1835.png'),
            require('./res/1844.png'),
            require('./res/1854.png'),
            require('./res/1919.png'),
            require('./res/1929.png')];
		
        return (
			<ViroNode
				position={this.state.position}
				dragType="FixedToWorld"
				transformBehaviors="billboardY"
				onDrag={this.onDrag}
				onClick={this.onClick}>
				
				{optionComp}
				
				<ViroSpotLight
					innerAngle={5}
					outerAngle={45}
					direction={[0, -1, -.2]}
					position={[0, 7, 0]}
					color={"#ffffff"}
					castsShadow={true}
					influenceBitMask={2}
					shadowMapSize={2048}
					shadowNearZ={2}
					shadowFarZ={5}
					shadowOpacity={.7}
					/>
					
				<Viro3DObject
					position={[0, 0, 0]}
					rotation={[-90, 0, 0]}
					scale={[.2, .2, .2]}
					source={source}
					resources={resources}
					type='GLB'
					lightReceivingBitMask={3}
					shadowCastingBitMask={2}
					/>
				
				{imageComp}
					
				<ViroQuad
					rotation={[-90, 0, 0]}
					width={.5} height={.5}
					arShadowReceiver={true}
					lightReceivingBitMask={2}
					/>
					
			</ViroNode>
        );
    }
	
	_drag(dragToPos, source)
	{
		this.setState({
			position: dragToPos
		})
		this.cstate.is_dragging = true;
	}
	
	_click(/*position, source*/)
	{
		// Note: smooth the drag movement
		// The drag movement always trigger onClick event at the end.
		// Below code updates the component's position with the dragged point.
		if (this.cstate.is_dragging)
		{
			this.cstate.is_dragging = false;
			return;
		}

		let state = this.props.getState();
		
		switch (state.mode)
		{
			case modeConstant.IDLE:
				// Deactivate
				if (this.onDrag === undefined)
					this._animend();
				else // Activate menu
				{
					this.onDrag = undefined;
					this.setState({
						selected: true,
						chosen: false
					});
				}
				break;
			case modeConstant.SELECT:
				var caller = state.caller;

				this._callback(0, caller);
				this.sendScene("reset", null);
				break;
			case modeConstant.REMOVE:
			{
				if (this.state.in_running)
				{
					this.makeToast('error', 'Unable to remove', 'This component is now running', 2000);
					return;
				}

				for (var comp of this.cstate.connected)
				{
					if (comp.onDisconnect != undefined)
						comp.onDisconnect(this.props.name);
				}
				this.sendScene("remove", {name: this.props.name});
				break;
			}
		}
	}
	
	_animend()
	{
		this.setState({
			selected: false,
			chosen: false
		});
		
		this.onDrag = this._drag.bind(this);
	}
	
	_menu1(/*position, source*/)
	{
		this.setState({
			selected: true,
			chosen: true
		});

		if (this.state.in_running)
		{
			this.makeToast('error', 'Unable to make connection', 'This component is now running', 2000);
			return;
		}

		this.sendScene("selection", {
			name: this.props.name,
			callback: this._callback
		});
	}
	
	_callback(result, dest)
	{
		if (result)
		{
			this.makeToast('error', 'Connection Failed', `error code: ${result}`, 4000);
			return;
		}

		if (dest == null || dest == undefined) // ???
		{
			this.makeToast('error', 'Connection Failed', 'Unknown component is selected', 4000);
			return;
		}

		let name = dest.name;
		let classid = ViroUtil.getInfo(name)[0];

 		// connect to self or connect to uno ==> cancel connection
		if (name === this.props.name || classid == 0) {
			this.makeToast('error', 'Connection Failed', 'Uno cannot be connected with uno', 4000);
			return;
		}

		for (var comp of this.cstate.connected)
		{
			if (name == comp.name)
			{
				this.makeToast('error', 'Connection Failed', `Already connected with: ${name}, port: ${comp.port}`, 4000);
				return;
			}

			if (dest.port == comp.port)
			{
				this.makeToast('error', 'Connection Failed', `The port: ${comp.port} is already using`, 4000);
				return;
			}
		}
		
		this.makeToast('success', 'Connection Successful', `${this.props.name} connected with: ${name}, port: ${dest.port}`, 4000);
		if (dest.onConnect != undefined)
			dest.onConnect(this.onDisconnect, dest.port);

		this.cstate.connected = this.cstate.connected.concat([dest])
	}

	_disconnect(info)
	{
		for (var comp of this.cstate.connected)
		{
			if (info.name == comp.name)
			{
				var idx = this.cstate.connected.indexOf(comp);
				this.cstate.connected.splice(idx, 1);

				info.onDisconnect(this.props.name, true);
				return;
			}
		}
	}
	
	_menu2(/*position, source*/)
	{
		this.sendScene("editor", {
			name: this.props.name,
			type: "code",
			desc: "Code Editor",
			input: this.cstate.code,
			onFinish: (context) => {
				this.cstate.code = context;
				this._compile();
			}
		});
		this.setState({
			selected: true,
			chosen: true
		});
	}
	
	_menu3(/*position, source*/)
	{
		if (!this.state.in_running)
			this._execute();
		else
			this._stop();
		
		this.setState({
			selected: true,
			chosen: true
		});
	}
	
	_menu4(/*position, source*/)
	{
		this.sendScene("editor", {
			name: this.props.name,
			type: "readonly",
			desc: `Console [runtime ${this.cstate.time}], [speed ${this.cstate.speed}%]`,
			input: this.cstate.runner_text,
			updateValue: () => { return [
				`Console [runtime ${this.cstate.time}], [speed ${this.cstate.speed}%]`,
				this.cstate.runner_text
			] }
		});
		this.setState({
			selected: true,
			chosen: true
		});
	}
	
	async _compile()
	{
		if (this.state.in_compile)
			return;
		
		this._stop();

		this.setState({in_compile: true});
		this.cstate.runner_text = null;

		this.makeToast('info', 'Uno is now compiling...', `id: ${this.props.name}`, 2000);
		
        try {
			const result = await buildHex(this.cstate.code);

			if (result.hex)
			{
				this.cstate.hex = result.hex;
				this.makeToast('success', 'Compile succeed', result.stderr || result.stdout, 4000);
			
				this.setState({
					result: 1,
					in_compile: false
				});
			}
			else
				throw(result.stderr || result.stdout);
		} catch (err) {
			this.makeToast('error', 'Compile failed', err, 4000);
			this.cstate.hex = null;

			this.setState({
				result: 2,
				in_compile: false
			});
		} finally {
			setTimeout(() => this.setState({result: 0}), 4000);
		}
	}
	
	_execute()
	{
		this._stop();

		if (this.cstate.hex == null)
		{
			this.makeToast('error', 'Hex is empty', 'Please compile the code first.', 4000);
			return;
		}
		
		let runner = new AVRRunner(this.cstate.hex);
		const MHZ = 16e6;
		
		// Hook to PORTB register
		runner.portB.addListener((value) => {
			this.updatePortB(value);
		});

		runner.usart.onByteTransmit = (value) => {
            this.cstate.runner_text = this.cstate.runner_text + String.fromCharCode(value);
        };
		
		const cpuPerf = new CPUPerformance(runner.cpu, MHZ);
		runner.execute((cpu) => {
			this.cstate.time = formatTime(cpu.cycles / MHZ);
			this.cstate.speed = (cpuPerf.update() * 100).toFixed(0);
		});
		
		this.cstate.runner = runner;
		this.cstate.runner_text = "";

		this.setState({in_running: true})
		
		for (var comp of this.cstate.connected)
		{
			console.log(`test: ${Object.keys(comp)}`);
			var callback = comp.onExecute;
			if (callback != undefined)
				callback();
		}

		this.makeToast('info', 'Uno is now running', `id: ${this.props.name}`, 2000);
	}

	_stop()
	{
		let runner = this.cstate.runner;
		
		if (runner != null)
		{
			runner.stop();
			this.cstate.runner = null;

			this.makeToast('info', 'Uno is now stopped', `id: ${this.props.name}`, 2000);
		}
		
		for (var comp of this.cstate.connected)
		{
			var callback = comp.onStop;
			if (callback != undefined)
				callback();
		}
		
		this.setState({in_running: false})
	}

	// Handle PortB register updates
	// the output of value is related with the signal of port 13 ~ 8.
	// ex) value = 1 ==> (1 << 0) ==> Port 8 is activated
	// 
	// Maximum value: 63 (all activation of port 13~8)
	// Minumum value: 0 (all deactivation of port 13~8)
	//
	// Note: this architecture cannot handle analog signal. only digital one can be proceed (0 or 255)
	_updatePortB(value)
	{
		this.cstate.connected.map((dest) => {
			if (dest.port < 8 || dest.port > 13)
				return;
			
			let event_handler = dest.callback;
			if (event_handler === undefined)
				return;
			
			let out_value = (value & (1 << (dest.port - 8))) * 255;
			event_handler(out_value);
		});
	}

	_updatePortD(value)
	{

	}
}
