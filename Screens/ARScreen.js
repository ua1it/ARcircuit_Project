import React, { Component } from 'react';

import {
	Image,
	StyleSheet,
	Text,
	SafeAreaView,
	Button,
	PermissionsAndroid,
	Platform,
	View,
	TouchableOpacity,
	TouchableHighlight,
	ActivityIndicator
} from 'react-native';

import {
	ViroARScene,
	ViroText,
	ViroButton,
	ViroTrackingStateConstants,
	ViroARSceneNavigator,
	Viro3DObject,
	ViroAmbientLight,
	ViroSpotLight,
	ViroARPlaneSelector,
	ViroNode,
	ViroQuad,
	ViroAnimations,
	ViroCamera,
	ViroFlexView
} from '@viro-community/react-viro';



class ARScreen extends Component {
	constructor(props) {
		super(props);
		this.state = {
			hasARInitialized: false,
			text: 'Initializing AR...'
		};
	}

	_onTrackingUpdated(state, reason) {
		console.log('tracking status updated as', state, reason);
		if (!this.state.hasARInitialized && state === ViroTrackingStateConstants.TRACKING_NORMAL) {
			this.setState({
				hasARInitialized : true,
				text : "AR Demo!"
			});
		}
	}

	render() {
		return (
			<View>
				<ViroARScene onTrackingUpdated={this._onTrackingUpdated.bind(this)}>
					<ViroText
						text={this.state.text}
						scale={[0.5, 0.5, 0.5]}
						position={[0, 0, -1]}
						style={styles.helloWorldTextStyle}
						/>
					<ViroAmbientLight color={"#aaaaaa"} influenceBitMask={1} />

					<ViroARPlaneSelector>
						<ViroNode position={[0, -2, 0]} dragType="FixedToWorld" onDrag={() => { }} >
							{/* Spotlight to cast light on the object and a shadow on the surface, see
							the Viro documentation for more info on lights & shadows */}
							
							<ViroSpotLight
								innerAngle={5}
								outerAngle={45}
								direction={[0, -1, -.2]}
								position={[0, 3, 0]}
								color="#ffffff"
								castsShadow={true}
								influenceBitMask={2}
								shadowMapSize={2048}
								shadowNearZ={2}
								shadowFarZ={5}
								shadowOpacity={.7}
								/>
							<Viro3DObject
								source={require('./Arduino/ArduinoUno/arduino_uno.glb')}
								position={[0, 0, 0]}
								scale={[.1, .1, .1]}
								type="GLB"
								lightReceivingBitMask={3}
								shadowCastingBitMask={2}
								transformBehaviors={['billboardY']}
								resources={[
									require('./Arduino/ArduinoUno/textures/1775.png'),
									require('./Arduino/ArduinoUno/textures/1785.png'),
									require('./Arduino/ArduinoUno/textures/1795.png'),
									require('./Arduino/ArduinoUno/textures/1805.png'),
									require('./Arduino/ArduinoUno/textures/1815.png'),
									require('./Arduino/ArduinoUno/textures/1825.png'),
									require('./Arduino/ArduinoUno/textures/1835.png'),
									require('./Arduino/ArduinoUno/textures/1844.png'),
									require('./Arduino/ArduinoUno/textures/1854.png'),
									require('./Arduino/ArduinoUno/textures/1919.png'),
									require('./Arduino/ArduinoUno/textures/1929.png')
								]}
								/>
							<ViroQuad
								rotation={[-90, 0, 0]}
								width={.5} height={.5}
								arShadowReceiver={true}
								lightReceivingBitMask={2}
								/>
						</ViroNode>
					</ViroARPlaneSelector>
				</ViroARScene>
			</View>
		);
	}
};

export default ({route}: Navigation) => {
  console.log("state: "+route.params.state);
	return (
		<View style={{flex: 1}}>
			<ViroARSceneNavigator
				autofocus={true}
				initialScene={{scene: ARScreen,}}
				/>
			<View style={styles.abs}>
				<TouchableHighlight
					style={styles.buttons}
					onPress={()=>{console.log('Pressed Button')}}
					underlayColor={'#00000000'}
					>
					<Image source={require("../images/btn_mode_objects.png")}/>
				</TouchableHighlight>
			</View>
		</View>
	);
};

var styles = StyleSheet.create({
	f1: { flex: 1 },
	abs: {
		position: 'absolute',
		left: 0,
		right: 0,
		bottom: 77,
		alignItems: 'center'
	},
	helloWorldTextStyle: {
		fontFamily: 'Arial',
		fontSize: 30,
		color: '#ffffff',
		textAlignVertical: 'center',
		textAlign: 'center',
	},
	buttons: {
		height: 80,
		width: 80,
		paddingTop:20,
		paddingBottom:20,
		marginTop: 10,
		marginBottom: 10,
		backgroundColor:'#00000000',
		borderRadius: 10,
		borderWidth: 1,
		borderColor: '#ffffff00',
	}
});