'use strict';

import React from 'react';

import { Viro3DObject, ViroSpotLight, ViroQuad, ViroNode } from '@viro-community/react-viro';

export default class ArduinoUno
{
    static init(data)
    {
        data.get = ArduinoUno.getRender.bind(data);

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
            <ViroNode key={index} {...this.node_props}>
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
}

module.exports = ArduinoUno;