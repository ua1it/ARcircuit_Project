import React from 'react';
import { Viro3DObject } from '@viro-community/react-viro';

export default class ArduinoUno extends Viro3DObject
{
    constructor()
    {
        super();
    }

    render()
    {
        const source = require('./res/arduino_uno.glb');
        const resource = [require('./res/1775.png'),
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
            <Viro3DObject
                source={source}
                position={this.props.position}
                scale={this.props.scale}
                type='GLB'
                lightReceivingBitMask={3}
                shadowCastingBitMask={2}
                resources={resource}
                />
        );
    }
}

module.exports = ArduinoUno;