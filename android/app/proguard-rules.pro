# Add project specific ProGuard rules here.
# You can control the set of applied configuration files using the
# proguardFiles setting in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# If your project uses WebView with JS, uncomment the following
# and specify the fully qualified class name to the JavaScript interface
# class:
#-keepclassmembers class fqcn.of.javascript.interface.for.webview {
#   public *;
#}

# Uncomment this to preserve the line number information for
# debugging stack traces.
#-keepattributes SourceFile,LineNumberTable

# If you keep the line number information, uncomment this to
# hide the original source file name.
#-renamesourcefileattribute SourceFile

# React Native
-keep class com.facebook.react.** { *; }
-keep class com.facebook.hermes.** { *; }
-keep class com.swmansion.reanimated.** { *; }

# Keep native methods
-keepclassmembers class * {
    native <methods>;
}

# Keep React Native modules
-keep class com.facebook.react.bridge.** { *; }
-keep class com.facebook.react.uimanager.** { *; }
-keep class com.facebook.react.views.** { *; }

# Keep React Native Fabric components
-keep class com.facebook.react.fabric.** { *; }

# Keep React Native TurboModules
-keep class com.facebook.react.turbomodule.** { *; }

# Keep React Native JSI
-keep class com.facebook.jni.** { *; }

# Keep React Native Flipper
-keep class com.facebook.flipper.** { *; }

# Keep React Native Vector Icons
-keep class com.oblador.vectoricons.** { *; }

# Keep React Native FS
-keep class com.rnfs.** { *; }

# Keep React Native Vision Camera
-keep class com.mrousavy.camera.** { *; }

# Keep React Native Push Notification
-keep class com.dieam.reactnativepushnotification.** { *; }

# Keep React Native Reanimated
-keep class com.swmansion.reanimated.** { *; }

# Keep React Native Paper
-keep class com.google.android.material.** { *; }

# Keep React Native Permissions
-keep class com.zoontek.rnpermissions.** { *; }

# Keep React Native Toast Message
-keep class com.tapadoo.alerter.** { *; }

# Keep React Native Hole View
-keep class com.bitgoo.holeview.** { *; }

# Keep React Native Loading Spinner
-keep class com.github.douglasjunior.androidsimplelocation.** { *; }

# Keep React Native File Viewer
-keep class com.reactnativefileviewer.** { *; }

# Keep Vision Camera Code Scanner
-keep class com.mrousavy.camera.** { *; }

# Keep RN Responsive Screen
-keep class com.menasoft.rnresponsivescreen.** { *; }

# Optimize for Android 15
-keepattributes *Annotation*
-keepattributes SourceFile,LineNumberTable
-keepattributes Exceptions,InnerClasses

# Remove logging in release
-assumenosideeffects class android.util.Log {
    public static *** d(...);
    public static *** v(...);
}

# Keep JSON classes
-keepclassmembers class * {
    @com.google.gson.annotations.SerializedName <fields>;
}

# Keep Parcelable classes
-keep class * implements android.os.Parcelable {
    public static final android.os.Parcelable$Creator *;
}

# Keep Serializable classes
-keepnames class * implements java.io.Serializable

# Keep native methods
-keepclasseswithmembernames class * {
    native <methods>;
}

# Keep enum classes
-keepclassmembers enum * {
    public static **[] values();
    public static ** valueOf(java.lang.String);
}

# Keep R classes
-keep class **.R$* {
    public static <fields>;
}

# Keep custom application class
-keep class com.pgxappreports.MainApplication { *; }
-keep class com.pgxappreports.MainActivity { *; }
