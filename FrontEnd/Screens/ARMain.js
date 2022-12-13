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

import { ARCircuitScene, opCode, BasicCircuit, AdvancedCircuit } from './ARCircuitScene'

let detectOrBase = 'base';

export default class ARMain extends Component {
  
  constructor(props) {
    super(props);
    this.state = {
      modalVisible: false,
      ARmodalVisible: false,

      code: "void setup(){\n\t\n}\nvoid loop(){\n\t\n}\n",
      loading: true,

      buildPressed: false,
      buildState: false,

      operation: opCode.IDLE,
      target: undefined
    };

    this._getBuilderOpts = this._getBuilderOpts.bind(this);
    this._onSelectItem = this._onSelectItem.bind(this);
    this._getComponentOpts = this._getComponentOpts.bind(this);
    this.resetOperation = this.resetOperation.bind(this);
  }

  _getBuilderOpts() {
    return (
      <Modal
        animationType='slide'
        transparent={true}
        visible={this.state.modalVisible}
        >
        <Pressable style = {styles.centeredView} onPress = {() => this.setState({modalVisible: false})}>
          <View style = {styles.modalView} >
            <TextInput
              multiline
              style = {styles.codeInput}
              selectionColor = 'black'
              onChangeText = {(text) => this.setState({code: text})}
              value = {this.state.code}
            />
            <TouchableOpacity onPress = {()=>{
              this.setState({buildPressed: true});
              setTimeout(()=>{
                this.setState({
                  buildState: true,
                  modalVisible: false
                });
              },2000);
            }}
              style = {{marginBottom:'30%', marginLeft:'60%'}}
            >
              {
                this.state.buildPressed === false ? (
                  <Text style={{fontWeight:'bold'}}>Build Project</Text>
                ) : (
                  buildState === false ? (
                    <ActivityIndicator
                      animating={true}
                      color="#6D7177"
                      size="small"
                    />
                  ) : (
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
    );
  }

  _onSelectItem(item) {
    this.setState({
      operation: opCode.CREATE,
      target: item
    });
  };

  _getComponentOpts() {
    return (
      <Modal
        animationType='slide'
        transparent={true}
        visible={this.state.ARmodalVisible}
        >
        <View style = {styles.centeredView}>
          <View style = {[styles.modalView,{padding:0, alignItems:'flex-start', paddingLeft:'3.5%',paddingTop:'3%',width:'25.5%'}]}>
            <SafeAreaView style = {styles.modelListView}>
              <SectionList
                sections = {[
                  {title: 'BASIC', data: BasicCircuit},
                  {title: 'ADVANCED', data: AdvancedCircuit}
                ]}
                renderItem={
                  ({item}) => <TouchableOpacity  onPress={()=>{ this._onSelectItem(item); this.setState({ARmodalVisible: false}); }}>
                    <Text style={styles.item}>{item}</Text>
                  </TouchableOpacity>
                  }
                renderSectionHeader={({section}) => <Text style={styles.sectionHeader}>{section.title}</Text>}
                keyExtractor={(item, index) => item+index}
              />
            </SafeAreaView>
            
          </View>
          <TouchableOpacity style = {{left:'30%', top:'60%', position:'absolute'}} onPress =  {()=>this.setState({ARmodalVisible: false})}><Text style = {{color: 'white'}}>Close</Text></TouchableOpacity>
        </View>
      </Modal>
    );
  }

  resetOperation() {
    if (this.state.operation != opCode.IDLE) {
      this.setState({
        operation: opCode.IDLE,
        target: undefined
      })
    }
  }

  // side effect
  componentDidMount() {
    setTimeout(() => {
      this.setState({loading: false});
    }, 2000);
  }

  componentDidUpdate() {
    if (this.state.buildPressed || this.state.buildState)
      this.setState({ buildPressed: false, buildState: false });
    
    this.resetOperation();
  }
  
  render() {
    detectOrBase = this.props.route.params.state;
    if (!this.state.loading) {
      let viroAppProps = {
        opcode: this.state.operation,
        source: this.state.target
      };
  
      return (
        <View style={{flex: 1}}>
          {this._getBuilderOpts()}
          {this._getComponentOpts()}
  
          <ViroARSceneNavigator
            autofocus={true}
            viroAppProps={viroAppProps}
            initialScene={{scene: ARCircuitScene,}}
          />
  
          {
            this.props.route.params.state === 'detect' ? (
              <View style={styles.boardFrame}>
                <Text style = {styles.boardTitleText}>Place your board in this area!</Text>
              </View>
            ) : (
              <View></View>
            )
          }
  
          <View style={styles.handFrame}>
            <Text style = {styles.handTitleText}>HandControl here!</Text>
          </View>
  
          <TouchableOpacity style={styles.codeBtn} onPress = {()=>{this.setState({modalVisible: true});}}>
            <Text style = {{position: 'absolute',fontWeight:'500', color: 'white'}}>CODE</Text>
          </TouchableOpacity>
  
          <TouchableOpacity style={styles.ARBtn} onPress = {()=>{this.setState({ARmodalVisible: true});}}>
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