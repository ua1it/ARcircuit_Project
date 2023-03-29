'use strict';

import React from 'react';

import { Viro3DObject, ViroSpotLight, ViroQuad, ViroNode } from '@viro-community/react-viro';

import { PinState } from 'avr8js';
import { buildHex } from './src/compile';
import { CPUPerformance } from './src/cpu-performance';
import { AVRRunner } from './src/execute';
import { formatTime } from './src/format-time';

export default class Ultrasonic
{
    static init(data)
    {
        data.get = Ultrasonic.getRender.bind(data);
        data.onCompile =  Ultrasonic._compile.bind(data);

        data.node_props.position = [0, -.5, -.5];
        data.node_props.dragType = 'FixedDistance'
        data.node_props.onDrag = () => {};
        data.node_props.onClick = () => {console.log('hi!!')};

        data.props.position = [0, 0, 0];
        data.props.rotation = [-90, 0, 0];
        data.props.scale = [.2, .2, .2];
    }

    static getRender(index)
    {
        const source = require('./res/sensor_ultrason.glb');
        const resources = [require('./res/ultra_textures/gltf_embedded_0.png'),
        require('./res/ultra_textures/gltf_embedded_1.png'),
        require('./res/ultra_textures/gltf_embedded_2.png'),
        require('./res/ultra_textures/gltf_embedded_4.png'),
        require('./res/ultra_textures/gltf_embedded_5.png'),
        require('./res/ultra_textures/gltf_embedded_6.png'),
        require('./res/ultra_textures/gltf_embedded_7.png'),
        require('./res/ultra_textures/gltf_embedded_8.png'),
        require('./res/ultra_textures/gltf_embedded_9.png'),
        require('./res/ultra_textures/gltf_embedded_12.png'),
        require('./res/ultra_textures/gltf_embedded_13.png'),
        require('./res/ultra_textures/gltf_embedded_16.png'),
        require('./res/ultra_textures/gltf_embedded_19.png'),
        require('./res/ultra_textures/gltf_embedded_20.png'),
        require('./res/ultra_textures/gltf_embedded_23.png'),
        require('./res/ultra_textures/gltf_embedded_13@channels=A.png'),
        require('./res/ultra_textures/gltf_embedded_20@channels=A.png')
    ];
        return (
            <ViroNode key={index} {...this.node_props}>
                <ViroSpotLight
                    innerAngle={5}
                    outerAngle={45}
                    direction={[0, -1, -.2]}
                    position={[0, 10, 0]}
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
                    Ultrasonic._execute(this, result.hex);
                }
            } catch (err) {
                console.log('Failed: ' + err);
            }
        }
        run();
	}
	
	static _execute(data, hex)
	{
		var runner = new AVRRunner(hex);
		const MHZ = 16e+6;
		
		// Hook to PORTB register
		runner.portB.addListener(() => {
			console.log("port B: ", 
			runner.portB.pinState(4),
			runner.portB.pinState(5)
			);
		});
		runner.usart.onByteTransmit = (value) => {
			console.log("serial: ",
			String.fromCharCode(value)
			);
		};
		
		const cpuPerf = new CPUPerformance(runner.cpu, MHZ);
		runner.execute((cpu) => {
			const time = formatTime(cpu.cycles / MHZ);
			const speed = (cpuPerf.update() * 100).toFixed(0);
			console.log(`Simulation time: ${time} (${speed}%)`);
		});
	}
}

module.exports = Ultrasonic;