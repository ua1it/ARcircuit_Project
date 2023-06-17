'use strict';

import React from 'react';

import { ViroAmbientLight, ViroARScene } from '@viro-community/react-viro';

import { ArduinoUno } from './Component/Uno';
import { Breadboard } from './Component/Breadboard';
import { LED } from './Component/LED';
import Button from './Component/Button';
import Resistor from './Component/Resistor';
import Buzzer from './Component/Buzzer';
import Potentiometer from './Component/Potentiometer';
import Ultrasonic from './Component/ultrasonic';
import Cable from './Component/cable';
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

            component: [],
            
            cameraTransform: {}
		};

        this.component = [];

        this.total_idx = 0;

        this.createComp = this._createComp.bind(this);
        this.removeComp = this._removeComp.bind(this);
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

        this.callParent("toast", {
            type: "success",
            text1: "Added component",
            text2: `Successfully added ${classname}, id: ${data.props.name}`,
            position: 'bottom',
            visibilityTime: 2000
        });

        this.component.push(data);
        this.total_idx += 1;
        return data.index;
    }

    _removeComp(name)
    {
        var idx = ViroUtil.getInfo(name)[1];
        for (var i = 0; i < this.component.length; i++)
        {
            if (this.component[i].index == idx)
            {
                this.callParent("toast", {
                    type: "success",
                    text1: "Remove successful",
                    text2: `Remove component ${name}`,
                    position: 'bottom',
                    visibilityTime: 2000
                });

                this.component.splice(i, 1);
                break;
            }
        }
    }

    static _getComp(data)
    {
		switch (data.classid)
		{
            case 0: return (<ArduinoUno key={data.index} {...data.props} />);
			case 1: return (<Breadboard key={data.index} {...data.props} />);
            case 2: return (<LED key={data.index} {...data.props} />);
            /*case 3: Button.init(data); break;
            case 4: Resistor.init(data); break;
            case 5: Buzzer.init(data); break;
            case 6: Potentiometer.init(data); break;
            case 8: Ultrasonic.init(data); break;
            case 9: Cable.init(data); break;*/
		}
		
		return (null);
    }
	
	_onCommand(command, data)
	{
		console.log(`test: ${command}, [${data}]`);
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
            
            // Edit code (Uno)
            case "editor":
                this.callParent("editor", data);
                break;
            
            // Toast
            case "toast":
                this.callParent("toast", data);
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
                        this.callParent("toast", {
                            type: "info",
                            text1: "Add component",
                            text2: `Touch target point to create component ${source}`,
                            position: 'bottom',
                            visibilityTime: 2000
                        });
                        
                        this.setState({
                            mode: modeConstant.ADD,
                            caller: source
                        })
                    }, 10);
                    break;
                case opCode.REMOVE:
                    setTimeout(() => {
                        this.callParent("toast", {
                            type: "info",
                            text1: "Remove component",
                            text2: `Touch target component to remove, touch blank to cancel.`,
                            position: 'bottom',
                            visibilityTime: 2000
                        });

                        this.setState({
                            mode: modeConstant.REMOVE,
                            caller: null
                        })
                    }, 10);
                    break;
                case opCode.REMOVE_CANCEL:
                    setTimeout(() => {
                        this.callParent("toast", {
                            type: "info",
                            text1: "Remove canceled",
                            position: 'bottom',
                            visibilityTime: 2000
                        });

                        this.setState({
                            mode: modeConstant.IDLE,
                            caller: null
                        })
                    }, 10);
                    break;
            }
        }

        let compList = this.component.map(ARCircuitScene._getComp);

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
            switch (this.state.mode)
            {
                case modeConstant.ADD:
                    console.log(`create: ${position}`);
                    this.createComp(position, this.state.caller);
                    this.setState({
                        mode: modeConstant.IDLE,
                        caller: null
                    });
                    break;
                case modeConstant.REMOVE:
                    this.callParent("toast", {
                        type: "info",
                        text1: "Remove canceled",
                        position: 'bottom',
                        visibilityTime: 2000
                    });
                    this.setState({
                        mode: modeConstant.IDLE,
                        caller: null
                    });
                    break;
            }
        }

        return (
            <ViroARScene ref={(scene) => {this.scene = scene;}} onClick={click_handler} onCameraTransformUpdate={camera_handler}>
                <ViroAmbientLight color={"#aaaaaa"} influenceBitMask={1} />
                {compList}
            </ViroARScene>
        );
    }
};

module.exports = { ARCircuitScene, opCode, BasicCircuit, AdvancedCircuit, modeConstant };