'use strict';

import React from 'react';

import { Viro3DObject, ViroSpotLight, ViroQuad, ViroNode } from '@viro-community/react-viro';

import { PinState } from 'avr8js';
import { buildHex } from './src/compile';
import { CPUPerformance } from './src/cpu-performance';
import { AVRRunner } from './src/execute';
import { formatTime } from './src/format-time';

export default class Buzzer
{
    static init(data)
    {
        data.get = Buzzer.getRender.bind(data);
        data.onCompile = Buzzer._compile.bind(data);

        data.node_props.position = [0, -.5, -.5];
        data.node_props.scale = [0.2, 0.2, 0.2];
        data.node_props.dragType = 'FixedDistance'
        data.node_props.onDrag = () => {};
        data.node_props.onClick = () => {console.log('hi!!')};

        data.props.position = [0, 0, 0];
        data.props.rotation = [0, 0, 0];
        data.props.scale = [.1, .1, .1];
    }

    static getRender(index)
    {
        const source = require('./res/buzzer.glb');
        const resources = [require('./res/buzzerResource1.jpeg'),];
        return (
            <ViroNode key={index} {...this.node_props}>
                <ViroSpotLight
                    innerAngle={5}
                    outerAngle={45}
                    direction={[0, -1, -.2]}
                    position={[0, 13, 0]}
                    color="#ffffff"
                    castsShadow={true}
                    influenceBitMask={2}
                    shadowMapSize={2048}
                    shadowNearZ={2}
                    shadowFarZ={5}
                    shadowOpacity={.7}
                    />
                <Viro3DObject
                    {...this.props}
                    source={source}
                    resources={resources}
                    type='GLB'
                    lightReceivingBitMask={3}
                    shadowCastingBitMask={2}
                    />
                <ViroQuad
                    rotation={[-90, 0, 0]}
                    width={.5} height={.5}
                    arShadowReceiver={true}
                    lightReceivingBitMask={2}
                    />
            </ViroNode>
        );
    }
	
	static _compile(code)
	{
        const run = async() => {
            try {
                console.log('in compiling...');
                const result = await buildHex(code);
                console.log(`${result.stderr || result.stdout}`);
                if (result.hex) {
                    console.log('on loading...');
                    Buzzer._execute(this, result.hex);
                }
            } catch (err) {
                console.log('Failed: ' + err);
            }
        }
        run();
	}
}

module.exports = Buzzer;