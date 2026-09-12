package com.pgxappreports;

import android.app.Application;
import android.content.Context;
import com.facebook.react.PackageList;
import com.facebook.react.ReactApplication;
import com.facebook.react.ReactInstanceManager;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.soloader.OpenSourceMergedSoMapping;
import com.facebook.soloader.SoLoader;
import java.lang.reflect.InvocationTargetException;
import java.util.List;

// Importaciones de paquetes nativos
import com.rnfs.RNFSPackage;
import com.swmansion.reanimated.ReanimatedPackage;
import com.th3rdwave.safeareacontext.SafeAreaContextPackage;
import com.oblador.vectoricons.VectorIconsPackage;
import com.dieam.reactnativepushnotification.ReactNativePushNotificationPackage;
import com.zoontek.rnpermissions.RNPermissionsPackage;
import com.mrousavy.camera.react.CameraPackage;
import com.ibitcy.react_native_hole_view.RNHoleViewPackage;
import com.vinzscam.reactnativefileviewer.RNFileViewerPackage;
import com.reactlibrary.RCTQRCodeLocalImagePackage;

public class MainApplication extends Application implements ReactApplication {

  private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
    @Override
    public boolean getUseDeveloperSupport() {
      return BuildConfig.DEBUG;
    }

    @Override
    protected List<ReactPackage> getPackages() {
      @SuppressWarnings("UnnecessaryLocalVariable")
      List<ReactPackage> packages = new PackageList(this).getPackages();
      // Packages that cannot be autolinked yet can be added manually here, for
      // example:
      // packages.add(new MyReactNativePackage());
      
      // Agregar paquetes nativos manualmente
      // packages.add(new RNFSPackage());
      // packages.add(new ReanimatedPackage());
      // packages.add(new SafeAreaContextPackage());
      // packages.add(new VectorIconsPackage());
      // packages.add(new ReactNativePushNotificationPackage());
      // packages.add(new RNPermissionsPackage());
      // packages.add(new CameraPackage());
      // packages.add(new RNHoleViewPackage());
      // packages.add(new RNFileViewerPackage());
      // packages.add(new RCTQRCodeLocalImagePackage());
      
      return packages;
    }

    @Override
    protected String getJSMainModuleName() {
      return "index";
    }
  };

  @Override
  public ReactNativeHost getReactNativeHost() {
    return mReactNativeHost;
  }

  @Override
  public void onCreate() {
    super.onCreate();
    
    // RN 0.76+ uses merged native libraries; this mapping resolves logical .so names correctly.
    try {
      SoLoader.init(this, OpenSourceMergedSoMapping.INSTANCE);
    } catch (java.io.IOException e) {
      throw new RuntimeException("Failed to initialize SoLoader", e);
    }
    
    initializeFlipper(this, getReactNativeHost().getReactInstanceManager());
  }

  /**
   * Loads Flipper in React Native templates. Call this in the onCreate method
   * with something like
   * initializeFlipper(this, getReactNativeHost().getReactInstanceManager());
   *
   * @param context
   * @param reactInstanceManager
   */
  private static void initializeFlipper(
      Context context, ReactInstanceManager reactInstanceManager) {
    if (BuildConfig.DEBUG) {
      try {
        /*
         * We use reflection here to pick up the class that initializes Flipper,
         * since Flipper library is not available in release mode
         */
        Class<?> aClass = Class.forName("com.pgxappreports.ReactNativeFlipper");
        aClass
            .getMethod("initializeFlipper", Context.class, ReactInstanceManager.class)
            .invoke(null, context, reactInstanceManager);
      } catch (ClassNotFoundException e) {
        e.printStackTrace();
      } catch (NoSuchMethodException e) {
        e.printStackTrace();
      } catch (IllegalAccessException e) {
        e.printStackTrace();
      } catch (InvocationTargetException e) {
        e.printStackTrace();
      }
    }
  }
}
