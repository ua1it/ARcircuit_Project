import React, { Component } from 'react';

import {
	Image,
	StyleSheet,
	Text,
	SafeAreaView,
  ScrollView,
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
  Dimensions
} from 'react-native';

import { ViroARSceneNavigator } from '@viro-community/react-viro';

import CodeEditor, { CodeEditorSyntaxStyles } from '@rivascva/react-native-code-editor';

import Toast from 'react-native-toast-message';

import LoadingScreen from './LoadingScreen';
import { ARCircuitScene, opCode, BasicCircuit, AdvancedCircuit } from './ARCircuitScene';

let detectOrBase = 'base';

export default class ARMain extends Component {
  
  constructor(props) {
    super(props);

    var d = Dimensions.get('screen');

    this.state = {
      modalVisible: false,
      ARmodalVisible: false,
      
      loading: true,

      buildPressed: false,
      buildState: false,

      operation: opCode.IDLE,
      target: undefined,

      styles: (d.height >= d.width) ? styles_pr : styles_ls,

      editor_dest: undefined,
      editor_type: undefined,
      editor_desc: undefined,
      editor_input: undefined,
      editor_callback: undefined
    };

    this._getBuilderOpts = this._getBuilderOpts.bind(this);
    this._onSelectItem = this._onSelectItem.bind(this);
    this._getComponentOpts = this._getComponentOpts.bind(this);
    this._getEditor = this._getEditor.bind(this);
    this.resetOperation = this.resetOperation.bind(this);
    this.callback = this._ARScene_callback.bind(this);

    this.editor_out = null;

    Dimensions.addEventListener('change', ({window: {width, height}}) => {
      var is_portrait = (width <= height);
      this.setState({styles: is_portrait ? styles_pr : styles_ls});
    });
  }

  _getEditor(styles) {
    let editor = null;
    let descriptor = (this.state.editor_desc != undefined) ?
      (<Text style={styles.inputDesc}>{this.state.editor_desc}</Text>)
      : null;
    let message = "";

    switch (this.state.editor_type) {
      case "code":
        editor = (<CodeEditor
            style={styles.codeInput}
            language="c"
            initialValue={this.state.editor_input}
            onChange={(text) => this.editor_out = text}
            syntaxStyle={CodeEditorSyntaxStyles.github}
            showLineNumbers
        />);
        message = "Save & Build";
        break;

      case "number":
        editor = (<TextInput
            style={styles.numberInput}
            value={this.state.editor_input}
            onChangeText={(text) => {
              this.editor_out = text;
              this.setState({editor_input: text});
            }}
            keyboardType="number-pad"
        />);
        message = "Ok";
        break;

        case "readonly":
          editor = (<ScrollView style={styles.readOnly}>
            <Text>{this.state.editor_input}</Text>
          </ScrollView>
          );
          message = "Ok";
        break;
    }

    return {
      comp: editor,
      desc: descriptor,
      msg: message
    };
  }

