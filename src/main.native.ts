import 'expo';
import { AppRegistry, Image, Platform, processColor } from 'react-native';
import { mount } from '@ng-native/platform';
import { currentConditions, deviceTokens, watchConditions } from '@ng-native/device';
import { getFabricUIManager, registerPlatformComponents } from '@ng-native/fabric';
import { App } from './app/app.component';

registerPlatformComponents(Platform.OS);
AppRegistry.registerRunnable('main', ({ rootTag }: { rootTag: number | string }) => {
  const app = mount(Number(rootTag), App, getFabricUIManager(), {
    processColor,
    conditions: currentConditions(),
    tokens: deviceTokens(),
    resolveAssetSource: (value) => Image.resolveAssetSource(value as never),
  });
  watchConditions(app.engine);
});
