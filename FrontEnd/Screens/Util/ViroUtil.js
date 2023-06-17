'use strict';

import React from 'react';

import {
	ViroMaterials,
	ViroNode,
	ViroAnimations,
	ViroSphere,
	ViroText,
	ViroImage
} from '@viro-community/react-viro';

export class ViroUtil
{
	// TODO: create ViroSphere components with options.
	// 
	// For render function only.
	// @parent_key: the name of parent (parent.props.name)
	// @options: option list
	//
	// @output: React components of ViroSphere and ViroText
	static buildOption(parent_key, options)
	{
		let sphereComp = options.map((obj, idx) => {
			return (
				<ViroSphere
					key={`${parent_key}_sphere_${idx}`}
					{...obj.sphere_props}
					heightSegmentCount={20} widthSegmentCount={20} radius={.03} shadowCastingBitMask={0} />
				);
		});
		
		let textComp = options.map((obj, idx) => {
			return (
				<ViroText
					key={`${parent_key}_text_${idx}`}
					{...obj.text_props} />
			);
		});
		
		let optComp = sphereComp.concat(textComp);
		return optComp;
	}

	static buildImage(parent_key, image_id, source, position, rotation, opacity)
	{
		if (opacity === undefined)
			opacity = 1.0;
		
		return (
			<ViroImage
				key={`${parent_key}_image_${image_id}`}
				position={position}
				rotation={rotation}
				width={0.05}
				height={0.05}
				opacity={opacity}
				placeholderSource={source}
				source={source}
			/>
		);
	}
	
	// TODO: "Circuit_$class_$index" ==> [class, index]
	// @param name: component.props.name
	static getInfo(name)
	{
		var s = name.substr(8).split("_");

		let classid = parseInt(s[0]);
		let index = parseInt(s[1]);

		return [classid, index];
	}

	static makeToast(type, text1, text2, time)
	{
		this.sendScene("toast", {
			type: type,
			text1: text1,
			text2: text2,
			position: 'bottom',
			visibilityTime: time
		});
	}
}

// Basic Materials
export const basic_viromat = ViroMaterials.createMaterials({
	white_sphere: {
		lightingModel: "PBR",
		diffuseColor: "rgb(231, 231, 231)",
	},
	blue_sphere: {
		lightingModel: "PBR",
		diffuseColor: "rgb(19, 42, 143)",
	},
	grey_sphere: {
		lightingModel: "PBR",
		diffuseColor: "rgb(75, 76, 79)",
	},
	red_sphere: {
		lightingModel: "PBR",
		diffuseColor: "rgb(168, 0, 0)",
	},
	yellow_sphere: {
		lightingModel: "PBR",
		diffuseColor: "rgb(200, 142, 31)",
	},
});

// Basic animations
export const basic_viroanim = ViroAnimations.registerAnimations({
    scaleUp:{
		properties:{
			scaleX:1,
			scaleY:1,
			scaleZ:1,
		},
		duration: 500,
		easing: "bounce"
	},
    scaleSphereUp:{
		properties:{
			scaleX:.8,
			scaleY:.8,
			scaleZ:.8,
		},
		duration: 50,
		easing: "easeineaseout"
	},
    scaleSphereDown:{
		properties:{
			scaleX:1,
			scaleY:1,
			scaleZ:1,
		},
		duration: 50,
		easing: "easeineaseout"
	},
    tapAnimation:[
		["scaleSphereUp", "scaleSphereDown"],
	]
});

export const text_styles = {
	default: {
		fontFamily: 'Arial',
		fontSize: 18,
		color: '#ffffff',
		textAlignVertical: 'center',
		textAlign: 'center',
	}
}
