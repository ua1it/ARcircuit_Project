'use strict';

import { NativeSyntheticEvent } from "react-native";

import { Viro3DObject, ViroMaterials, ViroCameraARHitTestEvent } from '@viro-community/react-viro';
import { MathUtils } from '../Util/MathUtils'


const sizeConstants = {
    // length constants - based on gltf (scale = 100)
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
    flexiblity: 20
};

export default class Breadboard extends Viro3DObject
{
    constructor(props)
    {
        super(props);
        this.state = {
            texture: 'default',
            current_port: -1
        };
    }

    render()
    {
        const source = require('./res/arduino_breadboard_-_low_poly.glb');
        const resources = [require('./res/breadboard_color.png'), require('./res/breadboard_normal.png')];

        return (
            <Viro3DObject
                source={source}
                position={this.props.position}
                scale={this.props.scale}
                resources={resources}
                type='GLB'
                lightReceivingBitMask={3}
                shadowCastingBitMask={2}
                />
        );
    }

    _onCameraTransformUpdate = (event) => {
        var results = {
            hitTestResults: event.nativeEvent.hitTestResults,
            cameraOrientation: {
                position: [
                    event.nativeEvent.cameraOrientation[0],
                    event.nativeEvent.cameraOrientation[1],
                    event.nativeEvent.cameraOrientation[2],
                ],
                rotation: [
                    event.nativeEvent.cameraOrientation[3],
                    event.nativeEvent.cameraOrientation[4],
                    event.nativeEvent.cameraOrientation[5],
                ],
                forward: [
                    event.nativeEvent.cameraOrientation[6],
                    event.nativeEvent.cameraOrientation[7],
                    event.nativeEvent.cameraOrientation[8],
                ],
                up: [
                    event.nativeEvent.cameraOrientation[9],
                    event.nativeEvent.cameraOrientation[10],
                    event.nativeEvent.cameraOrientation[11],
                ],
            },
        };
        
        if (results.lnegth <= 0)
        {
            this.setState({current_port: -1});
            return;
        }

        // first confilcted result only
        var result = results.length[1];
        console.log(result);

        if (result.type != "ExistingPlaneUsingExtent")
            return;
        
        console.log(result.transform.position);
        this._computePort(result.transform.position);
    };

    static computePort(vecEnd)
    {
        // make it clear that the linetrace ended with the first plane.

        // plane = horizontal vector + a coordinate in plane
        let plane_h = this.props.rotation;
        var dist = this.props.scale[2] * sizeConstants.height / 2;

        // center of upper plane
        let src_center = MathUtils.vecCopy(this.props.posiiton);
        src_center[2] += dist;

        // compute rotation
        let plane_c = MathUtils.rotateX(src_center, plane_h[0]);
        plane_c = MathUtils.rotateY(plane_c, plane_h[1]);
        plane_c = MathUtils.rotateZ(plane_c, plane_h[2]);

        // compute distance
        // product(vecEnd + k * plane_horizontal, plane_coordinate) = 0
        // (vecEnd[0] + k * h[0]) * p[0] + (vecEnd[1] + k * h[1]) * p[1] + (vecEnd[2] + k * h[2]) * p[2] = 0
        // p[0]vecEnd[0] + p[1]vecEnd[1] + p[2]vecEnd[2] + k(h[0] + h[1] + h[2]) = 0
        // k = -1 * (product(vecEnd, p)) / (h[0] + h[1] + h[2]);
        // target = vecEnd + k * h = vecEnd - (product(vecEnd, p)) / (h[0] + h[1] + h[2]) * h

        // k
        var multiplier = -1 * MathUtils.vecProduct(vecEnd, plane_c) / (plane_h[0] + plane_h[1] + plane_h[2]);

        // k * h
        var scaled_h = MathUtils.vecScale(plane_h, multiplier);

        // target
        let target = MathUtils.vecAdd(vecEnd, scaled_h);
        console.log(target);

        // compute reverse rotation (make its rotation = [0, 0, 0])
        target = MathUtils.rotateX(target, -plane_h[0]);
        target = MathUtils.rotateY(target, -plane_h[1]);
        target = MathUtils.rotateZ(target, -plane_h[2]);
        console.log(target);

        // get horizontal and vertical distance between points
        let vecDist = [
            target[0] - src_center[0],
            target[1] - src_center[1],
            target[2] - src_center[2]
        ];
        console.log(vecDist);

        // result
        let result_port = -1;

        // compute port coordinates here...

        // align position top-left from center
        let horizontal = vecDist[0] - sizeConstants.horizontal / 2 * this.props.scale[0];
        let vertical = vecDist[1] - sizeConstants.vertical / 2 * this.props.scale[1];

        var avgsize = (this.props.scale[0] + this.props.scale[1] + this.props.scale[2]) / 3;

        // out of breadboard - no ports chossed!
        if (horizontal <= 0 || horizontal >= sizeConstants.horizontal * this.props.scale[0]
            || vertical <= 0 || vertical >= sizeConstants.vertical * this.props.scale[1]
            || Math.abs(vecDist[2]) >= sizeConstants.flexiblity * avgsize)
        {
            result_port = -1;
        }
        else
        {
            var heights = [
                (sizeConstants.coord_neg[1] - sizeConstants.flexiblity / 2) * this.props.scale[1],
                (sizeConstants.coord_j[1] - sizeConstants.flexiblity / 2) * this.props.scale[1],
                (sizeConstants.vert_e - sizeConstants.flexiblity / 2) * this.props.scale[1],
                (sizeConstants.vert_neg_bottom - sizeConstants.flexiblity / 2) * this.props.scale[1]
            ];
    
            for (var i = 0; i < heights.length; i++)
            {
                if (vertical < heights[i])
                {
                    if (result_port != -1)
                        break;

                    result_port = i;
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
            min_x *= this.props.scale[0];

            if (horizontal >= min_x)
            {
                x = parseInt((horizontal - min_x) / sizeConstants.distance / avgsize);
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
                var y = parseInt((vertical - heights[j]) / sizeConstants.distance / avgsize);
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

        console.log(result_port);
        this.setState({current_port: result_port});
    }
}

module.exports = Breadboard;