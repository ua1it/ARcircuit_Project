'use strict';

import React from 'react';

import { ViroLightingEnvironment, ViroAmbientLight, ViroARScene, ViroTrackingStateConstants } from '@viro-community/react-viro';

import { ArduinoUno } from './Component/Uno';
import { Breadboard } from './Component/Breadboard';
import { LED } from './Component/LED';
import { Button } from './Component/Button';
import { Resistor } from './Component/Resistor';
import { Buzzer } from './Component/Buzzer';
import { Potentiometer } from './Component/Potentiometer';
import { Ultrasonic } from './Component/ultrasonic';
// import { Cable } from './Component/cable';
import MathUtil from './Util/MathUtil';
import { ViroUtil } from './Util/ViroUtil';


const opCode =
{
    IDLE: -1,
    CREATE: 0,
    REMOVE: 1
};

const BasicCircuit =
[
    'Uno',
    'Breadboard',
    'LED',
    'Button',
    'Resistor',
    'Buzzer',
    'Potentiometer',
    'Photoresistor',
    'UltraSonic Sensor',
    'Electric Wire'
];

const AdvancedCircuit =
[
    'HDX-2801',
    '7 Segment LED',
    'Dot Matrix Display',
    '74HC595',
    //'Flame Sensor',
    'HC-SR505',
    'RGB LED Module',
    'Voice Sensor',
    'SG-90 Servo',
    '16x2 LCD',
    'KY-0009 SMD RGB LED'
];

const DataProperty =
{
    index: -1,
	classid: -1,
    props: null,
	getState: null,
    extra: null,
};

const modeConstant = {
	IDLE: 0,
    ADD: 1,
    REMOVE: 2,
	SELECT: 3
};

class ARCircuitScene extends React.Component
{
    constructor(props)
    {
        super(props);
		
		this.state = {
			mode: modeConstant.IDLE,
			caller: null,
            tracking: ViroTrackingStateConstants.TRACKING_UNAVAILABLE,

            component: [],
            
            cameraTransform: {}
		};

        this.component = [];

        this.total_idx = 0;

        this.createComp = this._createComp.bind(this);
        this.removeComp = this._removeComp.bind(this);
        this.renderComp = this._getComp.bind(this);

        this.makeToast = this._toast.bind(this);

        this.onCommand = this._onCommand.bind(this);

        this.callParent = this.props.callback;
    }

    _createComp(position, classname)
    {
        var index = BasicCircuit.indexOf(classname);
        if (index == -1)
            return -1;
		
        var data = {};
        Object.assign(data, DataProperty);
		
		data.index = this.total_idx;
        data.classid = index;
		data.props = {
			name: `Circuit_${data.classid}_${data.index}`,
            initialPos: position,
			sendScene: this.onCommand,
			getState: () => { return this.state; }
		};
		Object.freeze(data.props);

        this.component.push(data);
        this.total_idx += 1;

        this.makeToast('success', 'Added component', `Successfully added ${classname}, id: ${data.props.name}`, 2000);
        return data.index;
    }

    _removeComp(name)
    {
        var idx = ViroUtil.getInfo(name)[1];
        for (var i = 0; i < this.component.length; i++)
        {
            if (this.component[i].index == idx)
            {
                this.component.splice(i, 1);
                this.makeToast('success', 'Removed component', `Successfully removed ${name}`, 2000);
                break;
            }
        }
    }

    _getComp(data)
    {
        const visible = this.state.tracking == ViroTrackingStateConstants.TRACKING_UNAVAILABLE ? false : true;

		switch (data.classid)
		{
            case 0: return (<ArduinoUno key={data.index} {...data.props} visible={visible} />);
			case 1: return (<Breadboard key={data.index} {...data.props} visible={visible} />);
            case 2: return (<LED key={data.index} {...data.props} visible={visible} />);
            case 3: return (<Button key={data.index} {...data.props} visible={visible} />);
			case 4: return (<Resistor key={data.index} {...data.props} visible={visible} />);
            case 5: return (<Buzzer key={data.index} {...data.props} visible={visible} />);
            case 6: return (<Potentiometer key={data.index} {...data.props} visible={visible} />);
			// case 7: return (<Photoresistor key={data.index} {...data.props} visible={visible} />);
            case 8: return (<Ultrasonic key={data.index} {...data.props} visible={visible} />);
            // case 9: return (<Cabel key={data.index} {...data.props} visible={visible} />);
		}
		
		return (null);
    }

    _toast(type, text1, text2, time)
    {
        if (time == null)
            time = 4000;
        
        this.callParent("toast", {
            type: type,
            text1: text1,
            text2: text2,
            position: 'bottom',
            visibilityTime: time
        });
    };
	
