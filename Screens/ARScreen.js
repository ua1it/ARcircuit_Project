import React, { useState, useRef } from 'react';
import { StyleSheet, Text, SafeAreaView, Button, PermissionsAndroid, Platform, View, TouchableOpacity } from 'react-native';
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



const HelloWorldSceneAR = () => {
  const [text, setText] = useState('Initializing AR...');

  function onInitialized(state, reason) {
    console.log('guncelleme', state, reason);
    if (state === ViroTrackingStateConstants.TRACKING_NORMAL) {
      setText('AR Demo!');
    } else if (state === ViroTrackingStateConstants.TRACKING_NONE) {
      // Handle loss of tracking
    }
  }

  return (
    <View>
      <ViroARScene onTrackingUpdated={onInitialized}>
        <ViroText
          text={text}
          scale={[0.5, 0.5, 0.5]}
          position={[0, 0, -1]}
          style={styles.helloWorldTextStyle}
        />
        <ViroAmbientLight color={"#aaaaaa"} />
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
              shadowOpacity={.7} />
            <Viro3DObject
              //source={require('../models/emoji_smile.vrx')}
              //source={require('../models/kielich.obj')}
              source={require('../models/tinker.obj')}
              position={[0, 0, 0]}
              scale={[.01, .01, .01]}
              type="OBJ"
              lightReceivingBitMask={3}
              shadowCastingBitMask={2}
              transformBehaviors={['billboardY']}
              resources={[
              // require('../models/emoji_smile_diffuse.png'),
              // require('../models/emoji_smile_specular.png'),
              // require('../models/emoji_smile_normal.png')
              require('../models/obj.mtl')
            ]} 
              />
            <ViroQuad
              rotation={[-90, 0, 0]}
              width={.5} height={.5}
              arShadowReceiver={true}
              lightReceivingBitMask={2} />
          </ViroNode>
        </ViroARPlaneSelector>
        {/* <ViroNode position={[0, 0, -1]} dragType="FixedToWorld" onDrag={() => { }} >
          <Viro3DObject
            source={require('./emoji_smile.vrx')}
            position={[0, .1, 0]}
            scale={[.2, .2, .2]}
            type="VRX"
          />
        </ViroNode> */}
      </ViroARScene>
    </View>
  );
};

export default () => {
  return (
    <ViroARSceneNavigator
      autofocus={true}
      initialScene={{
        scene: HelloWorldSceneAR,
      }}
      style={styles.f1}
    />
  );
};

var styles = StyleSheet.create({
  f1: { flex: 1 },
  helloWorldTextStyle: {
    fontFamily: 'Arial',
    fontSize: 30,
    color: '#ffffff',
    textAlignVertical: 'center',
    textAlign: 'center',
  },
});