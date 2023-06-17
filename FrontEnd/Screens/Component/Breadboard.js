'use strict';

import React from 'react';

import { Viro3DObject, ViroSpotLight, ViroQuad, ViroNode } from '@viro-community/react-viro';
import MathUtil from '../Util/MathUtil'

const sizeConstant = {
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

export class Breadboard extends React.Component
{
	constructor(props)
	{
		super(props);
		
		this.onDrag = this.onDrag.bind(this);
		this.onClick = this.onClick.bind(this);
		
		this.state = {
			position: [0, 0, 0],
			rotation: [0, 0, 0],
			selected: false,
			chosen: false,
			connected: []
		}
	}
	
    render()
    {
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
					text: "Connect",
					scale: [.25, .25, .25],
					position: [0, .25, 0],
					style: text_style
				}
			}
		];
		
		let optionComp = null;
		
		if (this.state.selected)
			optionComp = ViroUtil.buildOption(this.props.name, options);
		
        const source = require('./res/arduino_breadboard_-_low_poly.glb');
        const resources = [require('./res/breadboard_color.png'), require('./res/breadboard_normal.png')];
		const objectSize = [sizeConstant.scale, sizeConstant.scale, sizeConstant.scale];

        return (
			<ViroNode
				position={[0, -.5, -0.5]}
				dragType="FixedDistance"
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
					scale={objectSize}
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
	
	_menu1()
	{
		this.setState({
			selected: true,
			chosen: false
		});
	}
	
	_animend()
	{
		this.setState({
			selected: false,
			chosen: false
		});
	}

    onClick(position, source)
    {
        var port = Breadboard.pos2port(this.state.position, this.state.rotation, position);
        console.log('Port:', port);
    }

    onDrag(dest, source)
    {
		this.setState({position: MathUtil.vecCopy(dest)});
    }

    static pos2port(position, rotation, vecEnd)
    {
        // make it clear that the linetrace ended with the first plane.

        // plane = horizontal vector + a coordinate in plane
        var plane_h = MathUtil.rotateX([0, 1, 0], rotation[0]);
        plane_h = MathUtil.rotateY(plane_h, rotation[1]);
        plane_h = MathUtil.rotateZ(plane_h, rotation[2]);

        var dist = sizeConstant.scale * sizeConstant.height / 2;

        // center of upper plane
        let src_center = MathUtil.vecCopy(position);
        src_center[1] += dist;

        // compute rotation
        var plane_c = MathUtil.rotateX(src_center, rotation[0]);
        plane_c = MathUtil.rotateY(plane_c, rotation[1]);
        plane_c = MathUtil.rotateZ(plane_c, rotation[2]);

        // compute distance
        // product(vecEnd + k * plane_horizontal - plane_coordinate, plane_horizontal) = 0
        // (vecEnd[0] + k * h[0] - p[0]) * h[0] + (vecEnd[1] + k * h[1] - p[1]) * h[1] + (vecEnd[2] + k * h[2] - p[2]) * h[2] = 0
        // (h[0]vecEnd[0] + h[1]vecEnd[1] + h[2]vecEnd[2]) + k(h[0]h[0] + h[1]h[1] + h[2]h[2]) - (p[0]h[0] + p[1]h[1] + p[2]h[2]) = 0
        // k = (product(h, p) - product(vecEnd, h)) / (product(h, h));
        // target = vecEnd + k * h = vecEnd + (product(h, p) - product(vecEnd, h)) / (product(h, h)) * h

        // k
        var multiplier = (MathUtil.vecInnerProduct(plane_h, plane_c) - MathUtil.vecInnerProduct(vecEnd, plane_h)) / MathUtil.vecInnerProduct(plane_h, plane_h);

        // k * h
        var scaled_h = MathUtil.vecScale(plane_h, multiplier);

        // target
        let target = MathUtil.vecAdd(vecEnd, scaled_h);

        // compute reverse rotation (make its rotation = [0, 0, 0])
        target = MathUtil.rotateX(target, -rotation[0]);
        target = MathUtil.rotateY(target, -rotation[1]);
        target = MathUtil.rotateZ(target, -rotation[2]);

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
        let horizontal = vecDist[0] + sizeConstant.horizontal / 2 * sizeConstant.scale;
        let vertical = vecDist[2] + sizeConstant.vertical / 2 * sizeConstant.scale;

        // out of breadboard - no ports chossed!
        if (horizontal <= 0 || horizontal >= sizeConstant.horizontal * sizeConstant.scale
            || vertical <= 0 || vertical >= sizeConstant.vertical * sizeConstant.scale
            || Math.abs(vecDist[1]) >= (sizeConstant.flexiblity + sizeConstant.height / 2) * sizeConstant.scale)
        {
            
        }
        else
        {
            var heights = [
                (sizeConstant.coord_neg[1] - sizeConstant.flexiblity / 2) * sizeConstant.scale,
                (sizeConstant.coord_j[1] - sizeConstant.flexiblity / 2) * sizeConstant.scale,
                (sizeConstant.vert_e - sizeConstant.flexiblity / 2) * sizeConstant.scale,
                (sizeConstant.vert_neg_bottom - sizeConstant.flexiblity / 2) * sizeConstant.scale
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
                case 0, 3: min_x = sizeConstant.coord_neg[0]; break;
                case 1, 2: min_x = sizeConstant.coord_j[0]; break;
            }
            min_x -= sizeConstant.flexiblity;
            min_x *= sizeConstant.scale;

            if (horizontal >= min_x)
            {
                x = parseInt((horizontal - min_x) / sizeConstant.distance / sizeConstant.scale);
                switch (y)
                {
                    case 0, 3:
                        if (x >= sizeConstant.num_np + 9) // out of board
                            result_port = -1;
                        else if (x % 6 == 0) // every 6th port is blocked
                            result_port = -1;
                        break;
                    case 1, 2:
                        if (x >= sizeConstant.num_alphabet) // out of board
                            result_port = -1;
                        break;
                }
            }

            if (result_port != -1)
            {
                y = parseInt((vertical - heights[result_port]) / sizeConstant.distance / sizeConstant.scale);
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
	
	static port2pos(position, rotation, port)
	{
		
	}
}