  _getBuilderOpts() {
    let styles = this.state.styles;

    const closeModal = () => {
      this.setState({modalVisible: false});
    };

    const pressOk = () => {
      let callback = this.state.editor_callback;
      if (callback !== undefined)
        callback(this.editor_out);

      this.setState({buildPressed: true});
      setTimeout(()=>{
        this.setState({
          buildState: true,
          modalVisible: false,

          editor_type: undefined,
          editor_desc: undefined,
          editor_dest: undefined,
          editor_input: undefined,
          editor_callback: undefined
        });
      }, 100);
    };

    const editor = this._getEditor(styles);

    return (
      <Modal
        animationType='slide'
        transparent={true}
        visible={this.state.modalVisible}
        >
        <Pressable style={styles.centeredView} onPress={closeModal}>
          <View style={styles.modalView}>
            {editor.desc}
            {editor.comp}

            <TouchableOpacity
              onPress={pressOk}
              style={{marginTop: '5%', marginBottom:'5%', marginLeft:'60%'}}
            >
              {
                this.state.buildPressed === false ? (
                  <Text style={{fontWeight:'bold'}}>{editor.msg}</Text>
                ) : (
                  this.state.buildState === false ? (
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
    let styles = this.state.styles;

    return (
      <Modal
        animationType='slide'
        transparent={true}
        visible={this.state.ARmodalVisible}
        >
        <View style = {styles.centeredView}>
          <View style = {[styles.modalView, styles.modalBg]}>
            <SafeAreaView style = {styles.modelListView}>
              <SectionList
                sections = {[
                  {title: 'BASIC', data: BasicCircuit},
                  // {title: 'ADVANCED', data: AdvancedCircuit}
                ]}
                renderItem={
                  ({item}) => <TouchableOpacity  onPress={()=>{ this._onSelectItem(item); this.setState({ARmodalVisible: false}); }}>
                    <Text style={styles.item}>{item}</Text>
                  </TouchableOpacity>
                }
                renderSectionHeader={({section}) => <Text style={styles.sectionHeader}>{section.title}</Text>}
                keyExtractor={(item, index) => item + index}
              />
            </SafeAreaView>
            
          </View>
          <TouchableOpacity style = {styles.compClose} onPress =  {()=>this.setState({ARmodalVisible: false})}><Text style = {{color: 'white'}}>Close</Text></TouchableOpacity>
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

  _ARScene_callback(command, data) {
    switch (command) {

      case "editor":
        var code_in = data.input;

        this.editor_out = code_in;
        this.setState({
          modalVisible: true,

          editor_dest: data.name,
          editor_type: data.type,
          editor_desc: data.desc,
          editor_input: code_in,
          editor_callback: data.onFinish
        });
        break;
      
      case "update_editor":
        if (!this.state.modalVisible)
          return;
        
        if (data.editor_type != this.state.editor_type)
          return;
        
        this.setState({
          ...this.state,
          ...data
        });
        break;

      case "toast":
        Toast.show(data);
        break;

    }
  }
  
  render() {
    detectOrBase = this.props.route.params.state;
    if (!this.state.loading) {
      const viroAppProps = {
        opcode: this.state.operation,
        source: this.state.target
      };

      const styles = this.state.styles;

      const remove_handler = () => {
        this.setState({
          operation: opCode.REMOVE,
          target: null
        });
      };
  
      return (
        <View style={{flex: 1}}>
          {this._getBuilderOpts()}
          {this._getComponentOpts()}
  
          {
            detectOrBase === 'detect' ? (
              <View style={styles.boardFrame}>
                <Text style = {styles.boardTitleText}>Place your board in this area!</Text>
              </View>
            ) : (
              <View></View>
            )
          }
  
          <ViroARSceneNavigator
            autofocus={true}
            viroAppProps={viroAppProps}
            initialScene={{scene: ARCircuitScene, passProps: {callback: this.callback}}}
          />
  
          {/* <View style={styles.handFrame} pointerEvents="none">
            <Text style = {styles.handTitleText}>HandControl here!</Text>
          </View> */}

          {/* For toast. don't know why :( */}
          <View style={styles.empty} pointerEvents="none"></View>
          
          <TouchableOpacity style={styles.ARBtn} onPress={()=>{this.setState({ARmodalVisible: true});}}>
            <Text style = {{position: 'absolute',fontWeight:'500', color: 'white'}}>ADD</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.RMBtn} onPress={remove_handler}>
            <Text style = {{position: 'absolute', fontWeight:'500', color: 'white'}}>REMOVE</Text>
          </TouchableOpacity>
          
          <Toast/>
  
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

var styles_ls = StyleSheet.create({
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
  empty: {
    width: '25%',
    height: '90%',
    position: 'absolute',
    borderColor: '#00000000',
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
  ARBtn: {
    position:'absolute',
    justifyContent:'center',
    alignItems:'center',
    left:'2%',
    bottom:'6%',
    width:'10%',
    height:'5%',
    backgroundColor:'transparent',
    borderRadius:20,
    borderColor:'white',
    borderWidth: 1,
  },
  RMBtn: {
    position:'absolute',
    justifyContent:'center',
    alignItems:'center',
    left:'14%',
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
    width:'90%',
    height:'80%',
    margin: 5,
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
  modalBg: {
    padding: 0,
    alignItems: 'flex-start',
    paddingLeft: '3.5%',
    paddingTop: '3%',
    width: '25.5%'
  },
  compClose: {
    left:'30%',
    top:'60%',
    position:'absolute'
  },
  modelListView: {
    flex: 1,
    height: "100%",
  },
  inputDesc: {
    marginBottom:'1%',
    fontWeight:'bold'
  },
  codeInput: {
    width:'100%',
    height:'55%',
    color: 'black',
    fontSize: 12,
    inputLineHeight: 18,
    highlighterLineHeight: 18,
  },
  numberInput: {
    width:'100%',
    height:'55%',
    color: 'black',
    textAlignVertical: 'top',
    fontSize: 32
  },
  readOnly: {
    width:'100%',
    height:'100%',
    padding: 0,
    margin: 5,
    backgroundColor: '#eeeeee',
    color: 'black'
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

var styles_pr = StyleSheet.create({
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
  empty: {
    width: '25%',
    height: '90%',
    position: 'absolute',
    borderColor: '#00000000',
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
  ARBtn: {
    position:'absolute',
    justifyContent:'center',
    alignItems:'center',
    left:'2%',
    bottom:'6%',
    width:'18%',
    height:'4%',
    backgroundColor:'transparent',
    borderRadius:20,
    borderColor:'white',
    borderWidth: 1,
  },
  RMBtn: {
    position:'absolute',
    justifyContent:'center',
    alignItems:'center',
    left:'22%',
    bottom:'6%',
    width:'18%',
    height:'4%',
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
    width:'90%',
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
  modalBg: {
    padding: 0,
    alignItems: 'flex-start',
    paddingLeft: '3.5%',
    paddingTop: '3%',
    width: '40%'
  },
  compClose: {
    left:'50%',
    top:'60%',
    position:'absolute'
  },
  modelListView: {
    flex: 1,
    height: "100%",
  },
  inputDesc: {
    marginBottom:'5%',
    fontWeight:'bold'
  },
  codeInput: {
    width:'100%',
    height:'80%',
    color: 'black',
    fontSize: 12,
    inputLineHeight: 18,
    highlighterLineHeight: 18,
  },
  numberInput: {
    width:'100%',
    height:'80%',
    color: 'black',
    textAlignVertical: 'top',
    textAlign: 'center',
    fontSize: 32
  },
  readOnly: {
    width:'100%',
    height:'100%',
    padding: 0,
    margin: 5,
    backgroundColor: '#eeeeee',
    color: 'black'
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