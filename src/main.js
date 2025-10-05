import './app.css';
import '@xyflow/svelte/dist/style.css';
import App from './App.svelte';
import { mount } from 'svelte';

const target = document.getElementById('app') || (() => {
  const el = document.createElement('div');
  el.id = 'app';
  document.body.appendChild(el);
  return el;
})();

mount(App, { target });