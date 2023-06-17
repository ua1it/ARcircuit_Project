package com.ieec_application;

import android.os.Bundle;

import com.facebook.react.ReactActivity;

import org.devio.rn.splashscreen.SplashScreen;

public class MainActivity extends ReactActivity {

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */

  @Override
  protected void onCreate(Bundle SavedInstanceState){
    SplashScreen.show(this);
    super.onCreate(SavedInstanceState);
  }
  
  @Override
  protected String getMainComponentName() {
    return "ieec_application";
  }
}
