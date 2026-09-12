# 16KB Page Alignment Fix for Android 15+ - React Native 0.76.6

## Problem
Google Play now requires apps to support 16KB page size for Android 15+ (API 35+). The error:
```
java.lang.UnsatisfiedLinkError: dlopen failed: library "libreact_featureflagsjni.so" not found
```

This occurs because native libraries (.so files) are not properly aligned for 16KB page size.

## Changes Made

### 1. **package.json** - Updated Dependencies to Match node_modules
- **react-native**: 0.72.7 → **0.76.6**
- **react**: 18.2.0 → **18.3.1**
- **@react-native/gradle-plugin**: 0.72.7 → **0.76.6**
- **react-native-reanimated**: 3.4.0 → **3.16.1**
- **react-native-safe-area-context**: 4.8.2 → **5.1.0**
- **react-native-vision-camera**: 3.4.0 → **4.6.0**
- Added **@react-native/babel-preset**: ^0.76.6
- Updated **@react-native/eslint-config**: ^0.72.2 → **^0.76.6**
- Updated **@react-native/metro-config**: ^0.72.11 → **^0.76.6**
- Removed deprecated **metro-react-native-babel-preset**

### 2. **android/build.gradle** - Updated Build Configuration
- **Android Gradle Plugin**: 8.1.4 → **8.6.1** (compatible with RN 0.76.6)
- **compileSdkVersion**: 36 → **35** (stable Android 15)
- **targetSdkVersion**: 36 → **35**
- **minSdkVersion**: 21 → **23** (required for RN 0.76)
- **NDK**: 25.1.8937393 → **26.3.11579264** (required for 16KB alignment)
- **Kotlin**: 1.9.0 → **1.9.24**
- **buildToolsVersion**: 36.0.0 → **35.0.0**

### 3. **android/gradle/wrapper/gradle-wrapper.properties**
- **Gradle**: 8.1.1 → **8.9** (required for AGP 8.6.1)

### 4. **android/app/build.gradle** - Added 16KB Configuration
- Added `ndk.abiFilters` in `defaultConfig` to explicitly define supported architectures
- Added `packagingOptions.jniLibs.useLegacyPackaging = false` to enforce proper alignment
- Added `pickFirst` rules to resolve native library conflicts
- Fixed release signing to use `signingConfigs.release` instead of `signingConfigs.debug`

### 5. **android/gradle.properties** - Added Native Library Configuration
- Updated **FLIPPER_VERSION**: 0.182.0 → **0.201.0**
- Added `android.bundle.enableUncompressedNativeLibs=false` 
- This ensures native libraries are compressed in the APK, which Android properly aligns on install
- Consolidated duplicate `org.gradle.jvmargs` definitions

### 6. **android/settings.gradle** - Fixed for RN 0.76
- Simplified pluginManagement to use `includeBuild` directly
- Fixed `includeBuild` path to point to correct gradle-plugin location

## How It Works

### 16KB Page Alignment
Android 15+ devices use 16KB memory pages instead of the traditional 4KB. Native libraries must be aligned to this page size to load correctly.

The fix works by:
1. **Using NDK 26+**: Compiles native libraries with proper alignment
2. **Disabling legacy packaging**: Forces modern packaging that respects alignment
3. **Compressing native libs**: When `enableUncompressedNativeLibs=false`, Android extracts and aligns libraries properly during installation
4. **Explicit ABI filters**: Ensures only the correct architectures are packaged

## Build Commands

### Clean Build
```bash
cd android
.\gradlew clean
.\gradlew assembleDebug
```

### Release Build
```bash
cd android
.\gradlew clean
.\gradlew assembleRelease
```

### Using NPM Scripts
```bash
npm run clean
npm run build:debug
npm run build:release
```

## Testing
After building:
1. Install the APK on an Android 15+ device or emulator
2. Verify the app launches without `UnsatisfiedLinkError`
3. Check that all native modules work (camera, file system, etc.)

## Compatibility Notes
- **React Native**: 0.76.6 (updated to match installed node_modules)
- **React**: 18.3.1
- **Android Gradle Plugin**: 8.6.1
- **Gradle**: 8.9
- **NDK**: 26.3.11579264 (required for 16KB support)
- **Kotlin**: 1.9.24
- **Target SDK**: 35 (Android 15)
- **Min SDK**: 23 (Android 6.0)
- **react-native-reanimated**: 3.16.1
- **react-native-vision-camera**: 4.6.0
- **react-native-safe-area-context**: 5.1.0

## Google Play Requirements
Starting August 2025, all apps must support 16KB page alignment for Android 15+ devices. This fix ensures compliance with that requirement.

## Troubleshooting

### If you still get UnsatisfiedLinkError:
1. Clean the build: `.\gradlew clean`
2. Delete `.cxx` folder in `android/app/build/`
3. Rebuild: `.\gradlew assembleDebug`
4. Uninstall the app from device completely before reinstalling

### If build fails:
1. Ensure NDK 26.3.11579264 is installed in Android Studio
2. Check that Gradle 8.1.1 is being used
3. Verify all native dependencies are compatible with RN 0.72.7

## References
- [Android 16KB Page Size Documentation](https://developer.android.com/guide/practices/page-sizes)
- [React Native Android Build Configuration](https://reactnative.dev/docs/build-from-source)
- [NDK Release Notes](https://developer.android.com/ndk/downloads/revision_history)
