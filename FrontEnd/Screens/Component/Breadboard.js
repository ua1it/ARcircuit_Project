'use strict';

import React from 'react';

import { Viro3DObject, ViroSpotLight, ViroQuad, ViroNode } from '@viro-community/react-viro';
import MathUtils from '../Util/MathUtils'


export const sizeConstants = {
    // length constants - based on gltf (scale = 1.0)
    horizontal: 1625,
    vertical: 550,
    height: 96,

    // port constants
    num_np: 50,
    num_alphabet: 63,

    // distance between ports (obtained from eye inspection)
    distance: 25,
    coord_neg: [97, 30],
    coord_j: [49, 136],

    // obtained from above values
    vert_e: 314, // y = vertical - j.y - distance * 4
    vert_neg_bottom: 495, // y = vertical - neg.y - distance

    // size flexiblity
    flexiblity: 20,

    scale: 0.0005
};

export default class Breadboard
{
    static init(data)
    {
        data.get = Breadboard.getRender.bind(data);

        data.node_props.position = [0, -.5, -.5];
        data.node_props.dragType = 'FixedDistance'
        data.node_props.onDrag = Breadboard.onDrag.bind(data);
        data.node_props.onClick = Breadboard.onClick.bind(data);

        data.props.position = [0, 0, 0];
        data.props.rotation = [0, 0, 0];
        data.props.scale = [sizeConstants.scale, sizeConstants.scale, sizeConstants.scale];
    }

    static getRender(index)
    {
        const source = require('./res/arduino_breadboard_-_low_poly.glb');
        const resources = [require('./res/breadboard_color.png'), require('./res/breadboard_normal.png')];

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

    static onClick(position, source)
    {
        var port = Breadboard.computePort(MathUtils.vecAdd(this.node_props.position, this.props.position), this.props.rotation, position);
        console.log('Port:', port);
    }

    static onDrag(position, source)
    {
        this.node_props.position = MathUtils.vecCopy(position);
    }

    static computePort(position, rotation, vecEnd)
    {
        // make it clear that the linetrace ended with the first plane.

        // plane = horizontal vector + a coordinate in plane
        var plane_h = MathUtils.rotateX([0, 1, 0], rotation[0]);
        plane_h = MathUtils.rotateY(plane_h, rotation[1]);
        plane_h = MathUtils.rotateZ(plane_h, rotation[2]);

        var dist = sizeConstants.scale * sizeConstants.height / 2;

        // center of upper plane
        let src_center = MathUtils.vecCopy(position);
        src_center[1] += dist;

        // compute rotation
        var plane_c = MathUtils.rotateX(src_center, rotation[0]);
        plane_c = MathUtils.rotateY(plane_c, rotation[1]);
        plane_c = MathUtils.rotateZ(plane_c, rotation[2]);

        // compute distance
        // product(vecEnd + k * plane_horizontal - plane_coordinate, plane_horizontal) = 0
        // (vecEnd[0] + k * h[0] - p[0]) * h[0] + (vecEnd[1] + k * h[1] - p[1]) * h[1] + (vecEnd[2] + k * h[2] - p[2]) * h[2] = 0
        // (h[0]vecEnd[0] + h[1]vecEnd[1] + h[2]vecEnd[2]) + k(h[0]h[0] + h[1]h[1] + h[2]h[2]) - (p[0]h[0] + p[1]h[1] + p[2]h[2]) = 0
        // k = (product(h, p) - product(vecEnd, h)) / (product(h, h));
        // target = vecEnd + k * h = vecEnd + (product(h, p) - product(vecEnd, h)) / (product(h, h)) * h

        // k
        var multiplier = (MathUtils.vecInnerProduct(plane_h, plane_c) - MathUtils.vecInnerProduct(vecEnd, plane_h)) / MathUtils.vecInnerProduct(plane_h, plane_h);

        // k * h
        var scaled_h = MathUtils.vecScale(plane_h, multiplier);

        // target
        let target = MathUtils.vecAdd(vecEnd, scaled_h);

        // compute reverse rotation (make its rotation = [0, 0, 0])
        target = MathUtils.rotateX(target, -rotation[0]);
        target = MathUtils.rotateY(target, -rotation[1]);
        target = MathUtils.rotateZ(target, -rotation[2]);

        // get horizontal and vertical distance between points
        let vecDist = [
            target[0] - src_center[0],
            target[1] - src_center[1],
            target[2] - src_center[2]
        ];

        // result
        let result_port = -1;

        // compute port coordinates here...

        // align position top-left from center
        let horizontal = vecDist[0] + sizeConstants.horizontal / 2 * sizeConstants.scale;
        let vertical = vecDist[2] + sizeConstants.vertical / 2 * sizeConstants.scale;

        // out of breadboard - no ports chossed!
        if (horizontal <= 0 || horizontal >= sizeConstants.horizontal * sizeConstants.scale
            || vertical <= 0 || vertical >= sizeConstants.vertical * sizeConstants.scale
            || Math.abs(vecDist[1]) >= (sizeConstants.flexiblity + sizeConstants.height / 2) * sizeConstants.scale)
        {
            
        }
        else
        {
            var heights = [
                (sizeConstants.coord_neg[1] - sizeConstants.flexiblity / 2) * sizeConstants.scale,
                (sizeConstants.coord_j[1] - sizeConstants.flexiblity / 2) * sizeConstants.scale,
                (sizeConstants.vert_e - sizeConstants.flexiblity / 2) * sizeConstants.scale,
                (sizeConstants.vert_neg_bottom - sizeConstants.flexiblity / 2) * sizeConstants.scale
            ];
    
            for (var i = 3; i >= 0; i--)
            {
                if (vertical >= heights[i])
                {
                    result_port = i;
                    break;
                }
            }
        }

        if (result_port != -1)
        {
            let x = -1;
            let y = result_port;

            let min_x = 0;

            switch (y)
            {
                case 0, 3: min_x = sizeConstants.coord_neg[0]; break;
                case 1, 2: min_x = sizeConstants.coord_j[0]; break;
            }
            min_x -= sizeConstants.flexiblity;
            min_x *= sizeConstants.scale;

            if (horizontal >= min_x)
            {
                x = parseInt((horizontal - min_x) / sizeConstants.distance / sizeConstants.scale);
                switch (y)
                {
                    case 0, 3:
                        if (x >= sizeConstants.num_np + 9) // out of board
                            result_port = -1;
                        else if (x % 6 == 0) // every 6th port is blocked
                            result_port = -1;
                        break;
                    case 1, 2:
                        if (x >= sizeConstants.num_alphabet) // out of board
                            result_port = -1;
                        break;
                }
            }

            if (result_port != -1)
            {
                y = parseInt((vertical - heights[result_port]) / sizeConstants.distance / sizeConstants.scale);
                switch (result_port)
                {
                    case 0, 3:
                        if (y >= 2) // out of board
                            result_port = -1;
                        break;
                    case 1, 2:
                        if (y >= 5) // out of board
                            result_port = -1;
                        break;
                }

                
                if (result_port != -1)
                    result_port = [x, y];
            }
        }

        return result_port;
    }
}

module.exports = Breadboard;