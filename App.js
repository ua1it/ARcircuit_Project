import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Button, Animated, PanResponder } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import SplashScreen from 'react-native-splash-screen';

//Screens
import ARScreen from './Screens/ARScreen';

const HomeScreen = ({navigation}) => {
  return (
    <View style={styles.screen}>
      <Text>HomeScreen</Text>
      <Button
        title="Go to Details"
        onPress={ () => navigation.navigate('Details')}
      />
    </View>
  )
}

const DetailsScreen = ({navigation}) => {
  const pan = useRef(new Animated.ValueXY()).current;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        pan.setOffset({
          x: pan.x._value,
          y: pan.y._value
        });
      },
      onPanResponderMove: Animated.event(
        [
          null,
          { dx: pan.x, dy: pan.y }
        ],
        {useNativeDriver: false}
      ),
      onPanResponderRelease: () => {
        pan.flattenOffset();
      }
    })
  ).current;

  return (
    <View style={styles.screen}>
      <Text>Details Screen</Text>
      <Button
        title="Go to Details again"
        onPress={ () => navigation.push('Details')}
      />
      <Button 
        title="Go to Home"
        onPress={ () => navigation.navigate('Home')}
      />
      <Button
        title="Go Back"
        onPress={() => navigation.goBack()}
      />
      <Button 
        title="Go back to first screen in stack"
        onPress={() => navigation.popToTop()}
      />
      <Button
        title="Go AR"
        onPress={() => navigation.navigate('ARScreen')}
      />
      <Animated.View
        style={{
          transform: [{ translateX: pan.x }, { translateY: pan.y }]
        }}
        {...panResponder.panHandlers}
      >
        <View style = {styles.box} />
      </Animated.View>
    </View>
  )
}
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
      {/* 네비게이션 기본틀의 스택을 생성 */}
      <Stack.Navigator
        detachInactiveScreens={false}
      >
        {/* 해당스택에 들어갈 화면 요소를 넣어준다. */}
        <Stack.Screen name="Home" component={HomeScreen}/>
        <Stack.Screen name="Details" component={DetailsScreen}/>
        <Stack.Screen name="ARScreen" component={ARScreen} options={{headerShown: false}}/>
      </Stack.Navigator>
    </NavigationContainer>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  box: {
    height: 150,
    width: 150,
    backgroundColor: "blue",
    borderRadius: 5
  }
})

export default App;