	_onCommand(command, data)
	{
        if (this.state.tracking == ViroTrackingStateConstants.TRACKING_UNAVAILABLE)
        {
            this.makeToast('error', 'Unable to handle events', 'IEEC is disabled now. Enable the AR features first!');
            return;
        }

		switch (command)
		{
            // Reset
            case "reset":
                this.setState({
                    mode: modeConstant.IDLE,
                    caller: null
                })
                break;

            // Request selection
            case "selection":
                this.setState({
                    mode: modeConstant.SELECT,
                    caller: data
                })
                break;
            
            case "remove":
                this.removeComp(data.name);
                this.setState({
                    mode: modeConstant.IDLE,
                    caller: null
                });
                break;
            
            // Global request (send to ARMain)
            case "editor":
            case "update_editor":
            case "toast":
                this.callParent(command, data);
                break;
		}
	}

    render()
    {
		let viroAppProps = this.props.arSceneNavigator.viroAppProps;
		
        if (viroAppProps != undefined)
        {
            let operation = viroAppProps.opcode;
            let source = viroAppProps.source;

            switch (operation)
            {
                case opCode.CREATE:
                    setTimeout(() => {
                        this.makeToast('info', 'Add new component', `Touch target point to create component ${source}`, 2000);
                        this.setState({
                            mode: modeConstant.ADD,
                            caller: source
                        })
                    }, 10);
                    break;
                case opCode.REMOVE:
                    setTimeout(() => {
                        this.makeToast('info', 'Remove component', 'Touch target component to remove. Touch blank to cancel.', 2000);
                        this.setState({
                            mode: modeConstant.REMOVE,
                            caller: null
                        })
                    }, 10);
                    break;
                case opCode.REMOVE_CANCEL:
                    setTimeout(() => {
                        this.makeToast('info', 'Remove canceled', '', 2000);
                        this.setState({
                            mode: modeConstant.IDLE,
                            caller: null
                        })
                    }, 10);
                    break;
            }
        }

        const camera_handler = (newCameraTransform) => {
            let update = false;
            let oldCamera = this.state.cameraTransform;
            let newCamera = newCameraTransform.cameraTransform;

            for (var key of Object.keys(newCamera))
            {
                if (!(key in oldCamera)) // initialize
                {
                    update = true;
                    break;
                }

                var dist = MathUtil.vecLength(
                    MathUtil.vecSubtract(oldCamera[key], newCamera[key]));

                if (dist >= 0.1)
                {
                    update = true;
                    break;
                }
            }

            if (update)
                this.setState({cameraTransform: newCamera});
        };

        const click_handler = (position, src) => {
            this.makeToast('info', 'Debug', `ttt: [${position}], [${typeof(position)}], [${src}], [${typeof(src)}]`, 1000);
            switch (this.state.mode)
            {
                case modeConstant.ADD:
                    this.createComp(position, this.state.caller);
                    this.setState({
                        mode: modeConstant.IDLE,
                        caller: null
                    });
                    break;
                case modeConstant.REMOVE:
                    this.makeToast('info', 'Remove canceled', '', 2000);
                    this.setState({
                        mode: modeConstant.IDLE,
                        caller: null
                    });
                    break;
            }
        }

        const tracking_handler = (state, reason) => {
            let type = '';
            let title = '';
            let message = '';
            switch (state)
            {
                case ViroTrackingStateConstants.TRACKING_UNAVAILABLE:
                    type = 'error';
                    title = 'IEEC is disabled';
                    message = 'The tracking status is unavailable. Please replace your camera.';
                    break;
                case ViroTrackingStateConstants.TRACKING_LIMITED:
                    type = 'info';
                    title = 'Tracking status is updated';
                    message = 'Status: Limited, Replace your camera for better UX.';
                    break;
                case ViroTrackingStateConstants.TRACKING_NORMAL:
                    type = 'success';
                    title = 'Tracking status is updated';
                    message = 'Status: Normal, Optimal AR feature will be served.';
                    break;
            }

            this.makeToast(type, title, message);
            this.setState({tracking: state});
        }

        let compList = this.component.map(this.renderComp);

        return (
            <ViroARScene
                ref={(scene) => {this.scene = scene;}}
                onClick={click_handler}
                onCameraTransformUpdate={camera_handler}
                onTrackingUpdated={tracking_handler}
                >
                <ViroLightingEnvironment source={require('./Component/res/garage_1k.hdr')}/>
                <ViroAmbientLight color={"#aaaaaa"} influenceBitMask={1} />
                {compList}
            </ViroARScene>
        );
    }
};

module.exports = { ARCircuitScene, opCode, BasicCircuit, AdvancedCircuit, modeConstant };