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
	ActivityIndicator,
  Modal,
  Pressable,
  TextInput,
  SectionList,
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

import LoadingScreen from './LoadingScreen';

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
  
  const [modalVisible, setModalVisible] = useState(false);
  const [ARmodalVisible, setARModalVisible] = useState(false);
  const [code, setCode] = useState("void setup(){\n\t\n}\n" + "void loop(){\n\t\n}\n");
  const [loading, setLoading] = useState(true);
  const [buildPressed, setBuildPressed] = useState(false);
  const [buildState, setBuildState] = useState(false);

  useEffect(()=>{
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  },[])

  useEffect(()=>{
    setBuildPressed(false);
    setBuildState(false);
  },[modalVisible])

  detectOrBase = route.params.state;
  if (!loading){
    return (
      <View style={{flex: 1}}>
        <Modal
          animationType='slide'
          transparent={true}
          visible={modalVisible}
        >
          <Pressable style = {styles.centeredView} onPress = {() => setModalVisible(false)}>
            <View style = {styles.modalView} >
              <TextInput
                multiline
                style = {styles.codeInput}
                selectionColor = 'black'
                onChangeText = {setCode}
                value = {code}
              />
              <TouchableOpacity onPress = {()=>{
                setBuildPressed(true);
                setTimeout(()=>{
                  setBuildState(true);
                  setModalVisible(false);
                },2000);
              }}
                style = {{marginBottom:'30%', marginLeft:'60%'}}
              >
                {
                  buildPressed === false ? (
                    <Text style = {{fontWeight:'bold'}}>Build Project</Text>
                  ):(
                    buildState === false ? (
                      <ActivityIndicator
                        animating={true}
                        color="#6D7177"
                        size="small"
                      />
                    ):(
                      <ActivityIndicator
                        animating={true}
                        color="#6D7177"
                        size="small"
                      />
                    )
                  )
                }
              </TouchableOpacity>
            </View>
          </Pressable>
        </Modal>
        <Modal
          animationType='slide'
          transparent={true}
          visible={ARmodalVisible}
        >
          <View style = {styles.centeredView}>
            <View style = {[styles.modalView,{padding:0, alignItems:'flex-start', paddingLeft:'3.5%',paddingTop:'3%',width:'25.5%'}]}>
              <SafeAreaView style = {styles.modelListView}>
                <SectionList
                  sections = {[
                    {title: 'basic', data: ['electric wire', 'led', 'register', 'button', 'buzzer', 'potentiometer', 'photoresistor',
                    'hc-sr04']},
                    {title: 'more', data: ['hdx-2801', '7 segement led', 'dot matrix display', '74hc595', 'flame sensor', 
                    'hc-sr505', 'rgb led module', 'voice sensor', 'sg-90 servo', '16x2 lcd', 'ky-0009 smd rgb led']},
                  ]}
                  renderItem={({item}) => <TouchableOpacity 
                    onPress={()=>{
                      console.log(item)
                      setARModalVisible(false)
                  }}>
                      <Text style={styles.item}>{item}</Text>
                    </TouchableOpacity>}
                  renderSectionHeader={({section}) => <Text style={styles.sectionHeader}>{section.title}</Text>}
                  keyExtractor={(item, index) => item+index}
                />
              </SafeAreaView>
              
            </View>
            <TouchableOpacity style = {{left:'30%', top:'60%', position:'absolute'}} onPress =  {()=>setARModalVisible(false)}><Text style = {{color: 'white'}}>Close</Text></TouchableOpacity>
          </View>
        </Modal>
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
        <TouchableOpacity style={styles.codeBtn} onPress = {()=>{
          setModalVisible(true);
        }}>
          <Text style = {{position: 'absolute',fontWeight:'500', color: 'white'}}>CODE</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.ARBtn} onPress = {()=>{
          setARModalVisible(true);
        }}>
          <Text style = {{position: 'absolute',fontWeight:'500', color: 'white'}}>MODELS</Text>
        </TouchableOpacity>          
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
  } else {
    return LoadingScreen();
  }
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
	},
  codeBtn: {
    position:'absolute',
    justifyContent:'center',
    alignItems:'center',
    left:'2%',
    bottom:'6%',
    width:'7%',
    height:'5%',
    backgroundColor:'transparent',
    borderRadius:20,
    borderColor:'white',
    borderWidth: 1,
  },
  ARBtn: {
    position:'absolute',
    justifyContent:'center',
    alignItems:'center',
    left:'9.7%',
    bottom:'6%',
    width:'10%',
    height:'5%',
    backgroundColor:'transparent',
    borderRadius:20,
    borderColor:'white',
    borderWidth: 1,
  },
  centeredView: {
    flex: 1,
    marginTop: 22,
  },
  modalView: {
    width:'50%',
    height:'60%',
    margin: 20,
    backgroundColor: "white",
    position: "absolute",
    borderRadius: 20,
    padding: 25,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  modelListView: {
    flex: 1,
    height: "100%",
  },
  codeInput: {
    width:'100%',
    height:'90%',
    color:'black',
  },
  item: {
    padding: 10,
    fontSize: 13,
    height: 44,
  },
  sectionHeader: {
    paddingTop: 2,
    paddingLeft: 10,
    paddingRight: 10,
    paddingBottom: 2,
    fontSize: 14,
    fontWeight: 'bold',
    backgroundColor: 'rgba(247,247,247,1.0)',
  },

});