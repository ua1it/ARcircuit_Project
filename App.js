import React, { useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button, TouchableOpacity, Animated, StatusBar, PanResponder, ImageBackground, Modal, Pressable } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import SplashScreen from 'react-native-splash-screen';

//Storage for other Screen
// import AsyncStorage from '@react-native-async-storage/async-storage';

//Screens
import ARScreen from './Screens/ARScreen';

const HomeScreen = ({navigation}) => {
  const [modalVisible, setModalVisible] = useState(false);
  return (
    <View style={styles.screen}>
      <Modal
        animationType='slide'
        transparent={true}
        visible={modalVisible}
      >
        <Pressable style = {styles.centeredView} onPress = {() => setModalVisible(false)}>
          <View style = {styles.modalView} >
            <Text style = {{fontWeight: 'bold', fontSize: 18}}>Choose Your State</Text>
            <View style = {{flexDirection: 'row', justifyContent:'space-between'}}>
              <TouchableOpacity style = {styles.modalButton} onPress = {()=>{
                setModalVisible(!modalVisible);
                navigation.navigate('ARScreen');
              }}><Text style = {{fontWeight: 'bold'}}>Detect</Text></TouchableOpacity>
              <Text>{'   '}</Text>
              <TouchableOpacity style = {styles.modalButton} onPress = {()=>{
                setModalVisible(!modalVisible);
                navigation.navigate('ARScreen');
              }}><Text style = {{fontWeight: 'bold'}}>Base</Text></TouchableOpacity>
            </View>
            <View style = {{marginTop:'18%'}}>
              <Text style = {{color:'black',fontSize:12}}>
                <Text style={{fontWeight:'bold'}}>Detect</Text>: Detect a real circuit to convert it into an AR models.{"\n"}
                <Text style={{fontWeight:'bold'}}>Base</Text>: Play IEEC with AR model from the beginning.
              </Text>
            </View>
          </View>
        </Pressable>
      </Modal>
      <ImageBackground source={require("./images/homeImage.jpg")} resizeMode="cover" style={styles.image}>
        <View style = {styles.titleView}>
          <Text style = {styles.title}>
            Immersive{"\n"}
            Education for{"\n"}
            Electronic{"\n"}
            Circuit{"\n"}
          </Text>
        </View>
        <TouchableOpacity style = {styles.goButton} onPress = {() => setModalVisible(true)}>
          <Text style = {styles.go}>GO</Text>
        </TouchableOpacity>
        <View style = {styles.explainView}>
          <Text style = {styles.explainTitle}>
            Gachon Univ. Graduation Project{"\n"}
            Team 6 of the 3rd Class
          </Text>
          <Text style = {styles.explainContent}>
            Use Augmented Reality{"\n"}
            to safe and realistic work{"\n"}
            on the user's electrical circuit{"\n"}
          </Text>
        </View>
      </ImageBackground>
    </View>
  )
}

// const DetailsScreen = ({navigation}) => {
//   const pan = useRef(new Animated.ValueXY()).current;

//   const panResponder = useRef(
//     PanResponder.create({
//       onMoveShouldSetPanResponder: () => true,
//       onPanResponderGrant: () => {
//         pan.setOffset({
//           x: pan.x._value,
//           y: pan.y._value
//         });
//       },
//       onPanResponderMove: Animated.event(
//         [
//           null,
//           { dx: pan.x, dy: pan.y }
//         ],
//         {useNativeDriver: false}
//       ),
//       onPanResponderRelease: () => {
//         pan.flattenOffset();
//       }
//     })
//   ).current;

//   return (
//     <View style={styles.screen}>
//       <Text>Details Screen</Text>
//       <Button
//         title="Go to Details again"
//         onPress={ () => navigation.push('Details')}
//       />
//       <Button 
//         title="Go to Home"
//         onPress={ () => navigation.navigate('Home')}
//       />
//       <Button
//         title="Go Back"
//         onPress={() => navigation.goBack()}
//       />
//       <Button 
//         title="Go back to first screen in stack"
//         onPress={() => navigation.popToTop()}
//       />
//       <Button
//         title="Go AR"
//         onPress={() => navigation.navigate('ARScreen')}
//       />
//       <Animated.View
//         style={{
//           transform: [{ translateX: pan.x }, { translateY: pan.y }]
//         }}
//         {...panResponder.panHandlers}
//       >
//         <View style = {styles.box} />
//       </Animated.View>
//     </View>
//   )
// }

// 앱이 각 화면이 전환될 수 있는 기본 틀을 제공한다.
const Stack = createStackNavigator();

const App = () => {
  useEffect(()=>{
    try{
      setTimeout(()=>{
        SplashScreen.hide();
      }, 2000);
    } catch(e){
      console.log(e.message);
    }
  });
  
  return (
    //네비게이션의 트리를 관리해주는 컴포넌트
    <NavigationContainer>
      <StatusBar translucent backgroundColor={"transparent"}/>
      {/* 네비게이션 기본틀의 스택을 생성 */}
      <Stack.Navigator
        detachInactiveScreens={false}
      >
        {/* 해당스택에 들어갈 화면 요소를 넣어준다. */}
        <Stack.Screen name="Home" component={HomeScreen} options={{headerShown: false}}/>
        {/* <Stack.Screen name="Details" component={DetailsScreen}/> */}
        <Stack.Screen name="ARScreen" component={ARScreen} options={{headerShown: false}}/>
      </Stack.Navigator>
    </NavigationContainer>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  image: {
    flex: 1,
  },
  box: {
    height: 150,
    width: 150,
    backgroundColor: "blue",
    borderRadius: 5
  },
  titleView : {
    marginTop:'15%',
    marginLeft:'5%',
  },
  title: {
    color: 'black',
    fontSize: 40,
    fontWeight: 'bold',
  },
  goButton: {
    width: '17%',
    height: '9%',
    left: '56%',
    top: '20%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderColor : 'yellow',
    borderWidth: 2,
    borderRadius: 100,
  },
  go: {
    color: 'yellow',
    fontSize : 20,
    fontWeight: 'bold',
    elevation: 30,
  },
  explainView: {
    marginLeft: '5%',
    marginTop: '65%',
  },
  explainTitle: {
    color : 'black',
    fontSize: 15,
    fontWeight: 'bold'
  },
  explainContent: {
    color : 'black',
    fontSize: 13,
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    position: 'absolute',
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
  modalButton: {
    marginTop: '10%',
    marginBottom: '-5%',
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 10,
    elevation: 3,
    justifyContent: 'center',
    alignItems: 'center'
  }
})

export default App;