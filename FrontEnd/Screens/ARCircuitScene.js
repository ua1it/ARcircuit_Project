'use strict';

import React from 'react';

import { ViroAmbientLight, ViroARScene } from '@viro-community/react-viro';

import Breadboard from './Component/Breadboard';
import ArduinoUno from './Component/Uno';


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
    'Register',
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

const ComponentProps =
{
    index: -1,
    get: undefined,
    node_props: {},
    props: {},
    select: false,
    movable: false,
    editable: false,

    extra: undefined
};

class ARCircuitScene extends React.Component
{
    constructor()
    {
        super();

        this.components = [];

        this._createComponent = this._createComponent.bind(this);
        this._removeComponent = this._removeComponent.bind(this);
        this._onClick = this._onClick.bind(this);
        this._getComponentModel = this._getComponentModel.bind(this);
    }

    _createComponent(classname)
    {
        var data = {};
        Object.assign(data, ComponentProps);

        var index = BasicCircuit.indexOf(classname);
        if (index == -1)
            return -1;
        
        console.log('create class id:', index);
        data.classid = index;

        // bind function with 'data' to make them process their data in init function.
        switch (data.classid)
        {
            case 0: ArduinoUno.init(data); break;
            case 1: Breadboard.init(data); break;
            default: return -1;
        }

        this.components.push(data);
        return this.components.length;
    }

    _removeComponent(index)
    {
        if (index >= this.components.length || index < 0)
            return;
        
        this.components.splice(index, 1);
    }

    _onClick(position, source)
    {
        console.log('onClick:', position, source);
    }

    _getComponentModel(data, index)
    {
        console.log('gc', index);
        return data.get(index);
    }

    render()
    {
        if (this.props.arSceneNavigator.viroAppProps != undefined)
        {
            let operation = this.props.arSceneNavigator.viroAppProps.opcode;
            let source = this.props.arSceneNavigator.viroAppProps.source;

            switch (operation)
            {
                case opCode.CREATE:
                case opCode.REMOVE:
                    if (operation == opCode.CREATE)
                        this._createComponent(source);
                    else
                        this._removeComponent(source);
                    break;
            }
        }

        let getComponentList = this.components.map((data, index) => this._getComponentModel(data, index));

        return (
            <ViroARScene ref={(scene)=>{this.scene = scene}} onClick={this._onClick}>
                <ViroAmbientLight color={"#aaaaaa"} influenceBitMask={1} />
                {getComponentList}
            </ViroARScene>
        );
    }
};

module.exports = { ARCircuitScene, opCode, BasicCircuit, AdvancedCircuit };