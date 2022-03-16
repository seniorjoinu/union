import {Buffer} from 'buffer';
(window as any).global = window;
window.Buffer = window.Buffer || Buffer;