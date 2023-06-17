'use strict';

import React from 'react';

import { Viro3DObject, ViroText, ViroSpotLight, ViroQuad, ViroNode } from '@viro-community/react-viro';

import { modeConstant } from '../ARCircuitScene';

import { ViroUtil, text_styles } from '../Util/ViroUtil'
import MathUtil from '../Util/MathUtil'

const text_style = text_styles.default;

export class LED extends React.Component
{
	constructor(props)
	{
		super(props);
		
		this.sendScene = props.sendScene;
		this.onDrag = this._drag.bind(this);
		this.onClick = this.onClick.bind(this);
		this.onConnected = this._connect.bind(this);
		this.onDisconnect = this._disconnect.bind(this);
		this.onExecute = this._execute.bind(this);
		this.onStop = this._stop.bind(this);

		this.makeToast = ViroUtil.makeToast.bind(this);
		
		this.state = {
			selected: false,
			chosen: false,
			bright: 0,

			running: false,
			connected: false,

			position: [0, -.5, -0.5]
		};

		this.cstate = {
			is_dragging: false,
			disconnect: undefined,
			port: null
		};
	}
	
    render()
    {
		const camera = this.props.getState().cameraTransform;
		let cameraAngle = MathUtil.vecCopy(camera.rotation);
		cameraAngle[1] = cameraAngle[2] = 0.0; // execept the y-z rotation (only receives x axis)

		const options = [
			{
				sphere_props: {
					materials: ["white_sphere"],
					position: [0, .15, 0],
					onClick: this._menu1.bind(this),
					animation: {
						name: "tapAnimation",
						run: this.state.chosen,
						onFinish: this._animend.bind(this)
					}
				},
				text_props: {
					text: this.state.connected ? "Disconnect" : "Connect",
					scale: [.25, .25, .25],
					position: [0, .25, 0],
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
		var imagePos = MathUtil.vecAdd([0, 0.025, 0], scaled);
		var textPos = MathUtil.vecAdd(imagePos, MathUtil.vecScale(camera.up, 0.05));
		
		let imageComp = null;
		let textComp = null;

		if (this.state.running)
		{
			var image = require('./icon/bright_yellow_transparent.png');
			imageComp = ViroUtil.buildImage(this.props.name, 'bright001', image, imagePos, cameraAngle, this.state.bright / 255.0);

			textComp = (
				<ViroText
					key={`${this.props.name}_text_temp001`}
					text={`${this.state.bright}`}
					scale={[.25, .25, .25]}
					position={textPos}
					rotation={cameraAngle}
					style={text_style} />
			);
		}
		else if (this.state.connected)
		{
			var image = require('./icon/connected_green_transparent.png');
			imageComp = ViroUtil.buildImage(this.props.name, 'connect001', image, imagePos, cameraAngle);

			textComp = (
				<ViroText
					key={`${this.props.name}_text_temp001`}
					text={`${this.cstate.port}`}
					scale={[.25, .25, .25]}
					position={textPos}
					rotation={cameraAngle}
					style={text_style} />
			);
		}
		else if (this.state.selected)
		{
			var image = require('./icon/checkred_transparent.png');
			imageComp = ViroUtil.buildImage(this.props.name, 'check001', image, imagePos, cameraAngle);
		}
		
        const source = require('./res/led_light.glb');

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
					color="#ffffff"
					castsShadow={true}
					influenceBitMask={2}
					shadowMapSize={2048}
					shadowNearZ={2}
					shadowFarZ={5}
					shadowOpacity={.7}
					/>
					
				<Viro3DObject
					position={[0, 0, 0]}
					rotation={[0, 0, 0]}
					scale={[.01, .01, .01]}
					source={source}
					type='GLB'
					lightReceivingBitMask={3}
					shadowCastingBitMask={2}
					/>
				
				{imageComp}
				{textComp}
					
				<ViroQuad
					rotation={[-90, 0, 0]}
					width={.5} height={.5}
					arShadowReceiver={true}
					lightReceivingBitMask={2}
					/>
					
			</ViroNode>
        );
    }
	
	_menu1()
	{
		this.setState({
			selected: true,
			chosen: true
		});

		if (this.state.running)
		{
			this.makeToast('error', 'Unable to make connection', 'This component is now running', 2000);
			return;
		}

		if (this.state.connected)
		{
			if (this.cstate.disconnect == undefined)
			{
				this.makeToast('error', 'Unable to disconnect', 'The disconnect function is undefined', 4000);
				return;
			}

			this.cstate.disconnect({
				name: this.props.name,
				onDisconnect: this.onDisconnect
			});
			return;
		}

		this.sendScene("editor", {
			name: this.props.name,
			type: "number",
			desc: "Enter Port",
			input: "",
			onFinish: (number) => {
				this.sendScene("selection", {
					name: this.props.name,
					callback: this._readPin.bind(this),
					port: parseInt(number),
					onConnect: this.onConnected,
					onDisconnect: this.onDisconnect,
					onExecute: this.onExecute,
					onStop: this.onStop,
				});
		}});
	}
	
	_animend()
	{
		this.setState({
			selected: false,
			chosen: false
		});
	}

	_connect(disconnect, port)
	{
		this.setState({connected: true});
		this.cstate.disconnect = disconnect;
		this.cstate.port = port;
	}

	_disconnect(caller, toast)
	{
		if (toast != undefined && toast == true)
			this.makeToast('success', 'Successfully disconnected', `Disconnected with ${caller}`, 4000);
		
		this.setState({connected: false});
		this.cstate.disconnect = undefined;
		this.cstate.port = null;
	}

	_execute()
	{
		this.setState({running: true});
	}

	_stop()
	{
		this.setState({running: false})
	}

    onClick(/*position, source*/)
    {
		if (this.cstate.is_dragging)
		{
			this.cstate.is_dragging = false;
			return;
		}
		
		let state = this.props.getState();

        switch (state.mode)
		{
			case modeConstant.IDLE:
			{
				if (this.onDrag == undefined)
				{
					this.onDrag = this._drag.bind(this);
					this.setState({
						selected: false,
						chosen: false
					});
				}
				else
				{
					this.onDrag = undefined;
					this.setState({
						selected: true,
						chosen: false
					});
				}
				break;
			}
			case modeConstant.SELECT:
			{
				if (this.state.connected)
				{
					this.makeToast('error', 'Unable to disconnect', `component ${this.props.name} is ready connected.`, 4000);
					this.sendScene("reset", null);
					return;
				}

				let caller = state.caller;

				let classid = ViroUtil.getInfo(caller.name)[0];
				let callback = caller.callback;

				// connected comp with uno
				if (classid == 0)
				{
					this.sendScene("editor", {
						name: this.props.name,
						type: "number",
						desc: "Enter Port",
						input: "",
						onFinish: (number) => {
							callback(0, {
								name: this.props.name,
								callback: this._readPin.bind(this),
								port: parseInt(number),
								onConnect: this.onConnected,
								onDisconnect: this.onDisconnect,
								onExecute: this.onExecute,
								onStop: this.onStop,
							});

							this.sendScene("reset", null);
					}});
				}
				break;
			}
			case modeConstant.REMOVE:
			{
				if (this.state.in_running)
				{
					this.makeToast('error', 'Unable to remove', 'This component is now running', 2000);
					return;
				}

				if (this.state.connected)
				{
					if (this.cstate.disconnect != undefined)
						this.cstate.disconnect({name: this.props.name});
				}
				this.sendScene("remove", {name: this.props.name});
				break;
			}
		}
    }
	
	_readPin(value)
	{
		console.log(`LED: ${value}`);
		value = Math.max(0, Math.min(value, 255));
		this.setState({bright: value});
	}

    _drag(dest, source)
    {
		this.setState({position: dest});
		this.cstate.is_dragging = true;
    }
}
