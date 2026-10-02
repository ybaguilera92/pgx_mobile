import '@angular/compiler';
import './styles.css';
import { mount } from '@ng-native/web';
import { App } from './app/app.component';

function init() {
  const root = document.querySelector('app-root');
  if (root) {
    mount(root, App);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
