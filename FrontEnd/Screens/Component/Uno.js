'use strict';

import React from 'react';

import { Viro3DObject, ViroSpotLight, ViroQuad, ViroNode } from '@viro-community/react-viro';

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

export const callbackType = {
	INPUT: 0,
	OUTPUT: 1
};

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
			title: null,
			runner_text: null,
			uptime: 0
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
					materials: ['white_sphere'],
					position: [-.225, .15, 0],
					onClick: this._menu1.bind(this),
					animation: {
						name: 'tapAnimation',
						run: this.state.chosen,
						onFinish: this._animend
					}
				},
				text_props: {
					text: 'Connect',
					scale: [.25, .25, .25],
					position: [-.225, .25, 0],
					rotation: cameraAngle,
					style: text_style
				}
			},

			// Menu2: Edit codes
			{
				sphere_props: {
					materials: ['blue_sphere'],
					position: [-.075, .15, 0],
					onClick: this._menu2.bind(this),
					animation: {
						name: 'tapAnimation',
						run: this.state.chosen,
						onFinish: this._animend
					}
				},
				text_props: {
					text: 'Edit',
					scale: [.25, .25, .25],
					position: [-.075, .25, 0],
					rotation: cameraAngle,
					style: text_style
				}
			},

			// Menu3: Run
			{
				sphere_props: {
					materials: ['yellow_sphere'],
					position: [.075, .15, 0],
					onClick: this._menu3.bind(this),
					animation: {
						name: 'tapAnimation',
						run: this.state.chosen,
						onFinish: this._animend
					}
				},
				text_props: {
					text: !this.state.in_running ? 'Run' : 'Stop',
					scale: [.25, .25, .25],
					position: [.075, .25, 0],
					rotation: cameraAngle,
					style: text_style
				}
			},

			// Menu4: Show console
			{
				sphere_props: {
					materials: ['red_sphere'],
					position: [.225, .15, 0],
					onClick: this._menu4.bind(this),
					animation: {
						name: 'tapAnimation',
						run: this.state.chosen,
						onFinish: this._animend
					}
				},
				text_props: {
					text: 'Output',
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
			var image = require('./icon/menu_yellow_transparent.png');
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
		
        return (
			<ViroNode
				visible={this.props.visible}
				position={this.state.position}
				dragType="FixedToWorld"
				transformBehaviors={["billboardY"]}
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
					source={require('./res/arduino_uno.glb')}
					resources={[]}
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
		this.setState({position: dragToPos});
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
				this.sendScene('reset');
				break;
			case modeConstant.REMOVE:
			{
				if (this.state.in_running)
				{
					this.makeToast('error', 'Unable to remove', 'This component is now running', 2000);
					this.sendScene('reset');
					return;
				}

				for (var comp of this.cstate.connected)
				{
					if (comp.onDisconnect != undefined)
						comp.onDisconnect(this.props.name);
				}
				this.sendScene('remove', {name: this.props.name});
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

		this.sendScene('selection', {
			name: this.props.name,
			callback: this._callback
		});
		this.makeToast('info', 'Add connection', 'Touch a component for connecting. Touch component again to cancel.', 2000);
	}
	
	_callback(result, dest)
	{
		if (result)
		{
			this.makeToast('error', 'Connection Failed', `error code: ${result}`);
			return;
		}

		if (dest == null || dest == undefined) // ???
		{
			this.makeToast('error', 'Connection Failed', 'Unknown component is selected');
			return;
		}

		let name = dest.name;
		let classid = ViroUtil.getInfo(name)[0];

		if (name === this.props.name)
		{
			this.makeToast('info', 'Adding connection is canceled', '', 2000);
			return;
		}

 		// connect to self or connect to uno ==> cancel connection
		if (classid == 0)
		{
			this.makeToast('error', 'Connection Failed', 'Uno cannot be connected with uno');
			return;
		}

		for (var comp of this.cstate.connected)
		{
			if (name == comp.name)
			{
				this.makeToast('error', 'Connection Failed', `Already connected with: ${name}`);
				return;
			}

			if (dest.port == comp.port)
			{
				this.makeToast('error', 'Connection Failed', `Port: ${comp.port} is already in use`);
				return;
			}
		}
		
		this.makeToast('success', 'Connection Successful', `${this.props.name} connected with: ${name}, port: ${dest.port}`);
		if (dest.onConnect != undefined)
			dest.onConnect(this.onDisconnect, dest.port);

		this.cstate.connected = this.cstate.connected.concat([dest]);
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
		this.sendScene('editor', {
			name: this.props.name,
			type: 'code',
			desc: 'Code Editor',
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
		this.sendScene('editor', {
			name: this.props.name,
			type: 'readonly',
			desc: this.cstate.title,
			input: this.cstate.runner_text
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

		this.cstate = {
			...this.cstate,
			title: 'Console [Stopped]',
			runner_text: null
		}

		this.makeToast('info', 'Uno is now compiling...', `id: ${this.props.name}`, 2000);
		
        try {
			const result = await buildHex(this.cstate.code);

			if (!result.hex)
				throw(result.stderr || result.stdout);
			
			this.cstate.hex = result.hex;
			this.makeToast('success', 'Compile success', result.stderr || result.stdout);
		
			this.setState({
				result: 1,
				in_compile: false
			});
		} catch (err) {
			this.makeToast('error', 'Compile failure', err, 4000);
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
			this.makeToast('error', 'Hex is empty', 'Please compile the code first.');
			return;
		}
		
		let runner = new AVRRunner(this.cstate.hex);
		const MHZ = 16e6;
		
		// Hook to PORTB register (Digital 8 ~ 13)
		runner.portB.addListener(this.updatePortB);
		
		// Hook to PORTD register (Digital 0 ~ 7)
		runner.portD.addListener(this.updatePortD);

		runner.usart.onByteTransmit = (value) => {
            this.cstate.runner_text = this.cstate.runner_text + String.fromCharCode(value);
			this.sendScene('update_editor', {
				editor_type: 'readonly',
				editor_input: this.cstate.runner_text
			});
        };
		
		const cpuPerf = new CPUPerformance(runner.cpu, MHZ);
		runner.execute((cpu) => {
			const runtime = formatTime(cpu.cycles / MHZ);
			const speed = (cpuPerf.update() * 100).toFixed(0);

			this.cstate.title = `Console [runtime ${runtime}], [speed ${speed}%]`;

			const time = performance.now();
			if (this.cstate.uptime <= time)
			{
				this.sendScene('update_editor', {
					editor_type: 'readonly',
					editor_desc: this.cstate.title
				});
				this.cstate.uptime = time + 50;
			}
		});
		
		this.cstate = {
			...this.cstate,
			runner: runner,
			title: 'Console [runtime 0] [speed 0%]',
			runner_text: '',
			uptime: 0
		}

		this.setState({in_running: true})
		
		for (var comp of this.cstate.connected)
		{
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
			if (dest.type != callbackType.OUTPUT)
				return;
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
		this.makeToast('info', 'PortD', `${value}`, 2000);
		this.cstate.connected.map((dest) => {
			if (dest.type != callbackType.OUTPUT)
				return;
			if (dest.port < 0 || dest.port > 7)
				return;
			
			let event_handler = dest.callback;
			if (event_handler === undefined)
				return;
			
			let out_value = (value & (1 << dest.port)) * 255;
			event_handler(out_value);
		});
	}
}
