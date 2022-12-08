import React, { Component, useEffect, useState } from 'react';

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


let detectOrBase = 'base';

function ARScreen(){
  const [hasARInitialized, setHasARInitialized] = useState(false);
  const [text,setText] = useState('Initializing AR...');

  useEffect(()=>{
    if (!hasARInitialized) {
      setHasARInitialized(true);
      setText("IEEC AR!");
    }
  },[hasARInitialized])

		return (
			<View>
				<ViroARScene>
					<ViroText
						text={text}
						scale={[0.5, 0.5, 0.5]}
						position={[0, 0, -1]}
						style={styles.helloWorldTextStyle}
						/>
					<ViroAmbientLight color={"#aaaaaa"} influenceBitMask={1} />
          {
            detectOrBase === 'base'?(
              <ViroNode position={[0, -2, 0]} dragType="FixedDistance" onDrag={() => { }} >
            {/* Spotlight to cast light on the object and a shadow on the surface, see
            the Viro documentation for more info on lights & shadows */}
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
                  source={require('./Arduino/ArduinoUno/arduino_uno.glb')}
                  position={[0, 0, 0]}
                  scale={[0.5, 0.5, 0.5]}
                  type="GLB"
                  lightReceivingBitMask={3}
                  shadowCastingBitMask={2}
                  
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
            ):(
              <ViroNode>

              </ViroNode>
            )
          }
				</ViroARScene>
			</View>
		);
};

export default ({route}: Navigation) => {
  console.log("state: "+route.params.state);
  detectOrBase = route.params.state;
	return (
		<View style={{flex: 1}}>
      <ViroARSceneNavigator
        autofocus={true}
        initialScene={{scene: ARScreen,}}
      />
      {
        route.params.state === 'detect'?(
          <View style={styles.boardFrame}>
            <Text style = {styles.boardTitleText}>Place your board in this area!</Text>
          </View>
        ):(
          <View></View>
        )
      }
      <View style={styles.handFrame}>
      <Text style = {styles.handTitleText}>HandControl here!</Text>

      </View>
      {/* <View style={styles.abs}>
        <TouchableHighlight
          style={styles.buttons}
          onPress={()=>{console.log('Pressed Button detect')}}
          underlayColor={'#00000000'}
          >
          <Image source={require("../images/btn_mode_objects.png")}/>
        </TouchableHighlight>
      </View> */}
		</View>
	);
};

var styles = StyleSheet.create({
	f1: { flex: 1 },
	abs: {
		position: 'absolute',
		left: 0,
		right: 0,
		bottom: 20,
		alignItems: 'center'
	},
  boardFrame:{
    width: '70%',
    height: '90%',
    position: 'absolute',
    borderColor: 'white',
    borderWidth: 1,
    top: 20,
    left: 10,
  },
  handFrame:{
    width: '25%',
    height: '90%',
    position: 'absolute',
    borderColor: 'white',
    borderWidth: 1,
    top: 20,
    right: 10,
  },
  boardTitleText: {
    marginLeft: '1%',
    color: 'white'
  },
  handTitleText: {
    marginLeft: '3%',
    color: 'white',
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
		backgroundColor:'#00000000',
		borderRadius: 10,
		borderWidth: 1,
		borderColor: '#ffffff00',
	}
});