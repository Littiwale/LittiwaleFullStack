(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))r(i);new MutationObserver(i=>{for(const s of i)if(s.type==="childList")for(const a of s.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&r(a)}).observe(document,{childList:!0,subtree:!0});function t(i){const s={};return i.integrity&&(s.integrity=i.integrity),i.referrerPolicy&&(s.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?s.credentials="include":i.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function r(i){if(i.ep)return;i.ep=!0;const s=t(i);fetch(i.href,s)}})();var gc={};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Gu=function(n){const e=[];let t=0;for(let r=0;r<n.length;r++){let i=n.charCodeAt(r);i<128?e[t++]=i:i<2048?(e[t++]=i>>6|192,e[t++]=i&63|128):(i&64512)===55296&&r+1<n.length&&(n.charCodeAt(r+1)&64512)===56320?(i=65536+((i&1023)<<10)+(n.charCodeAt(++r)&1023),e[t++]=i>>18|240,e[t++]=i>>12&63|128,e[t++]=i>>6&63|128,e[t++]=i&63|128):(e[t++]=i>>12|224,e[t++]=i>>6&63|128,e[t++]=i&63|128)}return e},Cf=function(n){const e=[];let t=0,r=0;for(;t<n.length;){const i=n[t++];if(i<128)e[r++]=String.fromCharCode(i);else if(i>191&&i<224){const s=n[t++];e[r++]=String.fromCharCode((i&31)<<6|s&63)}else if(i>239&&i<365){const s=n[t++],a=n[t++],u=n[t++],l=((i&7)<<18|(s&63)<<12|(a&63)<<6|u&63)-65536;e[r++]=String.fromCharCode(55296+(l>>10)),e[r++]=String.fromCharCode(56320+(l&1023))}else{const s=n[t++],a=n[t++];e[r++]=String.fromCharCode((i&15)<<12|(s&63)<<6|a&63)}}return e.join("")},Qu={byteToCharMap_:null,charToByteMap_:null,byteToCharMapWebSafe_:null,charToByteMapWebSafe_:null,ENCODED_VALS_BASE:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",get ENCODED_VALS(){return this.ENCODED_VALS_BASE+"+/="},get ENCODED_VALS_WEBSAFE(){return this.ENCODED_VALS_BASE+"-_."},HAS_NATIVE_SUPPORT:typeof atob=="function",encodeByteArray(n,e){if(!Array.isArray(n))throw Error("encodeByteArray takes an array as a parameter");this.init_();const t=e?this.byteToCharMapWebSafe_:this.byteToCharMap_,r=[];for(let i=0;i<n.length;i+=3){const s=n[i],a=i+1<n.length,u=a?n[i+1]:0,l=i+2<n.length,d=l?n[i+2]:0,p=s>>2,v=(s&3)<<4|u>>4;let A=(u&15)<<2|d>>6,S=d&63;l||(S=64,a||(A=64)),r.push(t[p],t[v],t[A],t[S])}return r.join("")},encodeString(n,e){return this.HAS_NATIVE_SUPPORT&&!e?btoa(n):this.encodeByteArray(Gu(n),e)},decodeString(n,e){return this.HAS_NATIVE_SUPPORT&&!e?atob(n):Cf(this.decodeStringToByteArray(n,e))},decodeStringToByteArray(n,e){this.init_();const t=e?this.charToByteMapWebSafe_:this.charToByteMap_,r=[];for(let i=0;i<n.length;){const s=t[n.charAt(i++)],u=i<n.length?t[n.charAt(i)]:0;++i;const d=i<n.length?t[n.charAt(i)]:64;++i;const v=i<n.length?t[n.charAt(i)]:64;if(++i,s==null||u==null||d==null||v==null)throw new kf;const A=s<<2|u>>4;if(r.push(A),d!==64){const S=u<<4&240|d>>2;if(r.push(S),v!==64){const k=d<<6&192|v;r.push(k)}}}return r},init_(){if(!this.byteToCharMap_){this.byteToCharMap_={},this.charToByteMap_={},this.byteToCharMapWebSafe_={},this.charToByteMapWebSafe_={};for(let n=0;n<this.ENCODED_VALS.length;n++)this.byteToCharMap_[n]=this.ENCODED_VALS.charAt(n),this.charToByteMap_[this.byteToCharMap_[n]]=n,this.byteToCharMapWebSafe_[n]=this.ENCODED_VALS_WEBSAFE.charAt(n),this.charToByteMapWebSafe_[this.byteToCharMapWebSafe_[n]]=n,n>=this.ENCODED_VALS_BASE.length&&(this.charToByteMap_[this.ENCODED_VALS_WEBSAFE.charAt(n)]=n,this.charToByteMapWebSafe_[this.ENCODED_VALS.charAt(n)]=n)}}};class kf extends Error{constructor(){super(...arguments),this.name="DecodeBase64StringError"}}const Nf=function(n){const e=Gu(n);return Qu.encodeByteArray(e,!0)},ti=function(n){return Nf(n).replace(/\./g,"")},Ju=function(n){try{return Qu.decodeString(n,!0)}catch(e){console.error("base64Decode failed: ",e)}return null};/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Df(){if(typeof self<"u")return self;if(typeof window<"u")return window;if(typeof global<"u")return global;throw new Error("Unable to locate global object.")}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Vf=()=>Df().__FIREBASE_DEFAULTS__,Of=()=>{if(typeof process>"u"||typeof gc>"u")return;const n=gc.__FIREBASE_DEFAULTS__;if(n)return JSON.parse(n)},Lf=()=>{if(typeof document>"u")return;let n;try{n=document.cookie.match(/__FIREBASE_DEFAULTS__=([^;]+)/)}catch{return}const e=n&&Ju(n[1]);return e&&JSON.parse(e)},yi=()=>{try{return Vf()||Of()||Lf()}catch(n){console.info(`Unable to get __FIREBASE_DEFAULTS__ due to: ${n}`);return}},Yu=n=>{var e,t;return(t=(e=yi())===null||e===void 0?void 0:e.emulatorHosts)===null||t===void 0?void 0:t[n]},Xu=n=>{const e=Yu(n);if(!e)return;const t=e.lastIndexOf(":");if(t<=0||t+1===e.length)throw new Error(`Invalid host ${e} with no separate hostname and port!`);const r=parseInt(e.substring(t+1),10);return e[0]==="["?[e.substring(1,t-1),r]:[e.substring(0,t),r]},Zu=()=>{var n;return(n=yi())===null||n===void 0?void 0:n.config},el=n=>{var e;return(e=yi())===null||e===void 0?void 0:e[`_${n}`]};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Mf{constructor(){this.reject=()=>{},this.resolve=()=>{},this.promise=new Promise((e,t)=>{this.resolve=e,this.reject=t})}wrapCallback(e){return(t,r)=>{t?this.reject(t):this.resolve(r),typeof e=="function"&&(this.promise.catch(()=>{}),e.length===1?e(t):e(t,r))}}}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function xf(n,e){if(n.uid)throw new Error('The "uid" field is no longer supported by mockUserToken. Please use "sub" instead for Firebase Auth User ID.');const t={alg:"none",type:"JWT"},r=e||"demo-project",i=n.iat||0,s=n.sub||n.user_id;if(!s)throw new Error("mockUserToken must contain 'sub' or 'user_id' field!");const a=Object.assign({iss:`https://securetoken.google.com/${r}`,aud:r,iat:i,exp:i+3600,auth_time:i,sub:s,user_id:s,firebase:{sign_in_provider:"custom",identities:{}}},n);return[ti(JSON.stringify(t)),ti(JSON.stringify(a)),""].join(".")}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Te(){return typeof navigator<"u"&&typeof navigator.userAgent=="string"?navigator.userAgent:""}function Ff(){return typeof window<"u"&&!!(window.cordova||window.phonegap||window.PhoneGap)&&/ios|iphone|ipod|ipad|android|blackberry|iemobile/i.test(Te())}function Uf(){var n;const e=(n=yi())===null||n===void 0?void 0:n.forceEnvironment;if(e==="node")return!0;if(e==="browser")return!1;try{return Object.prototype.toString.call(global.process)==="[object process]"}catch{return!1}}function Bf(){return typeof navigator<"u"&&navigator.userAgent==="Cloudflare-Workers"}function qf(){const n=typeof chrome=="object"?chrome.runtime:typeof browser=="object"?browser.runtime:void 0;return typeof n=="object"&&n.id!==void 0}function $f(){return typeof navigator=="object"&&navigator.product==="ReactNative"}function jf(){const n=Te();return n.indexOf("MSIE ")>=0||n.indexOf("Trident/")>=0}function zf(){return!Uf()&&!!navigator.userAgent&&navigator.userAgent.includes("Safari")&&!navigator.userAgent.includes("Chrome")}function tl(){try{return typeof indexedDB=="object"}catch{return!1}}function nl(){return new Promise((n,e)=>{try{let t=!0;const r="validate-browser-context-for-indexeddb-analytics-module",i=self.indexedDB.open(r);i.onsuccess=()=>{i.result.close(),t||self.indexedDB.deleteDatabase(r),n(!0)},i.onupgradeneeded=()=>{t=!1},i.onerror=()=>{var s;e(((s=i.error)===null||s===void 0?void 0:s.message)||"")}}catch(t){e(t)}})}function Hf(){return!(typeof navigator>"u"||!navigator.cookieEnabled)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Kf="FirebaseError";class Le extends Error{constructor(e,t,r){super(t),this.code=e,this.customData=r,this.name=Kf,Object.setPrototypeOf(this,Le.prototype),Error.captureStackTrace&&Error.captureStackTrace(this,Ft.prototype.create)}}class Ft{constructor(e,t,r){this.service=e,this.serviceName=t,this.errors=r}create(e,...t){const r=t[0]||{},i=`${this.service}/${e}`,s=this.errors[e],a=s?Wf(s,r):"Error",u=`${this.serviceName}: ${a} (${i}).`;return new Le(i,u,r)}}function Wf(n,e){return n.replace(Gf,(t,r)=>{const i=e[r];return i!=null?String(i):`<${r}?>`})}const Gf=/\{\$([^}]+)}/g;function Qf(n){for(const e in n)if(Object.prototype.hasOwnProperty.call(n,e))return!1;return!0}function ni(n,e){if(n===e)return!0;const t=Object.keys(n),r=Object.keys(e);for(const i of t){if(!r.includes(i))return!1;const s=n[i],a=e[i];if(mc(s)&&mc(a)){if(!ni(s,a))return!1}else if(s!==a)return!1}for(const i of r)if(!t.includes(i))return!1;return!0}function mc(n){return n!==null&&typeof n=="object"}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ar(n){const e=[];for(const[t,r]of Object.entries(n))Array.isArray(r)?r.forEach(i=>{e.push(encodeURIComponent(t)+"="+encodeURIComponent(i))}):e.push(encodeURIComponent(t)+"="+encodeURIComponent(r));return e.length?"&"+e.join("&"):""}function Jf(n,e){const t=new Yf(n,e);return t.subscribe.bind(t)}class Yf{constructor(e,t){this.observers=[],this.unsubscribes=[],this.observerCount=0,this.task=Promise.resolve(),this.finalized=!1,this.onNoObservers=t,this.task.then(()=>{e(this)}).catch(r=>{this.error(r)})}next(e){this.forEachObserver(t=>{t.next(e)})}error(e){this.forEachObserver(t=>{t.error(e)}),this.close(e)}complete(){this.forEachObserver(e=>{e.complete()}),this.close()}subscribe(e,t,r){let i;if(e===void 0&&t===void 0&&r===void 0)throw new Error("Missing Observer.");Xf(e,["next","error","complete"])?i=e:i={next:e,error:t,complete:r},i.next===void 0&&(i.next=ms),i.error===void 0&&(i.error=ms),i.complete===void 0&&(i.complete=ms);const s=this.unsubscribeOne.bind(this,this.observers.length);return this.finalized&&this.task.then(()=>{try{this.finalError?i.error(this.finalError):i.complete()}catch{}}),this.observers.push(i),s}unsubscribeOne(e){this.observers===void 0||this.observers[e]===void 0||(delete this.observers[e],this.observerCount-=1,this.observerCount===0&&this.onNoObservers!==void 0&&this.onNoObservers(this))}forEachObserver(e){if(!this.finalized)for(let t=0;t<this.observers.length;t++)this.sendOne(t,e)}sendOne(e,t){this.task.then(()=>{if(this.observers!==void 0&&this.observers[e]!==void 0)try{t(this.observers[e])}catch(r){typeof console<"u"&&console.error&&console.error(r)}})}close(e){this.finalized||(this.finalized=!0,e!==void 0&&(this.finalError=e),this.task.then(()=>{this.observers=void 0,this.onNoObservers=void 0}))}}function Xf(n,e){if(typeof n!="object"||n===null)return!1;for(const t of e)if(t in n&&typeof n[t]=="function")return!0;return!1}function ms(){}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function re(n){return n&&n._delegate?n._delegate:n}class Ne{constructor(e,t,r){this.name=e,this.instanceFactory=t,this.type=r,this.multipleInstances=!1,this.serviceProps={},this.instantiationMode="LAZY",this.onInstanceCreated=null}setInstantiationMode(e){return this.instantiationMode=e,this}setMultipleInstances(e){return this.multipleInstances=e,this}setServiceProps(e){return this.serviceProps=e,this}setInstanceCreatedCallback(e){return this.onInstanceCreated=e,this}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const St="[DEFAULT]";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Zf{constructor(e,t){this.name=e,this.container=t,this.component=null,this.instances=new Map,this.instancesDeferred=new Map,this.instancesOptions=new Map,this.onInitCallbacks=new Map}get(e){const t=this.normalizeInstanceIdentifier(e);if(!this.instancesDeferred.has(t)){const r=new Mf;if(this.instancesDeferred.set(t,r),this.isInitialized(t)||this.shouldAutoInitialize())try{const i=this.getOrInitializeService({instanceIdentifier:t});i&&r.resolve(i)}catch{}}return this.instancesDeferred.get(t).promise}getImmediate(e){var t;const r=this.normalizeInstanceIdentifier(e==null?void 0:e.identifier),i=(t=e==null?void 0:e.optional)!==null&&t!==void 0?t:!1;if(this.isInitialized(r)||this.shouldAutoInitialize())try{return this.getOrInitializeService({instanceIdentifier:r})}catch(s){if(i)return null;throw s}else{if(i)return null;throw Error(`Service ${this.name} is not available`)}}getComponent(){return this.component}setComponent(e){if(e.name!==this.name)throw Error(`Mismatching Component ${e.name} for Provider ${this.name}.`);if(this.component)throw Error(`Component for ${this.name} has already been provided`);if(this.component=e,!!this.shouldAutoInitialize()){if(tp(e))try{this.getOrInitializeService({instanceIdentifier:St})}catch{}for(const[t,r]of this.instancesDeferred.entries()){const i=this.normalizeInstanceIdentifier(t);try{const s=this.getOrInitializeService({instanceIdentifier:i});r.resolve(s)}catch{}}}}clearInstance(e=St){this.instancesDeferred.delete(e),this.instancesOptions.delete(e),this.instances.delete(e)}async delete(){const e=Array.from(this.instances.values());await Promise.all([...e.filter(t=>"INTERNAL"in t).map(t=>t.INTERNAL.delete()),...e.filter(t=>"_delete"in t).map(t=>t._delete())])}isComponentSet(){return this.component!=null}isInitialized(e=St){return this.instances.has(e)}getOptions(e=St){return this.instancesOptions.get(e)||{}}initialize(e={}){const{options:t={}}=e,r=this.normalizeInstanceIdentifier(e.instanceIdentifier);if(this.isInitialized(r))throw Error(`${this.name}(${r}) has already been initialized`);if(!this.isComponentSet())throw Error(`Component ${this.name} has not been registered yet`);const i=this.getOrInitializeService({instanceIdentifier:r,options:t});for(const[s,a]of this.instancesDeferred.entries()){const u=this.normalizeInstanceIdentifier(s);r===u&&a.resolve(i)}return i}onInit(e,t){var r;const i=this.normalizeInstanceIdentifier(t),s=(r=this.onInitCallbacks.get(i))!==null&&r!==void 0?r:new Set;s.add(e),this.onInitCallbacks.set(i,s);const a=this.instances.get(i);return a&&e(a,i),()=>{s.delete(e)}}invokeOnInitCallbacks(e,t){const r=this.onInitCallbacks.get(t);if(r)for(const i of r)try{i(e,t)}catch{}}getOrInitializeService({instanceIdentifier:e,options:t={}}){let r=this.instances.get(e);if(!r&&this.component&&(r=this.component.instanceFactory(this.container,{instanceIdentifier:ep(e),options:t}),this.instances.set(e,r),this.instancesOptions.set(e,t),this.invokeOnInitCallbacks(r,e),this.component.onInstanceCreated))try{this.component.onInstanceCreated(this.container,e,r)}catch{}return r||null}normalizeInstanceIdentifier(e=St){return this.component?this.component.multipleInstances?e:St:e}shouldAutoInitialize(){return!!this.component&&this.component.instantiationMode!=="EXPLICIT"}}function ep(n){return n===St?void 0:n}function tp(n){return n.instantiationMode==="EAGER"}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class np{constructor(e){this.name=e,this.providers=new Map}addComponent(e){const t=this.getProvider(e.name);if(t.isComponentSet())throw new Error(`Component ${e.name} has already been registered with ${this.name}`);t.setComponent(e)}addOrOverwriteComponent(e){this.getProvider(e.name).isComponentSet()&&this.providers.delete(e.name),this.addComponent(e)}getProvider(e){if(this.providers.has(e))return this.providers.get(e);const t=new Zf(e,this);return this.providers.set(e,t),t}getProviders(){return Array.from(this.providers.values())}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */var q;(function(n){n[n.DEBUG=0]="DEBUG",n[n.VERBOSE=1]="VERBOSE",n[n.INFO=2]="INFO",n[n.WARN=3]="WARN",n[n.ERROR=4]="ERROR",n[n.SILENT=5]="SILENT"})(q||(q={}));const rp={debug:q.DEBUG,verbose:q.VERBOSE,info:q.INFO,warn:q.WARN,error:q.ERROR,silent:q.SILENT},ip=q.INFO,sp={[q.DEBUG]:"log",[q.VERBOSE]:"log",[q.INFO]:"info",[q.WARN]:"warn",[q.ERROR]:"error"},op=(n,e,...t)=>{if(e<n.logLevel)return;const r=new Date().toISOString(),i=sp[e];if(i)console[i](`[${r}]  ${n.name}:`,...t);else throw new Error(`Attempted to log a message with an invalid logType (value: ${e})`)};class po{constructor(e){this.name=e,this._logLevel=ip,this._logHandler=op,this._userLogHandler=null}get logLevel(){return this._logLevel}set logLevel(e){if(!(e in q))throw new TypeError(`Invalid value "${e}" assigned to \`logLevel\``);this._logLevel=e}setLogLevel(e){this._logLevel=typeof e=="string"?rp[e]:e}get logHandler(){return this._logHandler}set logHandler(e){if(typeof e!="function")throw new TypeError("Value assigned to `logHandler` must be a function");this._logHandler=e}get userLogHandler(){return this._userLogHandler}set userLogHandler(e){this._userLogHandler=e}debug(...e){this._userLogHandler&&this._userLogHandler(this,q.DEBUG,...e),this._logHandler(this,q.DEBUG,...e)}log(...e){this._userLogHandler&&this._userLogHandler(this,q.VERBOSE,...e),this._logHandler(this,q.VERBOSE,...e)}info(...e){this._userLogHandler&&this._userLogHandler(this,q.INFO,...e),this._logHandler(this,q.INFO,...e)}warn(...e){this._userLogHandler&&this._userLogHandler(this,q.WARN,...e),this._logHandler(this,q.WARN,...e)}error(...e){this._userLogHandler&&this._userLogHandler(this,q.ERROR,...e),this._logHandler(this,q.ERROR,...e)}}const ap=(n,e)=>e.some(t=>n instanceof t);let _c,yc;function cp(){return _c||(_c=[IDBDatabase,IDBObjectStore,IDBIndex,IDBCursor,IDBTransaction])}function up(){return yc||(yc=[IDBCursor.prototype.advance,IDBCursor.prototype.continue,IDBCursor.prototype.continuePrimaryKey])}const rl=new WeakMap,Us=new WeakMap,il=new WeakMap,_s=new WeakMap,go=new WeakMap;function lp(n){const e=new Promise((t,r)=>{const i=()=>{n.removeEventListener("success",s),n.removeEventListener("error",a)},s=()=>{t(Je(n.result)),i()},a=()=>{r(n.error),i()};n.addEventListener("success",s),n.addEventListener("error",a)});return e.then(t=>{t instanceof IDBCursor&&rl.set(t,n)}).catch(()=>{}),go.set(e,n),e}function hp(n){if(Us.has(n))return;const e=new Promise((t,r)=>{const i=()=>{n.removeEventListener("complete",s),n.removeEventListener("error",a),n.removeEventListener("abort",a)},s=()=>{t(),i()},a=()=>{r(n.error||new DOMException("AbortError","AbortError")),i()};n.addEventListener("complete",s),n.addEventListener("error",a),n.addEventListener("abort",a)});Us.set(n,e)}let Bs={get(n,e,t){if(n instanceof IDBTransaction){if(e==="done")return Us.get(n);if(e==="objectStoreNames")return n.objectStoreNames||il.get(n);if(e==="store")return t.objectStoreNames[1]?void 0:t.objectStore(t.objectStoreNames[0])}return Je(n[e])},set(n,e,t){return n[e]=t,!0},has(n,e){return n instanceof IDBTransaction&&(e==="done"||e==="store")?!0:e in n}};function dp(n){Bs=n(Bs)}function fp(n){return n===IDBDatabase.prototype.transaction&&!("objectStoreNames"in IDBTransaction.prototype)?function(e,...t){const r=n.call(ys(this),e,...t);return il.set(r,e.sort?e.sort():[e]),Je(r)}:up().includes(n)?function(...e){return n.apply(ys(this),e),Je(rl.get(this))}:function(...e){return Je(n.apply(ys(this),e))}}function pp(n){return typeof n=="function"?fp(n):(n instanceof IDBTransaction&&hp(n),ap(n,cp())?new Proxy(n,Bs):n)}function Je(n){if(n instanceof IDBRequest)return lp(n);if(_s.has(n))return _s.get(n);const e=pp(n);return e!==n&&(_s.set(n,e),go.set(e,n)),e}const ys=n=>go.get(n);function vi(n,e,{blocked:t,upgrade:r,blocking:i,terminated:s}={}){const a=indexedDB.open(n,e),u=Je(a);return r&&a.addEventListener("upgradeneeded",l=>{r(Je(a.result),l.oldVersion,l.newVersion,Je(a.transaction),l)}),t&&a.addEventListener("blocked",l=>t(l.oldVersion,l.newVersion,l)),u.then(l=>{s&&l.addEventListener("close",()=>s()),i&&l.addEventListener("versionchange",d=>i(d.oldVersion,d.newVersion,d))}).catch(()=>{}),u}function vs(n,{blocked:e}={}){const t=indexedDB.deleteDatabase(n);return e&&t.addEventListener("blocked",r=>e(r.oldVersion,r)),Je(t).then(()=>{})}const gp=["get","getKey","getAll","getAllKeys","count"],mp=["put","add","delete","clear"],ws=new Map;function vc(n,e){if(!(n instanceof IDBDatabase&&!(e in n)&&typeof e=="string"))return;if(ws.get(e))return ws.get(e);const t=e.replace(/FromIndex$/,""),r=e!==t,i=mp.includes(t);if(!(t in(r?IDBIndex:IDBObjectStore).prototype)||!(i||gp.includes(t)))return;const s=async function(a,...u){const l=this.transaction(a,i?"readwrite":"readonly");let d=l.store;return r&&(d=d.index(u.shift())),(await Promise.all([d[t](...u),i&&l.done]))[0]};return ws.set(e,s),s}dp(n=>({...n,get:(e,t,r)=>vc(e,t)||n.get(e,t,r),has:(e,t)=>!!vc(e,t)||n.has(e,t)}));/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class _p{constructor(e){this.container=e}getPlatformInfoString(){return this.container.getProviders().map(t=>{if(yp(t)){const r=t.getImmediate();return`${r.library}/${r.version}`}else return null}).filter(t=>t).join(" ")}}function yp(n){const e=n.getComponent();return(e==null?void 0:e.type)==="VERSION"}const qs="@firebase/app",wc="0.10.13";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Xe=new po("@firebase/app"),vp="@firebase/app-compat",wp="@firebase/analytics-compat",Tp="@firebase/analytics",Ep="@firebase/app-check-compat",Ip="@firebase/app-check",Ap="@firebase/auth",bp="@firebase/auth-compat",Rp="@firebase/database",Sp="@firebase/data-connect",Pp="@firebase/database-compat",Cp="@firebase/functions",kp="@firebase/functions-compat",Np="@firebase/installations",Dp="@firebase/installations-compat",Vp="@firebase/messaging",Op="@firebase/messaging-compat",Lp="@firebase/performance",Mp="@firebase/performance-compat",xp="@firebase/remote-config",Fp="@firebase/remote-config-compat",Up="@firebase/storage",Bp="@firebase/storage-compat",qp="@firebase/firestore",$p="@firebase/vertexai-preview",jp="@firebase/firestore-compat",zp="firebase",Hp="10.14.1";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const $s="[DEFAULT]",Kp={[qs]:"fire-core",[vp]:"fire-core-compat",[Tp]:"fire-analytics",[wp]:"fire-analytics-compat",[Ip]:"fire-app-check",[Ep]:"fire-app-check-compat",[Ap]:"fire-auth",[bp]:"fire-auth-compat",[Rp]:"fire-rtdb",[Sp]:"fire-data-connect",[Pp]:"fire-rtdb-compat",[Cp]:"fire-fn",[kp]:"fire-fn-compat",[Np]:"fire-iid",[Dp]:"fire-iid-compat",[Vp]:"fire-fcm",[Op]:"fire-fcm-compat",[Lp]:"fire-perf",[Mp]:"fire-perf-compat",[xp]:"fire-rc",[Fp]:"fire-rc-compat",[Up]:"fire-gcs",[Bp]:"fire-gcs-compat",[qp]:"fire-fst",[jp]:"fire-fst-compat",[$p]:"fire-vertex","fire-js":"fire-js",[zp]:"fire-js-all"};/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ri=new Map,Wp=new Map,js=new Map;function Tc(n,e){try{n.container.addComponent(e)}catch(t){Xe.debug(`Component ${e.name} failed to register with FirebaseApp ${n.name}`,t)}}function Ve(n){const e=n.name;if(js.has(e))return Xe.debug(`There were multiple attempts to register component ${e}.`),!1;js.set(e,n);for(const t of ri.values())Tc(t,n);for(const t of Wp.values())Tc(t,n);return!0}function Ut(n,e){const t=n.container.getProvider("heartbeat").getImmediate({optional:!0});return t&&t.triggerHeartbeat(),n.container.getProvider(e)}function ht(n){return n.settings!==void 0}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Gp={"no-app":"No Firebase App '{$appName}' has been created - call initializeApp() first","bad-app-name":"Illegal App name: '{$appName}'","duplicate-app":"Firebase App named '{$appName}' already exists with different options or config","app-deleted":"Firebase App named '{$appName}' already deleted","server-app-deleted":"Firebase Server App has been deleted","no-options":"Need to provide options, when not being deployed to hosting via source.","invalid-app-argument":"firebase.{$appName}() takes either no argument or a Firebase App instance.","invalid-log-argument":"First argument to `onLog` must be null or a function.","idb-open":"Error thrown when opening IndexedDB. Original error: {$originalErrorMessage}.","idb-get":"Error thrown when reading from IndexedDB. Original error: {$originalErrorMessage}.","idb-set":"Error thrown when writing to IndexedDB. Original error: {$originalErrorMessage}.","idb-delete":"Error thrown when deleting from IndexedDB. Original error: {$originalErrorMessage}.","finalization-registry-not-supported":"FirebaseServerApp deleteOnDeref field defined but the JS runtime does not support FinalizationRegistry.","invalid-server-app-environment":"FirebaseServerApp is not for use in browser environments."},ft=new Ft("app","Firebase",Gp);/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Qp{constructor(e,t,r){this._isDeleted=!1,this._options=Object.assign({},e),this._config=Object.assign({},t),this._name=t.name,this._automaticDataCollectionEnabled=t.automaticDataCollectionEnabled,this._container=r,this.container.addComponent(new Ne("app",()=>this,"PUBLIC"))}get automaticDataCollectionEnabled(){return this.checkDestroyed(),this._automaticDataCollectionEnabled}set automaticDataCollectionEnabled(e){this.checkDestroyed(),this._automaticDataCollectionEnabled=e}get name(){return this.checkDestroyed(),this._name}get options(){return this.checkDestroyed(),this._options}get config(){return this.checkDestroyed(),this._config}get container(){return this._container}get isDeleted(){return this._isDeleted}set isDeleted(e){this._isDeleted=e}checkDestroyed(){if(this.isDeleted)throw ft.create("app-deleted",{appName:this._name})}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const dn=Hp;function sl(n,e={}){let t=n;typeof e!="object"&&(e={name:e});const r=Object.assign({name:$s,automaticDataCollectionEnabled:!1},e),i=r.name;if(typeof i!="string"||!i)throw ft.create("bad-app-name",{appName:String(i)});if(t||(t=Zu()),!t)throw ft.create("no-options");const s=ri.get(i);if(s){if(ni(t,s.options)&&ni(r,s.config))return s;throw ft.create("duplicate-app",{appName:i})}const a=new np(i);for(const l of js.values())a.addComponent(l);const u=new Qp(t,r,a);return ri.set(i,u),u}function wi(n=$s){const e=ri.get(n);if(!e&&n===$s&&Zu())return sl();if(!e)throw ft.create("no-app",{appName:n});return e}function Re(n,e,t){var r;let i=(r=Kp[n])!==null&&r!==void 0?r:n;t&&(i+=`-${t}`);const s=i.match(/\s|\//),a=e.match(/\s|\//);if(s||a){const u=[`Unable to register library "${i}" with version "${e}":`];s&&u.push(`library name "${i}" contains illegal characters (whitespace or "/")`),s&&a&&u.push("and"),a&&u.push(`version name "${e}" contains illegal characters (whitespace or "/")`),Xe.warn(u.join(" "));return}Ve(new Ne(`${i}-version`,()=>({library:i,version:e}),"VERSION"))}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Jp="firebase-heartbeat-database",Yp=1,Qn="firebase-heartbeat-store";let Ts=null;function ol(){return Ts||(Ts=vi(Jp,Yp,{upgrade:(n,e)=>{switch(e){case 0:try{n.createObjectStore(Qn)}catch(t){console.warn(t)}}}}).catch(n=>{throw ft.create("idb-open",{originalErrorMessage:n.message})})),Ts}async function Xp(n){try{const t=(await ol()).transaction(Qn),r=await t.objectStore(Qn).get(al(n));return await t.done,r}catch(e){if(e instanceof Le)Xe.warn(e.message);else{const t=ft.create("idb-get",{originalErrorMessage:e==null?void 0:e.message});Xe.warn(t.message)}}}async function Ec(n,e){try{const r=(await ol()).transaction(Qn,"readwrite");await r.objectStore(Qn).put(e,al(n)),await r.done}catch(t){if(t instanceof Le)Xe.warn(t.message);else{const r=ft.create("idb-set",{originalErrorMessage:t==null?void 0:t.message});Xe.warn(r.message)}}}function al(n){return`${n.name}!${n.options.appId}`}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Zp=1024,eg=720*60*60*1e3;class tg{constructor(e){this.container=e,this._heartbeatsCache=null;const t=this.container.getProvider("app").getImmediate();this._storage=new rg(t),this._heartbeatsCachePromise=this._storage.read().then(r=>(this._heartbeatsCache=r,r))}async triggerHeartbeat(){var e,t;try{const i=this.container.getProvider("platform-logger").getImmediate().getPlatformInfoString(),s=Ic();return((e=this._heartbeatsCache)===null||e===void 0?void 0:e.heartbeats)==null&&(this._heartbeatsCache=await this._heartbeatsCachePromise,((t=this._heartbeatsCache)===null||t===void 0?void 0:t.heartbeats)==null)||this._heartbeatsCache.lastSentHeartbeatDate===s||this._heartbeatsCache.heartbeats.some(a=>a.date===s)?void 0:(this._heartbeatsCache.heartbeats.push({date:s,agent:i}),this._heartbeatsCache.heartbeats=this._heartbeatsCache.heartbeats.filter(a=>{const u=new Date(a.date).valueOf();return Date.now()-u<=eg}),this._storage.overwrite(this._heartbeatsCache))}catch(r){Xe.warn(r)}}async getHeartbeatsHeader(){var e;try{if(this._heartbeatsCache===null&&await this._heartbeatsCachePromise,((e=this._heartbeatsCache)===null||e===void 0?void 0:e.heartbeats)==null||this._heartbeatsCache.heartbeats.length===0)return"";const t=Ic(),{heartbeatsToSend:r,unsentEntries:i}=ng(this._heartbeatsCache.heartbeats),s=ti(JSON.stringify({version:2,heartbeats:r}));return this._heartbeatsCache.lastSentHeartbeatDate=t,i.length>0?(this._heartbeatsCache.heartbeats=i,await this._storage.overwrite(this._heartbeatsCache)):(this._heartbeatsCache.heartbeats=[],this._storage.overwrite(this._heartbeatsCache)),s}catch(t){return Xe.warn(t),""}}}function Ic(){return new Date().toISOString().substring(0,10)}function ng(n,e=Zp){const t=[];let r=n.slice();for(const i of n){const s=t.find(a=>a.agent===i.agent);if(s){if(s.dates.push(i.date),Ac(t)>e){s.dates.pop();break}}else if(t.push({agent:i.agent,dates:[i.date]}),Ac(t)>e){t.pop();break}r=r.slice(1)}return{heartbeatsToSend:t,unsentEntries:r}}class rg{constructor(e){this.app=e,this._canUseIndexedDBPromise=this.runIndexedDBEnvironmentCheck()}async runIndexedDBEnvironmentCheck(){return tl()?nl().then(()=>!0).catch(()=>!1):!1}async read(){if(await this._canUseIndexedDBPromise){const t=await Xp(this.app);return t!=null&&t.heartbeats?t:{heartbeats:[]}}else return{heartbeats:[]}}async overwrite(e){var t;if(await this._canUseIndexedDBPromise){const i=await this.read();return Ec(this.app,{lastSentHeartbeatDate:(t=e.lastSentHeartbeatDate)!==null&&t!==void 0?t:i.lastSentHeartbeatDate,heartbeats:e.heartbeats})}else return}async add(e){var t;if(await this._canUseIndexedDBPromise){const i=await this.read();return Ec(this.app,{lastSentHeartbeatDate:(t=e.lastSentHeartbeatDate)!==null&&t!==void 0?t:i.lastSentHeartbeatDate,heartbeats:[...i.heartbeats,...e.heartbeats]})}else return}}function Ac(n){return ti(JSON.stringify({version:2,heartbeats:n})).length}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ig(n){Ve(new Ne("platform-logger",e=>new _p(e),"PRIVATE")),Ve(new Ne("heartbeat",e=>new tg(e),"PRIVATE")),Re(qs,wc,n),Re(qs,wc,"esm2017"),Re("fire-js","")}ig("");var bc=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};/** @license
Copyright The Closure Library Authors.
SPDX-License-Identifier: Apache-2.0
*/var kt,cl;(function(){var n;/** @license

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/function e(w,g){function _(){}_.prototype=g.prototype,w.D=g.prototype,w.prototype=new _,w.prototype.constructor=w,w.C=function(y,T,I){for(var m=Array(arguments.length-2),$e=2;$e<arguments.length;$e++)m[$e-2]=arguments[$e];return g.prototype[T].apply(y,m)}}function t(){this.blockSize=-1}function r(){this.blockSize=-1,this.blockSize=64,this.g=Array(4),this.B=Array(this.blockSize),this.o=this.h=0,this.s()}e(r,t),r.prototype.s=function(){this.g[0]=1732584193,this.g[1]=4023233417,this.g[2]=2562383102,this.g[3]=271733878,this.o=this.h=0};function i(w,g,_){_||(_=0);var y=Array(16);if(typeof g=="string")for(var T=0;16>T;++T)y[T]=g.charCodeAt(_++)|g.charCodeAt(_++)<<8|g.charCodeAt(_++)<<16|g.charCodeAt(_++)<<24;else for(T=0;16>T;++T)y[T]=g[_++]|g[_++]<<8|g[_++]<<16|g[_++]<<24;g=w.g[0],_=w.g[1],T=w.g[2];var I=w.g[3],m=g+(I^_&(T^I))+y[0]+3614090360&4294967295;g=_+(m<<7&4294967295|m>>>25),m=I+(T^g&(_^T))+y[1]+3905402710&4294967295,I=g+(m<<12&4294967295|m>>>20),m=T+(_^I&(g^_))+y[2]+606105819&4294967295,T=I+(m<<17&4294967295|m>>>15),m=_+(g^T&(I^g))+y[3]+3250441966&4294967295,_=T+(m<<22&4294967295|m>>>10),m=g+(I^_&(T^I))+y[4]+4118548399&4294967295,g=_+(m<<7&4294967295|m>>>25),m=I+(T^g&(_^T))+y[5]+1200080426&4294967295,I=g+(m<<12&4294967295|m>>>20),m=T+(_^I&(g^_))+y[6]+2821735955&4294967295,T=I+(m<<17&4294967295|m>>>15),m=_+(g^T&(I^g))+y[7]+4249261313&4294967295,_=T+(m<<22&4294967295|m>>>10),m=g+(I^_&(T^I))+y[8]+1770035416&4294967295,g=_+(m<<7&4294967295|m>>>25),m=I+(T^g&(_^T))+y[9]+2336552879&4294967295,I=g+(m<<12&4294967295|m>>>20),m=T+(_^I&(g^_))+y[10]+4294925233&4294967295,T=I+(m<<17&4294967295|m>>>15),m=_+(g^T&(I^g))+y[11]+2304563134&4294967295,_=T+(m<<22&4294967295|m>>>10),m=g+(I^_&(T^I))+y[12]+1804603682&4294967295,g=_+(m<<7&4294967295|m>>>25),m=I+(T^g&(_^T))+y[13]+4254626195&4294967295,I=g+(m<<12&4294967295|m>>>20),m=T+(_^I&(g^_))+y[14]+2792965006&4294967295,T=I+(m<<17&4294967295|m>>>15),m=_+(g^T&(I^g))+y[15]+1236535329&4294967295,_=T+(m<<22&4294967295|m>>>10),m=g+(T^I&(_^T))+y[1]+4129170786&4294967295,g=_+(m<<5&4294967295|m>>>27),m=I+(_^T&(g^_))+y[6]+3225465664&4294967295,I=g+(m<<9&4294967295|m>>>23),m=T+(g^_&(I^g))+y[11]+643717713&4294967295,T=I+(m<<14&4294967295|m>>>18),m=_+(I^g&(T^I))+y[0]+3921069994&4294967295,_=T+(m<<20&4294967295|m>>>12),m=g+(T^I&(_^T))+y[5]+3593408605&4294967295,g=_+(m<<5&4294967295|m>>>27),m=I+(_^T&(g^_))+y[10]+38016083&4294967295,I=g+(m<<9&4294967295|m>>>23),m=T+(g^_&(I^g))+y[15]+3634488961&4294967295,T=I+(m<<14&4294967295|m>>>18),m=_+(I^g&(T^I))+y[4]+3889429448&4294967295,_=T+(m<<20&4294967295|m>>>12),m=g+(T^I&(_^T))+y[9]+568446438&4294967295,g=_+(m<<5&4294967295|m>>>27),m=I+(_^T&(g^_))+y[14]+3275163606&4294967295,I=g+(m<<9&4294967295|m>>>23),m=T+(g^_&(I^g))+y[3]+4107603335&4294967295,T=I+(m<<14&4294967295|m>>>18),m=_+(I^g&(T^I))+y[8]+1163531501&4294967295,_=T+(m<<20&4294967295|m>>>12),m=g+(T^I&(_^T))+y[13]+2850285829&4294967295,g=_+(m<<5&4294967295|m>>>27),m=I+(_^T&(g^_))+y[2]+4243563512&4294967295,I=g+(m<<9&4294967295|m>>>23),m=T+(g^_&(I^g))+y[7]+1735328473&4294967295,T=I+(m<<14&4294967295|m>>>18),m=_+(I^g&(T^I))+y[12]+2368359562&4294967295,_=T+(m<<20&4294967295|m>>>12),m=g+(_^T^I)+y[5]+4294588738&4294967295,g=_+(m<<4&4294967295|m>>>28),m=I+(g^_^T)+y[8]+2272392833&4294967295,I=g+(m<<11&4294967295|m>>>21),m=T+(I^g^_)+y[11]+1839030562&4294967295,T=I+(m<<16&4294967295|m>>>16),m=_+(T^I^g)+y[14]+4259657740&4294967295,_=T+(m<<23&4294967295|m>>>9),m=g+(_^T^I)+y[1]+2763975236&4294967295,g=_+(m<<4&4294967295|m>>>28),m=I+(g^_^T)+y[4]+1272893353&4294967295,I=g+(m<<11&4294967295|m>>>21),m=T+(I^g^_)+y[7]+4139469664&4294967295,T=I+(m<<16&4294967295|m>>>16),m=_+(T^I^g)+y[10]+3200236656&4294967295,_=T+(m<<23&4294967295|m>>>9),m=g+(_^T^I)+y[13]+681279174&4294967295,g=_+(m<<4&4294967295|m>>>28),m=I+(g^_^T)+y[0]+3936430074&4294967295,I=g+(m<<11&4294967295|m>>>21),m=T+(I^g^_)+y[3]+3572445317&4294967295,T=I+(m<<16&4294967295|m>>>16),m=_+(T^I^g)+y[6]+76029189&4294967295,_=T+(m<<23&4294967295|m>>>9),m=g+(_^T^I)+y[9]+3654602809&4294967295,g=_+(m<<4&4294967295|m>>>28),m=I+(g^_^T)+y[12]+3873151461&4294967295,I=g+(m<<11&4294967295|m>>>21),m=T+(I^g^_)+y[15]+530742520&4294967295,T=I+(m<<16&4294967295|m>>>16),m=_+(T^I^g)+y[2]+3299628645&4294967295,_=T+(m<<23&4294967295|m>>>9),m=g+(T^(_|~I))+y[0]+4096336452&4294967295,g=_+(m<<6&4294967295|m>>>26),m=I+(_^(g|~T))+y[7]+1126891415&4294967295,I=g+(m<<10&4294967295|m>>>22),m=T+(g^(I|~_))+y[14]+2878612391&4294967295,T=I+(m<<15&4294967295|m>>>17),m=_+(I^(T|~g))+y[5]+4237533241&4294967295,_=T+(m<<21&4294967295|m>>>11),m=g+(T^(_|~I))+y[12]+1700485571&4294967295,g=_+(m<<6&4294967295|m>>>26),m=I+(_^(g|~T))+y[3]+2399980690&4294967295,I=g+(m<<10&4294967295|m>>>22),m=T+(g^(I|~_))+y[10]+4293915773&4294967295,T=I+(m<<15&4294967295|m>>>17),m=_+(I^(T|~g))+y[1]+2240044497&4294967295,_=T+(m<<21&4294967295|m>>>11),m=g+(T^(_|~I))+y[8]+1873313359&4294967295,g=_+(m<<6&4294967295|m>>>26),m=I+(_^(g|~T))+y[15]+4264355552&4294967295,I=g+(m<<10&4294967295|m>>>22),m=T+(g^(I|~_))+y[6]+2734768916&4294967295,T=I+(m<<15&4294967295|m>>>17),m=_+(I^(T|~g))+y[13]+1309151649&4294967295,_=T+(m<<21&4294967295|m>>>11),m=g+(T^(_|~I))+y[4]+4149444226&4294967295,g=_+(m<<6&4294967295|m>>>26),m=I+(_^(g|~T))+y[11]+3174756917&4294967295,I=g+(m<<10&4294967295|m>>>22),m=T+(g^(I|~_))+y[2]+718787259&4294967295,T=I+(m<<15&4294967295|m>>>17),m=_+(I^(T|~g))+y[9]+3951481745&4294967295,w.g[0]=w.g[0]+g&4294967295,w.g[1]=w.g[1]+(T+(m<<21&4294967295|m>>>11))&4294967295,w.g[2]=w.g[2]+T&4294967295,w.g[3]=w.g[3]+I&4294967295}r.prototype.u=function(w,g){g===void 0&&(g=w.length);for(var _=g-this.blockSize,y=this.B,T=this.h,I=0;I<g;){if(T==0)for(;I<=_;)i(this,w,I),I+=this.blockSize;if(typeof w=="string"){for(;I<g;)if(y[T++]=w.charCodeAt(I++),T==this.blockSize){i(this,y),T=0;break}}else for(;I<g;)if(y[T++]=w[I++],T==this.blockSize){i(this,y),T=0;break}}this.h=T,this.o+=g},r.prototype.v=function(){var w=Array((56>this.h?this.blockSize:2*this.blockSize)-this.h);w[0]=128;for(var g=1;g<w.length-8;++g)w[g]=0;var _=8*this.o;for(g=w.length-8;g<w.length;++g)w[g]=_&255,_/=256;for(this.u(w),w=Array(16),g=_=0;4>g;++g)for(var y=0;32>y;y+=8)w[_++]=this.g[g]>>>y&255;return w};function s(w,g){var _=u;return Object.prototype.hasOwnProperty.call(_,w)?_[w]:_[w]=g(w)}function a(w,g){this.h=g;for(var _=[],y=!0,T=w.length-1;0<=T;T--){var I=w[T]|0;y&&I==g||(_[T]=I,y=!1)}this.g=_}var u={};function l(w){return-128<=w&&128>w?s(w,function(g){return new a([g|0],0>g?-1:0)}):new a([w|0],0>w?-1:0)}function d(w){if(isNaN(w)||!isFinite(w))return v;if(0>w)return N(d(-w));for(var g=[],_=1,y=0;w>=_;y++)g[y]=w/_|0,_*=4294967296;return new a(g,0)}function p(w,g){if(w.length==0)throw Error("number format error: empty string");if(g=g||10,2>g||36<g)throw Error("radix out of range: "+g);if(w.charAt(0)=="-")return N(p(w.substring(1),g));if(0<=w.indexOf("-"))throw Error('number format error: interior "-" character');for(var _=d(Math.pow(g,8)),y=v,T=0;T<w.length;T+=8){var I=Math.min(8,w.length-T),m=parseInt(w.substring(T,T+I),g);8>I?(I=d(Math.pow(g,I)),y=y.j(I).add(d(m))):(y=y.j(_),y=y.add(d(m)))}return y}var v=l(0),A=l(1),S=l(16777216);n=a.prototype,n.m=function(){if(O(this))return-N(this).m();for(var w=0,g=1,_=0;_<this.g.length;_++){var y=this.i(_);w+=(0<=y?y:4294967296+y)*g,g*=4294967296}return w},n.toString=function(w){if(w=w||10,2>w||36<w)throw Error("radix out of range: "+w);if(k(this))return"0";if(O(this))return"-"+N(this).toString(w);for(var g=d(Math.pow(w,6)),_=this,y="";;){var T=ee(_,g).g;_=H(_,T.j(g));var I=((0<_.g.length?_.g[0]:_.h)>>>0).toString(w);if(_=T,k(_))return I+y;for(;6>I.length;)I="0"+I;y=I+y}},n.i=function(w){return 0>w?0:w<this.g.length?this.g[w]:this.h};function k(w){if(w.h!=0)return!1;for(var g=0;g<w.g.length;g++)if(w.g[g]!=0)return!1;return!0}function O(w){return w.h==-1}n.l=function(w){return w=H(this,w),O(w)?-1:k(w)?0:1};function N(w){for(var g=w.g.length,_=[],y=0;y<g;y++)_[y]=~w.g[y];return new a(_,~w.h).add(A)}n.abs=function(){return O(this)?N(this):this},n.add=function(w){for(var g=Math.max(this.g.length,w.g.length),_=[],y=0,T=0;T<=g;T++){var I=y+(this.i(T)&65535)+(w.i(T)&65535),m=(I>>>16)+(this.i(T)>>>16)+(w.i(T)>>>16);y=m>>>16,I&=65535,m&=65535,_[T]=m<<16|I}return new a(_,_[_.length-1]&-2147483648?-1:0)};function H(w,g){return w.add(N(g))}n.j=function(w){if(k(this)||k(w))return v;if(O(this))return O(w)?N(this).j(N(w)):N(N(this).j(w));if(O(w))return N(this.j(N(w)));if(0>this.l(S)&&0>w.l(S))return d(this.m()*w.m());for(var g=this.g.length+w.g.length,_=[],y=0;y<2*g;y++)_[y]=0;for(y=0;y<this.g.length;y++)for(var T=0;T<w.g.length;T++){var I=this.i(y)>>>16,m=this.i(y)&65535,$e=w.i(T)>>>16,vn=w.i(T)&65535;_[2*y+2*T]+=m*vn,K(_,2*y+2*T),_[2*y+2*T+1]+=I*vn,K(_,2*y+2*T+1),_[2*y+2*T+1]+=m*$e,K(_,2*y+2*T+1),_[2*y+2*T+2]+=I*$e,K(_,2*y+2*T+2)}for(y=0;y<g;y++)_[y]=_[2*y+1]<<16|_[2*y];for(y=g;y<2*g;y++)_[y]=0;return new a(_,0)};function K(w,g){for(;(w[g]&65535)!=w[g];)w[g+1]+=w[g]>>>16,w[g]&=65535,g++}function W(w,g){this.g=w,this.h=g}function ee(w,g){if(k(g))throw Error("division by zero");if(k(w))return new W(v,v);if(O(w))return g=ee(N(w),g),new W(N(g.g),N(g.h));if(O(g))return g=ee(w,N(g)),new W(N(g.g),g.h);if(30<w.g.length){if(O(w)||O(g))throw Error("slowDivide_ only works with positive integers.");for(var _=A,y=g;0>=y.l(w);)_=ke(_),y=ke(y);var T=te(_,1),I=te(y,1);for(y=te(y,2),_=te(_,2);!k(y);){var m=I.add(y);0>=m.l(w)&&(T=T.add(_),I=m),y=te(y,1),_=te(_,1)}return g=H(w,T.j(g)),new W(T,g)}for(T=v;0<=w.l(g);){for(_=Math.max(1,Math.floor(w.m()/g.m())),y=Math.ceil(Math.log(_)/Math.LN2),y=48>=y?1:Math.pow(2,y-48),I=d(_),m=I.j(g);O(m)||0<m.l(w);)_-=y,I=d(_),m=I.j(g);k(I)&&(I=A),T=T.add(I),w=H(w,m)}return new W(T,w)}n.A=function(w){return ee(this,w).h},n.and=function(w){for(var g=Math.max(this.g.length,w.g.length),_=[],y=0;y<g;y++)_[y]=this.i(y)&w.i(y);return new a(_,this.h&w.h)},n.or=function(w){for(var g=Math.max(this.g.length,w.g.length),_=[],y=0;y<g;y++)_[y]=this.i(y)|w.i(y);return new a(_,this.h|w.h)},n.xor=function(w){for(var g=Math.max(this.g.length,w.g.length),_=[],y=0;y<g;y++)_[y]=this.i(y)^w.i(y);return new a(_,this.h^w.h)};function ke(w){for(var g=w.g.length+1,_=[],y=0;y<g;y++)_[y]=w.i(y)<<1|w.i(y-1)>>>31;return new a(_,w.h)}function te(w,g){var _=g>>5;g%=32;for(var y=w.g.length-_,T=[],I=0;I<y;I++)T[I]=0<g?w.i(I+_)>>>g|w.i(I+_+1)<<32-g:w.i(I+_);return new a(T,w.h)}r.prototype.digest=r.prototype.v,r.prototype.reset=r.prototype.s,r.prototype.update=r.prototype.u,cl=r,a.prototype.add=a.prototype.add,a.prototype.multiply=a.prototype.j,a.prototype.modulo=a.prototype.A,a.prototype.compare=a.prototype.l,a.prototype.toNumber=a.prototype.m,a.prototype.toString=a.prototype.toString,a.prototype.getBits=a.prototype.i,a.fromNumber=d,a.fromString=p,kt=a}).apply(typeof bc<"u"?bc:typeof self<"u"?self:typeof window<"u"?window:{});var Fr=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};/** @license
Copyright The Closure Library Authors.
SPDX-License-Identifier: Apache-2.0
*/var ul,xn,ll,Kr,zs,hl,dl,fl;(function(){var n,e=typeof Object.defineProperties=="function"?Object.defineProperty:function(o,c,h){return o==Array.prototype||o==Object.prototype||(o[c]=h.value),o};function t(o){o=[typeof globalThis=="object"&&globalThis,o,typeof window=="object"&&window,typeof self=="object"&&self,typeof Fr=="object"&&Fr];for(var c=0;c<o.length;++c){var h=o[c];if(h&&h.Math==Math)return h}throw Error("Cannot find global object")}var r=t(this);function i(o,c){if(c)e:{var h=r;o=o.split(".");for(var f=0;f<o.length-1;f++){var E=o[f];if(!(E in h))break e;h=h[E]}o=o[o.length-1],f=h[o],c=c(f),c!=f&&c!=null&&e(h,o,{configurable:!0,writable:!0,value:c})}}function s(o,c){o instanceof String&&(o+="");var h=0,f=!1,E={next:function(){if(!f&&h<o.length){var b=h++;return{value:c(b,o[b]),done:!1}}return f=!0,{done:!0,value:void 0}}};return E[Symbol.iterator]=function(){return E},E}i("Array.prototype.values",function(o){return o||function(){return s(this,function(c,h){return h})}});/** @license

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/var a=a||{},u=this||self;function l(o){var c=typeof o;return c=c!="object"?c:o?Array.isArray(o)?"array":c:"null",c=="array"||c=="object"&&typeof o.length=="number"}function d(o){var c=typeof o;return c=="object"&&o!=null||c=="function"}function p(o,c,h){return o.call.apply(o.bind,arguments)}function v(o,c,h){if(!o)throw Error();if(2<arguments.length){var f=Array.prototype.slice.call(arguments,2);return function(){var E=Array.prototype.slice.call(arguments);return Array.prototype.unshift.apply(E,f),o.apply(c,E)}}return function(){return o.apply(c,arguments)}}function A(o,c,h){return A=Function.prototype.bind&&Function.prototype.bind.toString().indexOf("native code")!=-1?p:v,A.apply(null,arguments)}function S(o,c){var h=Array.prototype.slice.call(arguments,1);return function(){var f=h.slice();return f.push.apply(f,arguments),o.apply(this,f)}}function k(o,c){function h(){}h.prototype=c.prototype,o.aa=c.prototype,o.prototype=new h,o.prototype.constructor=o,o.Qb=function(f,E,b){for(var C=Array(arguments.length-2),Q=2;Q<arguments.length;Q++)C[Q-2]=arguments[Q];return c.prototype[E].apply(f,C)}}function O(o){const c=o.length;if(0<c){const h=Array(c);for(let f=0;f<c;f++)h[f]=o[f];return h}return[]}function N(o,c){for(let h=1;h<arguments.length;h++){const f=arguments[h];if(l(f)){const E=o.length||0,b=f.length||0;o.length=E+b;for(let C=0;C<b;C++)o[E+C]=f[C]}else o.push(f)}}class H{constructor(c,h){this.i=c,this.j=h,this.h=0,this.g=null}get(){let c;return 0<this.h?(this.h--,c=this.g,this.g=c.next,c.next=null):c=this.i(),c}}function K(o){return/^[\s\xa0]*$/.test(o)}function W(){var o=u.navigator;return o&&(o=o.userAgent)?o:""}function ee(o){return ee[" "](o),o}ee[" "]=function(){};var ke=W().indexOf("Gecko")!=-1&&!(W().toLowerCase().indexOf("webkit")!=-1&&W().indexOf("Edge")==-1)&&!(W().indexOf("Trident")!=-1||W().indexOf("MSIE")!=-1)&&W().indexOf("Edge")==-1;function te(o,c,h){for(const f in o)c.call(h,o[f],f,o)}function w(o,c){for(const h in o)c.call(void 0,o[h],h,o)}function g(o){const c={};for(const h in o)c[h]=o[h];return c}const _="constructor hasOwnProperty isPrototypeOf propertyIsEnumerable toLocaleString toString valueOf".split(" ");function y(o,c){let h,f;for(let E=1;E<arguments.length;E++){f=arguments[E];for(h in f)o[h]=f[h];for(let b=0;b<_.length;b++)h=_[b],Object.prototype.hasOwnProperty.call(f,h)&&(o[h]=f[h])}}function T(o){var c=1;o=o.split(":");const h=[];for(;0<c&&o.length;)h.push(o.shift()),c--;return o.length&&h.push(o.join(":")),h}function I(o){u.setTimeout(()=>{throw o},0)}function m(){var o=Ki;let c=null;return o.g&&(c=o.g,o.g=o.g.next,o.g||(o.h=null),c.next=null),c}class $e{constructor(){this.h=this.g=null}add(c,h){const f=vn.get();f.set(c,h),this.h?this.h.next=f:this.g=f,this.h=f}}var vn=new H(()=>new Wd,o=>o.reset());class Wd{constructor(){this.next=this.g=this.h=null}set(c,h){this.h=c,this.g=h,this.next=null}reset(){this.next=this.g=this.h=null}}let wn,Tn=!1,Ki=new $e,ga=()=>{const o=u.Promise.resolve(void 0);wn=()=>{o.then(Gd)}};var Gd=()=>{for(var o;o=m();){try{o.h.call(o.g)}catch(h){I(h)}var c=vn;c.j(o),100>c.h&&(c.h++,o.next=c.g,c.g=o)}Tn=!1};function rt(){this.s=this.s,this.C=this.C}rt.prototype.s=!1,rt.prototype.ma=function(){this.s||(this.s=!0,this.N())},rt.prototype.N=function(){if(this.C)for(;this.C.length;)this.C.shift()()};function pe(o,c){this.type=o,this.g=this.target=c,this.defaultPrevented=!1}pe.prototype.h=function(){this.defaultPrevented=!0};var Qd=(function(){if(!u.addEventListener||!Object.defineProperty)return!1;var o=!1,c=Object.defineProperty({},"passive",{get:function(){o=!0}});try{const h=()=>{};u.addEventListener("test",h,c),u.removeEventListener("test",h,c)}catch{}return o})();function En(o,c){if(pe.call(this,o?o.type:""),this.relatedTarget=this.g=this.target=null,this.button=this.screenY=this.screenX=this.clientY=this.clientX=0,this.key="",this.metaKey=this.shiftKey=this.altKey=this.ctrlKey=!1,this.state=null,this.pointerId=0,this.pointerType="",this.i=null,o){var h=this.type=o.type,f=o.changedTouches&&o.changedTouches.length?o.changedTouches[0]:null;if(this.target=o.target||o.srcElement,this.g=c,c=o.relatedTarget){if(ke){e:{try{ee(c.nodeName);var E=!0;break e}catch{}E=!1}E||(c=null)}}else h=="mouseover"?c=o.fromElement:h=="mouseout"&&(c=o.toElement);this.relatedTarget=c,f?(this.clientX=f.clientX!==void 0?f.clientX:f.pageX,this.clientY=f.clientY!==void 0?f.clientY:f.pageY,this.screenX=f.screenX||0,this.screenY=f.screenY||0):(this.clientX=o.clientX!==void 0?o.clientX:o.pageX,this.clientY=o.clientY!==void 0?o.clientY:o.pageY,this.screenX=o.screenX||0,this.screenY=o.screenY||0),this.button=o.button,this.key=o.key||"",this.ctrlKey=o.ctrlKey,this.altKey=o.altKey,this.shiftKey=o.shiftKey,this.metaKey=o.metaKey,this.pointerId=o.pointerId||0,this.pointerType=typeof o.pointerType=="string"?o.pointerType:Jd[o.pointerType]||"",this.state=o.state,this.i=o,o.defaultPrevented&&En.aa.h.call(this)}}k(En,pe);var Jd={2:"touch",3:"pen",4:"mouse"};En.prototype.h=function(){En.aa.h.call(this);var o=this.i;o.preventDefault?o.preventDefault():o.returnValue=!1};var vr="closure_listenable_"+(1e6*Math.random()|0),Yd=0;function Xd(o,c,h,f,E){this.listener=o,this.proxy=null,this.src=c,this.type=h,this.capture=!!f,this.ha=E,this.key=++Yd,this.da=this.fa=!1}function wr(o){o.da=!0,o.listener=null,o.proxy=null,o.src=null,o.ha=null}function Tr(o){this.src=o,this.g={},this.h=0}Tr.prototype.add=function(o,c,h,f,E){var b=o.toString();o=this.g[b],o||(o=this.g[b]=[],this.h++);var C=Gi(o,c,f,E);return-1<C?(c=o[C],h||(c.fa=!1)):(c=new Xd(c,this.src,b,!!f,E),c.fa=h,o.push(c)),c};function Wi(o,c){var h=c.type;if(h in o.g){var f=o.g[h],E=Array.prototype.indexOf.call(f,c,void 0),b;(b=0<=E)&&Array.prototype.splice.call(f,E,1),b&&(wr(c),o.g[h].length==0&&(delete o.g[h],o.h--))}}function Gi(o,c,h,f){for(var E=0;E<o.length;++E){var b=o[E];if(!b.da&&b.listener==c&&b.capture==!!h&&b.ha==f)return E}return-1}var Qi="closure_lm_"+(1e6*Math.random()|0),Ji={};function ma(o,c,h,f,E){if(Array.isArray(c)){for(var b=0;b<c.length;b++)ma(o,c[b],h,f,E);return null}return h=va(h),o&&o[vr]?o.K(c,h,d(f)?!!f.capture:!1,E):Zd(o,c,h,!1,f,E)}function Zd(o,c,h,f,E,b){if(!c)throw Error("Invalid event type");var C=d(E)?!!E.capture:!!E,Q=Xi(o);if(Q||(o[Qi]=Q=new Tr(o)),h=Q.add(c,h,f,C,b),h.proxy)return h;if(f=ef(),h.proxy=f,f.src=o,f.listener=h,o.addEventListener)Qd||(E=C),E===void 0&&(E=!1),o.addEventListener(c.toString(),f,E);else if(o.attachEvent)o.attachEvent(ya(c.toString()),f);else if(o.addListener&&o.removeListener)o.addListener(f);else throw Error("addEventListener and attachEvent are unavailable.");return h}function ef(){function o(h){return c.call(o.src,o.listener,h)}const c=tf;return o}function _a(o,c,h,f,E){if(Array.isArray(c))for(var b=0;b<c.length;b++)_a(o,c[b],h,f,E);else f=d(f)?!!f.capture:!!f,h=va(h),o&&o[vr]?(o=o.i,c=String(c).toString(),c in o.g&&(b=o.g[c],h=Gi(b,h,f,E),-1<h&&(wr(b[h]),Array.prototype.splice.call(b,h,1),b.length==0&&(delete o.g[c],o.h--)))):o&&(o=Xi(o))&&(c=o.g[c.toString()],o=-1,c&&(o=Gi(c,h,f,E)),(h=-1<o?c[o]:null)&&Yi(h))}function Yi(o){if(typeof o!="number"&&o&&!o.da){var c=o.src;if(c&&c[vr])Wi(c.i,o);else{var h=o.type,f=o.proxy;c.removeEventListener?c.removeEventListener(h,f,o.capture):c.detachEvent?c.detachEvent(ya(h),f):c.addListener&&c.removeListener&&c.removeListener(f),(h=Xi(c))?(Wi(h,o),h.h==0&&(h.src=null,c[Qi]=null)):wr(o)}}}function ya(o){return o in Ji?Ji[o]:Ji[o]="on"+o}function tf(o,c){if(o.da)o=!0;else{c=new En(c,this);var h=o.listener,f=o.ha||o.src;o.fa&&Yi(o),o=h.call(f,c)}return o}function Xi(o){return o=o[Qi],o instanceof Tr?o:null}var Zi="__closure_events_fn_"+(1e9*Math.random()>>>0);function va(o){return typeof o=="function"?o:(o[Zi]||(o[Zi]=function(c){return o.handleEvent(c)}),o[Zi])}function ge(){rt.call(this),this.i=new Tr(this),this.M=this,this.F=null}k(ge,rt),ge.prototype[vr]=!0,ge.prototype.removeEventListener=function(o,c,h,f){_a(this,o,c,h,f)};function Ee(o,c){var h,f=o.F;if(f)for(h=[];f;f=f.F)h.push(f);if(o=o.M,f=c.type||c,typeof c=="string")c=new pe(c,o);else if(c instanceof pe)c.target=c.target||o;else{var E=c;c=new pe(f,o),y(c,E)}if(E=!0,h)for(var b=h.length-1;0<=b;b--){var C=c.g=h[b];E=Er(C,f,!0,c)&&E}if(C=c.g=o,E=Er(C,f,!0,c)&&E,E=Er(C,f,!1,c)&&E,h)for(b=0;b<h.length;b++)C=c.g=h[b],E=Er(C,f,!1,c)&&E}ge.prototype.N=function(){if(ge.aa.N.call(this),this.i){var o=this.i,c;for(c in o.g){for(var h=o.g[c],f=0;f<h.length;f++)wr(h[f]);delete o.g[c],o.h--}}this.F=null},ge.prototype.K=function(o,c,h,f){return this.i.add(String(o),c,!1,h,f)},ge.prototype.L=function(o,c,h,f){return this.i.add(String(o),c,!0,h,f)};function Er(o,c,h,f){if(c=o.i.g[String(c)],!c)return!0;c=c.concat();for(var E=!0,b=0;b<c.length;++b){var C=c[b];if(C&&!C.da&&C.capture==h){var Q=C.listener,ce=C.ha||C.src;C.fa&&Wi(o.i,C),E=Q.call(ce,f)!==!1&&E}}return E&&!f.defaultPrevented}function wa(o,c,h){if(typeof o=="function")h&&(o=A(o,h));else if(o&&typeof o.handleEvent=="function")o=A(o.handleEvent,o);else throw Error("Invalid listener argument");return 2147483647<Number(c)?-1:u.setTimeout(o,c||0)}function Ta(o){o.g=wa(()=>{o.g=null,o.i&&(o.i=!1,Ta(o))},o.l);const c=o.h;o.h=null,o.m.apply(null,c)}class nf extends rt{constructor(c,h){super(),this.m=c,this.l=h,this.h=null,this.i=!1,this.g=null}j(c){this.h=arguments,this.g?this.i=!0:Ta(this)}N(){super.N(),this.g&&(u.clearTimeout(this.g),this.g=null,this.i=!1,this.h=null)}}function In(o){rt.call(this),this.h=o,this.g={}}k(In,rt);var Ea=[];function Ia(o){te(o.g,function(c,h){this.g.hasOwnProperty(h)&&Yi(c)},o),o.g={}}In.prototype.N=function(){In.aa.N.call(this),Ia(this)},In.prototype.handleEvent=function(){throw Error("EventHandler.handleEvent not implemented")};var es=u.JSON.stringify,rf=u.JSON.parse,sf=class{stringify(o){return u.JSON.stringify(o,void 0)}parse(o){return u.JSON.parse(o,void 0)}};function ts(){}ts.prototype.h=null;function Aa(o){return o.h||(o.h=o.i())}function ba(){}var An={OPEN:"a",kb:"b",Ja:"c",wb:"d"};function ns(){pe.call(this,"d")}k(ns,pe);function rs(){pe.call(this,"c")}k(rs,pe);var Tt={},Ra=null;function Ir(){return Ra=Ra||new ge}Tt.La="serverreachability";function Sa(o){pe.call(this,Tt.La,o)}k(Sa,pe);function bn(o){const c=Ir();Ee(c,new Sa(c))}Tt.STAT_EVENT="statevent";function Pa(o,c){pe.call(this,Tt.STAT_EVENT,o),this.stat=c}k(Pa,pe);function Ie(o){const c=Ir();Ee(c,new Pa(c,o))}Tt.Ma="timingevent";function Ca(o,c){pe.call(this,Tt.Ma,o),this.size=c}k(Ca,pe);function Rn(o,c){if(typeof o!="function")throw Error("Fn must not be null and must be a function");return u.setTimeout(function(){o()},c)}function Sn(){this.g=!0}Sn.prototype.xa=function(){this.g=!1};function of(o,c,h,f,E,b){o.info(function(){if(o.g)if(b)for(var C="",Q=b.split("&"),ce=0;ce<Q.length;ce++){var j=Q[ce].split("=");if(1<j.length){var me=j[0];j=j[1];var _e=me.split("_");C=2<=_e.length&&_e[1]=="type"?C+(me+"="+j+"&"):C+(me+"=redacted&")}}else C=null;else C=b;return"XMLHTTP REQ ("+f+") [attempt "+E+"]: "+c+`
`+h+`
`+C})}function af(o,c,h,f,E,b,C){o.info(function(){return"XMLHTTP RESP ("+f+") [ attempt "+E+"]: "+c+`
`+h+`
`+b+" "+C})}function jt(o,c,h,f){o.info(function(){return"XMLHTTP TEXT ("+c+"): "+uf(o,h)+(f?" "+f:"")})}function cf(o,c){o.info(function(){return"TIMEOUT: "+c})}Sn.prototype.info=function(){};function uf(o,c){if(!o.g)return c;if(!c)return null;try{var h=JSON.parse(c);if(h){for(o=0;o<h.length;o++)if(Array.isArray(h[o])){var f=h[o];if(!(2>f.length)){var E=f[1];if(Array.isArray(E)&&!(1>E.length)){var b=E[0];if(b!="noop"&&b!="stop"&&b!="close")for(var C=1;C<E.length;C++)E[C]=""}}}}return es(h)}catch{return c}}var Ar={NO_ERROR:0,gb:1,tb:2,sb:3,nb:4,rb:5,ub:6,Ia:7,TIMEOUT:8,xb:9},ka={lb:"complete",Hb:"success",Ja:"error",Ia:"abort",zb:"ready",Ab:"readystatechange",TIMEOUT:"timeout",vb:"incrementaldata",yb:"progress",ob:"downloadprogress",Pb:"uploadprogress"},is;function br(){}k(br,ts),br.prototype.g=function(){return new XMLHttpRequest},br.prototype.i=function(){return{}},is=new br;function it(o,c,h,f){this.j=o,this.i=c,this.l=h,this.R=f||1,this.U=new In(this),this.I=45e3,this.H=null,this.o=!1,this.m=this.A=this.v=this.L=this.F=this.S=this.B=null,this.D=[],this.g=null,this.C=0,this.s=this.u=null,this.X=-1,this.J=!1,this.O=0,this.M=null,this.W=this.K=this.T=this.P=!1,this.h=new Na}function Na(){this.i=null,this.g="",this.h=!1}var Da={},ss={};function os(o,c,h){o.L=1,o.v=Cr(je(c)),o.m=h,o.P=!0,Va(o,null)}function Va(o,c){o.F=Date.now(),Rr(o),o.A=je(o.v);var h=o.A,f=o.R;Array.isArray(f)||(f=[String(f)]),Wa(h.i,"t",f),o.C=0,h=o.j.J,o.h=new Na,o.g=hc(o.j,h?c:null,!o.m),0<o.O&&(o.M=new nf(A(o.Y,o,o.g),o.O)),c=o.U,h=o.g,f=o.ca;var E="readystatechange";Array.isArray(E)||(E&&(Ea[0]=E.toString()),E=Ea);for(var b=0;b<E.length;b++){var C=ma(h,E[b],f||c.handleEvent,!1,c.h||c);if(!C)break;c.g[C.key]=C}c=o.H?g(o.H):{},o.m?(o.u||(o.u="POST"),c["Content-Type"]="application/x-www-form-urlencoded",o.g.ea(o.A,o.u,o.m,c)):(o.u="GET",o.g.ea(o.A,o.u,null,c)),bn(),of(o.i,o.u,o.A,o.l,o.R,o.m)}it.prototype.ca=function(o){o=o.target;const c=this.M;c&&ze(o)==3?c.j():this.Y(o)},it.prototype.Y=function(o){try{if(o==this.g)e:{const _e=ze(this.g);var c=this.g.Ba();const Kt=this.g.Z();if(!(3>_e)&&(_e!=3||this.g&&(this.h.h||this.g.oa()||ec(this.g)))){this.J||_e!=4||c==7||(c==8||0>=Kt?bn(3):bn(2)),as(this);var h=this.g.Z();this.X=h;t:if(Oa(this)){var f=ec(this.g);o="";var E=f.length,b=ze(this.g)==4;if(!this.h.i){if(typeof TextDecoder>"u"){Et(this),Pn(this);var C="";break t}this.h.i=new u.TextDecoder}for(c=0;c<E;c++)this.h.h=!0,o+=this.h.i.decode(f[c],{stream:!(b&&c==E-1)});f.length=0,this.h.g+=o,this.C=0,C=this.h.g}else C=this.g.oa();if(this.o=h==200,af(this.i,this.u,this.A,this.l,this.R,_e,h),this.o){if(this.T&&!this.K){t:{if(this.g){var Q,ce=this.g;if((Q=ce.g?ce.g.getResponseHeader("X-HTTP-Initial-Response"):null)&&!K(Q)){var j=Q;break t}}j=null}if(h=j)jt(this.i,this.l,h,"Initial handshake response via X-HTTP-Initial-Response"),this.K=!0,cs(this,h);else{this.o=!1,this.s=3,Ie(12),Et(this),Pn(this);break e}}if(this.P){h=!0;let De;for(;!this.J&&this.C<C.length;)if(De=lf(this,C),De==ss){_e==4&&(this.s=4,Ie(14),h=!1),jt(this.i,this.l,null,"[Incomplete Response]");break}else if(De==Da){this.s=4,Ie(15),jt(this.i,this.l,C,"[Invalid Chunk]"),h=!1;break}else jt(this.i,this.l,De,null),cs(this,De);if(Oa(this)&&this.C!=0&&(this.h.g=this.h.g.slice(this.C),this.C=0),_e!=4||C.length!=0||this.h.h||(this.s=1,Ie(16),h=!1),this.o=this.o&&h,!h)jt(this.i,this.l,C,"[Invalid Chunked Response]"),Et(this),Pn(this);else if(0<C.length&&!this.W){this.W=!0;var me=this.j;me.g==this&&me.ba&&!me.M&&(me.j.info("Great, no buffering proxy detected. Bytes received: "+C.length),ps(me),me.M=!0,Ie(11))}}else jt(this.i,this.l,C,null),cs(this,C);_e==4&&Et(this),this.o&&!this.J&&(_e==4?ac(this.j,this):(this.o=!1,Rr(this)))}else Sf(this.g),h==400&&0<C.indexOf("Unknown SID")?(this.s=3,Ie(12)):(this.s=0,Ie(13)),Et(this),Pn(this)}}}catch{}finally{}};function Oa(o){return o.g?o.u=="GET"&&o.L!=2&&o.j.Ca:!1}function lf(o,c){var h=o.C,f=c.indexOf(`
`,h);return f==-1?ss:(h=Number(c.substring(h,f)),isNaN(h)?Da:(f+=1,f+h>c.length?ss:(c=c.slice(f,f+h),o.C=f+h,c)))}it.prototype.cancel=function(){this.J=!0,Et(this)};function Rr(o){o.S=Date.now()+o.I,La(o,o.I)}function La(o,c){if(o.B!=null)throw Error("WatchDog timer not null");o.B=Rn(A(o.ba,o),c)}function as(o){o.B&&(u.clearTimeout(o.B),o.B=null)}it.prototype.ba=function(){this.B=null;const o=Date.now();0<=o-this.S?(cf(this.i,this.A),this.L!=2&&(bn(),Ie(17)),Et(this),this.s=2,Pn(this)):La(this,this.S-o)};function Pn(o){o.j.G==0||o.J||ac(o.j,o)}function Et(o){as(o);var c=o.M;c&&typeof c.ma=="function"&&c.ma(),o.M=null,Ia(o.U),o.g&&(c=o.g,o.g=null,c.abort(),c.ma())}function cs(o,c){try{var h=o.j;if(h.G!=0&&(h.g==o||us(h.h,o))){if(!o.K&&us(h.h,o)&&h.G==3){try{var f=h.Da.g.parse(c)}catch{f=null}if(Array.isArray(f)&&f.length==3){var E=f;if(E[0]==0){e:if(!h.u){if(h.g)if(h.g.F+3e3<o.F)Lr(h),Vr(h);else break e;fs(h),Ie(18)}}else h.za=E[1],0<h.za-h.T&&37500>E[2]&&h.F&&h.v==0&&!h.C&&(h.C=Rn(A(h.Za,h),6e3));if(1>=Fa(h.h)&&h.ca){try{h.ca()}catch{}h.ca=void 0}}else At(h,11)}else if((o.K||h.g==o)&&Lr(h),!K(c))for(E=h.Da.g.parse(c),c=0;c<E.length;c++){let j=E[c];if(h.T=j[0],j=j[1],h.G==2)if(j[0]=="c"){h.K=j[1],h.ia=j[2];const me=j[3];me!=null&&(h.la=me,h.j.info("VER="+h.la));const _e=j[4];_e!=null&&(h.Aa=_e,h.j.info("SVER="+h.Aa));const Kt=j[5];Kt!=null&&typeof Kt=="number"&&0<Kt&&(f=1.5*Kt,h.L=f,h.j.info("backChannelRequestTimeoutMs_="+f)),f=h;const De=o.g;if(De){const xr=De.g?De.g.getResponseHeader("X-Client-Wire-Protocol"):null;if(xr){var b=f.h;b.g||xr.indexOf("spdy")==-1&&xr.indexOf("quic")==-1&&xr.indexOf("h2")==-1||(b.j=b.l,b.g=new Set,b.h&&(ls(b,b.h),b.h=null))}if(f.D){const gs=De.g?De.g.getResponseHeader("X-HTTP-Session-Id"):null;gs&&(f.ya=gs,J(f.I,f.D,gs))}}h.G=3,h.l&&h.l.ua(),h.ba&&(h.R=Date.now()-o.F,h.j.info("Handshake RTT: "+h.R+"ms")),f=h;var C=o;if(f.qa=lc(f,f.J?f.ia:null,f.W),C.K){Ua(f.h,C);var Q=C,ce=f.L;ce&&(Q.I=ce),Q.B&&(as(Q),Rr(Q)),f.g=C}else sc(f);0<h.i.length&&Or(h)}else j[0]!="stop"&&j[0]!="close"||At(h,7);else h.G==3&&(j[0]=="stop"||j[0]=="close"?j[0]=="stop"?At(h,7):ds(h):j[0]!="noop"&&h.l&&h.l.ta(j),h.v=0)}}bn(4)}catch{}}var hf=class{constructor(o,c){this.g=o,this.map=c}};function Ma(o){this.l=o||10,u.PerformanceNavigationTiming?(o=u.performance.getEntriesByType("navigation"),o=0<o.length&&(o[0].nextHopProtocol=="hq"||o[0].nextHopProtocol=="h2")):o=!!(u.chrome&&u.chrome.loadTimes&&u.chrome.loadTimes()&&u.chrome.loadTimes().wasFetchedViaSpdy),this.j=o?this.l:1,this.g=null,1<this.j&&(this.g=new Set),this.h=null,this.i=[]}function xa(o){return o.h?!0:o.g?o.g.size>=o.j:!1}function Fa(o){return o.h?1:o.g?o.g.size:0}function us(o,c){return o.h?o.h==c:o.g?o.g.has(c):!1}function ls(o,c){o.g?o.g.add(c):o.h=c}function Ua(o,c){o.h&&o.h==c?o.h=null:o.g&&o.g.has(c)&&o.g.delete(c)}Ma.prototype.cancel=function(){if(this.i=Ba(this),this.h)this.h.cancel(),this.h=null;else if(this.g&&this.g.size!==0){for(const o of this.g.values())o.cancel();this.g.clear()}};function Ba(o){if(o.h!=null)return o.i.concat(o.h.D);if(o.g!=null&&o.g.size!==0){let c=o.i;for(const h of o.g.values())c=c.concat(h.D);return c}return O(o.i)}function df(o){if(o.V&&typeof o.V=="function")return o.V();if(typeof Map<"u"&&o instanceof Map||typeof Set<"u"&&o instanceof Set)return Array.from(o.values());if(typeof o=="string")return o.split("");if(l(o)){for(var c=[],h=o.length,f=0;f<h;f++)c.push(o[f]);return c}c=[],h=0;for(f in o)c[h++]=o[f];return c}function ff(o){if(o.na&&typeof o.na=="function")return o.na();if(!o.V||typeof o.V!="function"){if(typeof Map<"u"&&o instanceof Map)return Array.from(o.keys());if(!(typeof Set<"u"&&o instanceof Set)){if(l(o)||typeof o=="string"){var c=[];o=o.length;for(var h=0;h<o;h++)c.push(h);return c}c=[],h=0;for(const f in o)c[h++]=f;return c}}}function qa(o,c){if(o.forEach&&typeof o.forEach=="function")o.forEach(c,void 0);else if(l(o)||typeof o=="string")Array.prototype.forEach.call(o,c,void 0);else for(var h=ff(o),f=df(o),E=f.length,b=0;b<E;b++)c.call(void 0,f[b],h&&h[b],o)}var $a=RegExp("^(?:([^:/?#.]+):)?(?://(?:([^\\\\/?#]*)@)?([^\\\\/?#]*?)(?::([0-9]+))?(?=[\\\\/?#]|$))?([^?#]+)?(?:\\?([^#]*))?(?:#([\\s\\S]*))?$");function pf(o,c){if(o){o=o.split("&");for(var h=0;h<o.length;h++){var f=o[h].indexOf("="),E=null;if(0<=f){var b=o[h].substring(0,f);E=o[h].substring(f+1)}else b=o[h];c(b,E?decodeURIComponent(E.replace(/\+/g," ")):"")}}}function It(o){if(this.g=this.o=this.j="",this.s=null,this.m=this.l="",this.h=!1,o instanceof It){this.h=o.h,Sr(this,o.j),this.o=o.o,this.g=o.g,Pr(this,o.s),this.l=o.l;var c=o.i,h=new Nn;h.i=c.i,c.g&&(h.g=new Map(c.g),h.h=c.h),ja(this,h),this.m=o.m}else o&&(c=String(o).match($a))?(this.h=!1,Sr(this,c[1]||"",!0),this.o=Cn(c[2]||""),this.g=Cn(c[3]||"",!0),Pr(this,c[4]),this.l=Cn(c[5]||"",!0),ja(this,c[6]||"",!0),this.m=Cn(c[7]||"")):(this.h=!1,this.i=new Nn(null,this.h))}It.prototype.toString=function(){var o=[],c=this.j;c&&o.push(kn(c,za,!0),":");var h=this.g;return(h||c=="file")&&(o.push("//"),(c=this.o)&&o.push(kn(c,za,!0),"@"),o.push(encodeURIComponent(String(h)).replace(/%25([0-9a-fA-F]{2})/g,"%$1")),h=this.s,h!=null&&o.push(":",String(h))),(h=this.l)&&(this.g&&h.charAt(0)!="/"&&o.push("/"),o.push(kn(h,h.charAt(0)=="/"?_f:mf,!0))),(h=this.i.toString())&&o.push("?",h),(h=this.m)&&o.push("#",kn(h,vf)),o.join("")};function je(o){return new It(o)}function Sr(o,c,h){o.j=h?Cn(c,!0):c,o.j&&(o.j=o.j.replace(/:$/,""))}function Pr(o,c){if(c){if(c=Number(c),isNaN(c)||0>c)throw Error("Bad port number "+c);o.s=c}else o.s=null}function ja(o,c,h){c instanceof Nn?(o.i=c,wf(o.i,o.h)):(h||(c=kn(c,yf)),o.i=new Nn(c,o.h))}function J(o,c,h){o.i.set(c,h)}function Cr(o){return J(o,"zx",Math.floor(2147483648*Math.random()).toString(36)+Math.abs(Math.floor(2147483648*Math.random())^Date.now()).toString(36)),o}function Cn(o,c){return o?c?decodeURI(o.replace(/%25/g,"%2525")):decodeURIComponent(o):""}function kn(o,c,h){return typeof o=="string"?(o=encodeURI(o).replace(c,gf),h&&(o=o.replace(/%25([0-9a-fA-F]{2})/g,"%$1")),o):null}function gf(o){return o=o.charCodeAt(0),"%"+(o>>4&15).toString(16)+(o&15).toString(16)}var za=/[#\/\?@]/g,mf=/[#\?:]/g,_f=/[#\?]/g,yf=/[#\?@]/g,vf=/#/g;function Nn(o,c){this.h=this.g=null,this.i=o||null,this.j=!!c}function st(o){o.g||(o.g=new Map,o.h=0,o.i&&pf(o.i,function(c,h){o.add(decodeURIComponent(c.replace(/\+/g," ")),h)}))}n=Nn.prototype,n.add=function(o,c){st(this),this.i=null,o=zt(this,o);var h=this.g.get(o);return h||this.g.set(o,h=[]),h.push(c),this.h+=1,this};function Ha(o,c){st(o),c=zt(o,c),o.g.has(c)&&(o.i=null,o.h-=o.g.get(c).length,o.g.delete(c))}function Ka(o,c){return st(o),c=zt(o,c),o.g.has(c)}n.forEach=function(o,c){st(this),this.g.forEach(function(h,f){h.forEach(function(E){o.call(c,E,f,this)},this)},this)},n.na=function(){st(this);const o=Array.from(this.g.values()),c=Array.from(this.g.keys()),h=[];for(let f=0;f<c.length;f++){const E=o[f];for(let b=0;b<E.length;b++)h.push(c[f])}return h},n.V=function(o){st(this);let c=[];if(typeof o=="string")Ka(this,o)&&(c=c.concat(this.g.get(zt(this,o))));else{o=Array.from(this.g.values());for(let h=0;h<o.length;h++)c=c.concat(o[h])}return c},n.set=function(o,c){return st(this),this.i=null,o=zt(this,o),Ka(this,o)&&(this.h-=this.g.get(o).length),this.g.set(o,[c]),this.h+=1,this},n.get=function(o,c){return o?(o=this.V(o),0<o.length?String(o[0]):c):c};function Wa(o,c,h){Ha(o,c),0<h.length&&(o.i=null,o.g.set(zt(o,c),O(h)),o.h+=h.length)}n.toString=function(){if(this.i)return this.i;if(!this.g)return"";const o=[],c=Array.from(this.g.keys());for(var h=0;h<c.length;h++){var f=c[h];const b=encodeURIComponent(String(f)),C=this.V(f);for(f=0;f<C.length;f++){var E=b;C[f]!==""&&(E+="="+encodeURIComponent(String(C[f]))),o.push(E)}}return this.i=o.join("&")};function zt(o,c){return c=String(c),o.j&&(c=c.toLowerCase()),c}function wf(o,c){c&&!o.j&&(st(o),o.i=null,o.g.forEach(function(h,f){var E=f.toLowerCase();f!=E&&(Ha(this,f),Wa(this,E,h))},o)),o.j=c}function Tf(o,c){const h=new Sn;if(u.Image){const f=new Image;f.onload=S(ot,h,"TestLoadImage: loaded",!0,c,f),f.onerror=S(ot,h,"TestLoadImage: error",!1,c,f),f.onabort=S(ot,h,"TestLoadImage: abort",!1,c,f),f.ontimeout=S(ot,h,"TestLoadImage: timeout",!1,c,f),u.setTimeout(function(){f.ontimeout&&f.ontimeout()},1e4),f.src=o}else c(!1)}function Ef(o,c){const h=new Sn,f=new AbortController,E=setTimeout(()=>{f.abort(),ot(h,"TestPingServer: timeout",!1,c)},1e4);fetch(o,{signal:f.signal}).then(b=>{clearTimeout(E),b.ok?ot(h,"TestPingServer: ok",!0,c):ot(h,"TestPingServer: server error",!1,c)}).catch(()=>{clearTimeout(E),ot(h,"TestPingServer: error",!1,c)})}function ot(o,c,h,f,E){try{E&&(E.onload=null,E.onerror=null,E.onabort=null,E.ontimeout=null),f(h)}catch{}}function If(){this.g=new sf}function Af(o,c,h){const f=h||"";try{qa(o,function(E,b){let C=E;d(E)&&(C=es(E)),c.push(f+b+"="+encodeURIComponent(C))})}catch(E){throw c.push(f+"type="+encodeURIComponent("_badmap")),E}}function kr(o){this.l=o.Ub||null,this.j=o.eb||!1}k(kr,ts),kr.prototype.g=function(){return new Nr(this.l,this.j)},kr.prototype.i=(function(o){return function(){return o}})({});function Nr(o,c){ge.call(this),this.D=o,this.o=c,this.m=void 0,this.status=this.readyState=0,this.responseType=this.responseText=this.response=this.statusText="",this.onreadystatechange=null,this.u=new Headers,this.h=null,this.B="GET",this.A="",this.g=!1,this.v=this.j=this.l=null}k(Nr,ge),n=Nr.prototype,n.open=function(o,c){if(this.readyState!=0)throw this.abort(),Error("Error reopening a connection");this.B=o,this.A=c,this.readyState=1,Vn(this)},n.send=function(o){if(this.readyState!=1)throw this.abort(),Error("need to call open() first. ");this.g=!0;const c={headers:this.u,method:this.B,credentials:this.m,cache:void 0};o&&(c.body=o),(this.D||u).fetch(new Request(this.A,c)).then(this.Sa.bind(this),this.ga.bind(this))},n.abort=function(){this.response=this.responseText="",this.u=new Headers,this.status=0,this.j&&this.j.cancel("Request was aborted.").catch(()=>{}),1<=this.readyState&&this.g&&this.readyState!=4&&(this.g=!1,Dn(this)),this.readyState=0},n.Sa=function(o){if(this.g&&(this.l=o,this.h||(this.status=this.l.status,this.statusText=this.l.statusText,this.h=o.headers,this.readyState=2,Vn(this)),this.g&&(this.readyState=3,Vn(this),this.g)))if(this.responseType==="arraybuffer")o.arrayBuffer().then(this.Qa.bind(this),this.ga.bind(this));else if(typeof u.ReadableStream<"u"&&"body"in o){if(this.j=o.body.getReader(),this.o){if(this.responseType)throw Error('responseType must be empty for "streamBinaryChunks" mode responses.');this.response=[]}else this.response=this.responseText="",this.v=new TextDecoder;Ga(this)}else o.text().then(this.Ra.bind(this),this.ga.bind(this))};function Ga(o){o.j.read().then(o.Pa.bind(o)).catch(o.ga.bind(o))}n.Pa=function(o){if(this.g){if(this.o&&o.value)this.response.push(o.value);else if(!this.o){var c=o.value?o.value:new Uint8Array(0);(c=this.v.decode(c,{stream:!o.done}))&&(this.response=this.responseText+=c)}o.done?Dn(this):Vn(this),this.readyState==3&&Ga(this)}},n.Ra=function(o){this.g&&(this.response=this.responseText=o,Dn(this))},n.Qa=function(o){this.g&&(this.response=o,Dn(this))},n.ga=function(){this.g&&Dn(this)};function Dn(o){o.readyState=4,o.l=null,o.j=null,o.v=null,Vn(o)}n.setRequestHeader=function(o,c){this.u.append(o,c)},n.getResponseHeader=function(o){return this.h&&this.h.get(o.toLowerCase())||""},n.getAllResponseHeaders=function(){if(!this.h)return"";const o=[],c=this.h.entries();for(var h=c.next();!h.done;)h=h.value,o.push(h[0]+": "+h[1]),h=c.next();return o.join(`\r
`)};function Vn(o){o.onreadystatechange&&o.onreadystatechange.call(o)}Object.defineProperty(Nr.prototype,"withCredentials",{get:function(){return this.m==="include"},set:function(o){this.m=o?"include":"same-origin"}});function Qa(o){let c="";return te(o,function(h,f){c+=f,c+=":",c+=h,c+=`\r
`}),c}function hs(o,c,h){e:{for(f in h){var f=!1;break e}f=!0}f||(h=Qa(h),typeof o=="string"?h!=null&&encodeURIComponent(String(h)):J(o,c,h))}function Z(o){ge.call(this),this.headers=new Map,this.o=o||null,this.h=!1,this.v=this.g=null,this.D="",this.m=0,this.l="",this.j=this.B=this.u=this.A=!1,this.I=null,this.H="",this.J=!1}k(Z,ge);var bf=/^https?$/i,Rf=["POST","PUT"];n=Z.prototype,n.Ha=function(o){this.J=o},n.ea=function(o,c,h,f){if(this.g)throw Error("[goog.net.XhrIo] Object is active with another request="+this.D+"; newUri="+o);c=c?c.toUpperCase():"GET",this.D=o,this.l="",this.m=0,this.A=!1,this.h=!0,this.g=this.o?this.o.g():is.g(),this.v=this.o?Aa(this.o):Aa(is),this.g.onreadystatechange=A(this.Ea,this);try{this.B=!0,this.g.open(c,String(o),!0),this.B=!1}catch(b){Ja(this,b);return}if(o=h||"",h=new Map(this.headers),f)if(Object.getPrototypeOf(f)===Object.prototype)for(var E in f)h.set(E,f[E]);else if(typeof f.keys=="function"&&typeof f.get=="function")for(const b of f.keys())h.set(b,f.get(b));else throw Error("Unknown input type for opt_headers: "+String(f));f=Array.from(h.keys()).find(b=>b.toLowerCase()=="content-type"),E=u.FormData&&o instanceof u.FormData,!(0<=Array.prototype.indexOf.call(Rf,c,void 0))||f||E||h.set("Content-Type","application/x-www-form-urlencoded;charset=utf-8");for(const[b,C]of h)this.g.setRequestHeader(b,C);this.H&&(this.g.responseType=this.H),"withCredentials"in this.g&&this.g.withCredentials!==this.J&&(this.g.withCredentials=this.J);try{Za(this),this.u=!0,this.g.send(o),this.u=!1}catch(b){Ja(this,b)}};function Ja(o,c){o.h=!1,o.g&&(o.j=!0,o.g.abort(),o.j=!1),o.l=c,o.m=5,Ya(o),Dr(o)}function Ya(o){o.A||(o.A=!0,Ee(o,"complete"),Ee(o,"error"))}n.abort=function(o){this.g&&this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1,this.m=o||7,Ee(this,"complete"),Ee(this,"abort"),Dr(this))},n.N=function(){this.g&&(this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1),Dr(this,!0)),Z.aa.N.call(this)},n.Ea=function(){this.s||(this.B||this.u||this.j?Xa(this):this.bb())},n.bb=function(){Xa(this)};function Xa(o){if(o.h&&typeof a<"u"&&(!o.v[1]||ze(o)!=4||o.Z()!=2)){if(o.u&&ze(o)==4)wa(o.Ea,0,o);else if(Ee(o,"readystatechange"),ze(o)==4){o.h=!1;try{const C=o.Z();e:switch(C){case 200:case 201:case 202:case 204:case 206:case 304:case 1223:var c=!0;break e;default:c=!1}var h;if(!(h=c)){var f;if(f=C===0){var E=String(o.D).match($a)[1]||null;!E&&u.self&&u.self.location&&(E=u.self.location.protocol.slice(0,-1)),f=!bf.test(E?E.toLowerCase():"")}h=f}if(h)Ee(o,"complete"),Ee(o,"success");else{o.m=6;try{var b=2<ze(o)?o.g.statusText:""}catch{b=""}o.l=b+" ["+o.Z()+"]",Ya(o)}}finally{Dr(o)}}}}function Dr(o,c){if(o.g){Za(o);const h=o.g,f=o.v[0]?()=>{}:null;o.g=null,o.v=null,c||Ee(o,"ready");try{h.onreadystatechange=f}catch{}}}function Za(o){o.I&&(u.clearTimeout(o.I),o.I=null)}n.isActive=function(){return!!this.g};function ze(o){return o.g?o.g.readyState:0}n.Z=function(){try{return 2<ze(this)?this.g.status:-1}catch{return-1}},n.oa=function(){try{return this.g?this.g.responseText:""}catch{return""}},n.Oa=function(o){if(this.g){var c=this.g.responseText;return o&&c.indexOf(o)==0&&(c=c.substring(o.length)),rf(c)}};function ec(o){try{if(!o.g)return null;if("response"in o.g)return o.g.response;switch(o.H){case"":case"text":return o.g.responseText;case"arraybuffer":if("mozResponseArrayBuffer"in o.g)return o.g.mozResponseArrayBuffer}return null}catch{return null}}function Sf(o){const c={};o=(o.g&&2<=ze(o)&&o.g.getAllResponseHeaders()||"").split(`\r
`);for(let f=0;f<o.length;f++){if(K(o[f]))continue;var h=T(o[f]);const E=h[0];if(h=h[1],typeof h!="string")continue;h=h.trim();const b=c[E]||[];c[E]=b,b.push(h)}w(c,function(f){return f.join(", ")})}n.Ba=function(){return this.m},n.Ka=function(){return typeof this.l=="string"?this.l:String(this.l)};function On(o,c,h){return h&&h.internalChannelParams&&h.internalChannelParams[o]||c}function tc(o){this.Aa=0,this.i=[],this.j=new Sn,this.ia=this.qa=this.I=this.W=this.g=this.ya=this.D=this.H=this.m=this.S=this.o=null,this.Ya=this.U=0,this.Va=On("failFast",!1,o),this.F=this.C=this.u=this.s=this.l=null,this.X=!0,this.za=this.T=-1,this.Y=this.v=this.B=0,this.Ta=On("baseRetryDelayMs",5e3,o),this.cb=On("retryDelaySeedMs",1e4,o),this.Wa=On("forwardChannelMaxRetries",2,o),this.wa=On("forwardChannelRequestTimeoutMs",2e4,o),this.pa=o&&o.xmlHttpFactory||void 0,this.Xa=o&&o.Tb||void 0,this.Ca=o&&o.useFetchStreams||!1,this.L=void 0,this.J=o&&o.supportsCrossDomainXhr||!1,this.K="",this.h=new Ma(o&&o.concurrentRequestLimit),this.Da=new If,this.P=o&&o.fastHandshake||!1,this.O=o&&o.encodeInitMessageHeaders||!1,this.P&&this.O&&(this.O=!1),this.Ua=o&&o.Rb||!1,o&&o.xa&&this.j.xa(),o&&o.forceLongPolling&&(this.X=!1),this.ba=!this.P&&this.X&&o&&o.detectBufferingProxy||!1,this.ja=void 0,o&&o.longPollingTimeout&&0<o.longPollingTimeout&&(this.ja=o.longPollingTimeout),this.ca=void 0,this.R=0,this.M=!1,this.ka=this.A=null}n=tc.prototype,n.la=8,n.G=1,n.connect=function(o,c,h,f){Ie(0),this.W=o,this.H=c||{},h&&f!==void 0&&(this.H.OSID=h,this.H.OAID=f),this.F=this.X,this.I=lc(this,null,this.W),Or(this)};function ds(o){if(nc(o),o.G==3){var c=o.U++,h=je(o.I);if(J(h,"SID",o.K),J(h,"RID",c),J(h,"TYPE","terminate"),Ln(o,h),c=new it(o,o.j,c),c.L=2,c.v=Cr(je(h)),h=!1,u.navigator&&u.navigator.sendBeacon)try{h=u.navigator.sendBeacon(c.v.toString(),"")}catch{}!h&&u.Image&&(new Image().src=c.v,h=!0),h||(c.g=hc(c.j,null),c.g.ea(c.v)),c.F=Date.now(),Rr(c)}uc(o)}function Vr(o){o.g&&(ps(o),o.g.cancel(),o.g=null)}function nc(o){Vr(o),o.u&&(u.clearTimeout(o.u),o.u=null),Lr(o),o.h.cancel(),o.s&&(typeof o.s=="number"&&u.clearTimeout(o.s),o.s=null)}function Or(o){if(!xa(o.h)&&!o.s){o.s=!0;var c=o.Ga;wn||ga(),Tn||(wn(),Tn=!0),Ki.add(c,o),o.B=0}}function Pf(o,c){return Fa(o.h)>=o.h.j-(o.s?1:0)?!1:o.s?(o.i=c.D.concat(o.i),!0):o.G==1||o.G==2||o.B>=(o.Va?0:o.Wa)?!1:(o.s=Rn(A(o.Ga,o,c),cc(o,o.B)),o.B++,!0)}n.Ga=function(o){if(this.s)if(this.s=null,this.G==1){if(!o){this.U=Math.floor(1e5*Math.random()),o=this.U++;const E=new it(this,this.j,o);let b=this.o;if(this.S&&(b?(b=g(b),y(b,this.S)):b=this.S),this.m!==null||this.O||(E.H=b,b=null),this.P)e:{for(var c=0,h=0;h<this.i.length;h++){t:{var f=this.i[h];if("__data__"in f.map&&(f=f.map.__data__,typeof f=="string")){f=f.length;break t}f=void 0}if(f===void 0)break;if(c+=f,4096<c){c=h;break e}if(c===4096||h===this.i.length-1){c=h+1;break e}}c=1e3}else c=1e3;c=ic(this,E,c),h=je(this.I),J(h,"RID",o),J(h,"CVER",22),this.D&&J(h,"X-HTTP-Session-Id",this.D),Ln(this,h),b&&(this.O?c="headers="+encodeURIComponent(String(Qa(b)))+"&"+c:this.m&&hs(h,this.m,b)),ls(this.h,E),this.Ua&&J(h,"TYPE","init"),this.P?(J(h,"$req",c),J(h,"SID","null"),E.T=!0,os(E,h,null)):os(E,h,c),this.G=2}}else this.G==3&&(o?rc(this,o):this.i.length==0||xa(this.h)||rc(this))};function rc(o,c){var h;c?h=c.l:h=o.U++;const f=je(o.I);J(f,"SID",o.K),J(f,"RID",h),J(f,"AID",o.T),Ln(o,f),o.m&&o.o&&hs(f,o.m,o.o),h=new it(o,o.j,h,o.B+1),o.m===null&&(h.H=o.o),c&&(o.i=c.D.concat(o.i)),c=ic(o,h,1e3),h.I=Math.round(.5*o.wa)+Math.round(.5*o.wa*Math.random()),ls(o.h,h),os(h,f,c)}function Ln(o,c){o.H&&te(o.H,function(h,f){J(c,f,h)}),o.l&&qa({},function(h,f){J(c,f,h)})}function ic(o,c,h){h=Math.min(o.i.length,h);var f=o.l?A(o.l.Na,o.l,o):null;e:{var E=o.i;let b=-1;for(;;){const C=["count="+h];b==-1?0<h?(b=E[0].g,C.push("ofs="+b)):b=0:C.push("ofs="+b);let Q=!0;for(let ce=0;ce<h;ce++){let j=E[ce].g;const me=E[ce].map;if(j-=b,0>j)b=Math.max(0,E[ce].g-100),Q=!1;else try{Af(me,C,"req"+j+"_")}catch{f&&f(me)}}if(Q){f=C.join("&");break e}}}return o=o.i.splice(0,h),c.D=o,f}function sc(o){if(!o.g&&!o.u){o.Y=1;var c=o.Fa;wn||ga(),Tn||(wn(),Tn=!0),Ki.add(c,o),o.v=0}}function fs(o){return o.g||o.u||3<=o.v?!1:(o.Y++,o.u=Rn(A(o.Fa,o),cc(o,o.v)),o.v++,!0)}n.Fa=function(){if(this.u=null,oc(this),this.ba&&!(this.M||this.g==null||0>=this.R)){var o=2*this.R;this.j.info("BP detection timer enabled: "+o),this.A=Rn(A(this.ab,this),o)}},n.ab=function(){this.A&&(this.A=null,this.j.info("BP detection timeout reached."),this.j.info("Buffering proxy detected and switch to long-polling!"),this.F=!1,this.M=!0,Ie(10),Vr(this),oc(this))};function ps(o){o.A!=null&&(u.clearTimeout(o.A),o.A=null)}function oc(o){o.g=new it(o,o.j,"rpc",o.Y),o.m===null&&(o.g.H=o.o),o.g.O=0;var c=je(o.qa);J(c,"RID","rpc"),J(c,"SID",o.K),J(c,"AID",o.T),J(c,"CI",o.F?"0":"1"),!o.F&&o.ja&&J(c,"TO",o.ja),J(c,"TYPE","xmlhttp"),Ln(o,c),o.m&&o.o&&hs(c,o.m,o.o),o.L&&(o.g.I=o.L);var h=o.g;o=o.ia,h.L=1,h.v=Cr(je(c)),h.m=null,h.P=!0,Va(h,o)}n.Za=function(){this.C!=null&&(this.C=null,Vr(this),fs(this),Ie(19))};function Lr(o){o.C!=null&&(u.clearTimeout(o.C),o.C=null)}function ac(o,c){var h=null;if(o.g==c){Lr(o),ps(o),o.g=null;var f=2}else if(us(o.h,c))h=c.D,Ua(o.h,c),f=1;else return;if(o.G!=0){if(c.o)if(f==1){h=c.m?c.m.length:0,c=Date.now()-c.F;var E=o.B;f=Ir(),Ee(f,new Ca(f,h)),Or(o)}else sc(o);else if(E=c.s,E==3||E==0&&0<c.X||!(f==1&&Pf(o,c)||f==2&&fs(o)))switch(h&&0<h.length&&(c=o.h,c.i=c.i.concat(h)),E){case 1:At(o,5);break;case 4:At(o,10);break;case 3:At(o,6);break;default:At(o,2)}}}function cc(o,c){let h=o.Ta+Math.floor(Math.random()*o.cb);return o.isActive()||(h*=2),h*c}function At(o,c){if(o.j.info("Error code "+c),c==2){var h=A(o.fb,o),f=o.Xa;const E=!f;f=new It(f||"//www.google.com/images/cleardot.gif"),u.location&&u.location.protocol=="http"||Sr(f,"https"),Cr(f),E?Tf(f.toString(),h):Ef(f.toString(),h)}else Ie(2);o.G=0,o.l&&o.l.sa(c),uc(o),nc(o)}n.fb=function(o){o?(this.j.info("Successfully pinged google.com"),Ie(2)):(this.j.info("Failed to ping google.com"),Ie(1))};function uc(o){if(o.G=0,o.ka=[],o.l){const c=Ba(o.h);(c.length!=0||o.i.length!=0)&&(N(o.ka,c),N(o.ka,o.i),o.h.i.length=0,O(o.i),o.i.length=0),o.l.ra()}}function lc(o,c,h){var f=h instanceof It?je(h):new It(h);if(f.g!="")c&&(f.g=c+"."+f.g),Pr(f,f.s);else{var E=u.location;f=E.protocol,c=c?c+"."+E.hostname:E.hostname,E=+E.port;var b=new It(null);f&&Sr(b,f),c&&(b.g=c),E&&Pr(b,E),h&&(b.l=h),f=b}return h=o.D,c=o.ya,h&&c&&J(f,h,c),J(f,"VER",o.la),Ln(o,f),f}function hc(o,c,h){if(c&&!o.J)throw Error("Can't create secondary domain capable XhrIo object.");return c=o.Ca&&!o.pa?new Z(new kr({eb:h})):new Z(o.pa),c.Ha(o.J),c}n.isActive=function(){return!!this.l&&this.l.isActive(this)};function dc(){}n=dc.prototype,n.ua=function(){},n.ta=function(){},n.sa=function(){},n.ra=function(){},n.isActive=function(){return!0},n.Na=function(){};function Mr(){}Mr.prototype.g=function(o,c){return new Pe(o,c)};function Pe(o,c){ge.call(this),this.g=new tc(c),this.l=o,this.h=c&&c.messageUrlParams||null,o=c&&c.messageHeaders||null,c&&c.clientProtocolHeaderRequired&&(o?o["X-Client-Protocol"]="webchannel":o={"X-Client-Protocol":"webchannel"}),this.g.o=o,o=c&&c.initMessageHeaders||null,c&&c.messageContentType&&(o?o["X-WebChannel-Content-Type"]=c.messageContentType:o={"X-WebChannel-Content-Type":c.messageContentType}),c&&c.va&&(o?o["X-WebChannel-Client-Profile"]=c.va:o={"X-WebChannel-Client-Profile":c.va}),this.g.S=o,(o=c&&c.Sb)&&!K(o)&&(this.g.m=o),this.v=c&&c.supportsCrossDomainXhr||!1,this.u=c&&c.sendRawJson||!1,(c=c&&c.httpSessionIdParam)&&!K(c)&&(this.g.D=c,o=this.h,o!==null&&c in o&&(o=this.h,c in o&&delete o[c])),this.j=new Ht(this)}k(Pe,ge),Pe.prototype.m=function(){this.g.l=this.j,this.v&&(this.g.J=!0),this.g.connect(this.l,this.h||void 0)},Pe.prototype.close=function(){ds(this.g)},Pe.prototype.o=function(o){var c=this.g;if(typeof o=="string"){var h={};h.__data__=o,o=h}else this.u&&(h={},h.__data__=es(o),o=h);c.i.push(new hf(c.Ya++,o)),c.G==3&&Or(c)},Pe.prototype.N=function(){this.g.l=null,delete this.j,ds(this.g),delete this.g,Pe.aa.N.call(this)};function fc(o){ns.call(this),o.__headers__&&(this.headers=o.__headers__,this.statusCode=o.__status__,delete o.__headers__,delete o.__status__);var c=o.__sm__;if(c){e:{for(const h in c){o=h;break e}o=void 0}(this.i=o)&&(o=this.i,c=c!==null&&o in c?c[o]:void 0),this.data=c}else this.data=o}k(fc,ns);function pc(){rs.call(this),this.status=1}k(pc,rs);function Ht(o){this.g=o}k(Ht,dc),Ht.prototype.ua=function(){Ee(this.g,"a")},Ht.prototype.ta=function(o){Ee(this.g,new fc(o))},Ht.prototype.sa=function(o){Ee(this.g,new pc)},Ht.prototype.ra=function(){Ee(this.g,"b")},Mr.prototype.createWebChannel=Mr.prototype.g,Pe.prototype.send=Pe.prototype.o,Pe.prototype.open=Pe.prototype.m,Pe.prototype.close=Pe.prototype.close,fl=function(){return new Mr},dl=function(){return Ir()},hl=Tt,zs={mb:0,pb:1,qb:2,Jb:3,Ob:4,Lb:5,Mb:6,Kb:7,Ib:8,Nb:9,PROXY:10,NOPROXY:11,Gb:12,Cb:13,Db:14,Bb:15,Eb:16,Fb:17,ib:18,hb:19,jb:20},Ar.NO_ERROR=0,Ar.TIMEOUT=8,Ar.HTTP_ERROR=6,Kr=Ar,ka.COMPLETE="complete",ll=ka,ba.EventType=An,An.OPEN="a",An.CLOSE="b",An.ERROR="c",An.MESSAGE="d",ge.prototype.listen=ge.prototype.K,xn=ba,Z.prototype.listenOnce=Z.prototype.L,Z.prototype.getLastError=Z.prototype.Ka,Z.prototype.getLastErrorCode=Z.prototype.Ba,Z.prototype.getStatus=Z.prototype.Z,Z.prototype.getResponseJson=Z.prototype.Oa,Z.prototype.getResponseText=Z.prototype.oa,Z.prototype.send=Z.prototype.ea,Z.prototype.setWithCredentials=Z.prototype.Ha,ul=Z}).apply(typeof Fr<"u"?Fr:typeof self<"u"?self:typeof window<"u"?window:{});const Rc="@firebase/firestore";/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ve{constructor(e){this.uid=e}isAuthenticated(){return this.uid!=null}toKey(){return this.isAuthenticated()?"uid:"+this.uid:"anonymous-user"}isEqual(e){return e.uid===this.uid}}ve.UNAUTHENTICATED=new ve(null),ve.GOOGLE_CREDENTIALS=new ve("google-credentials-uid"),ve.FIRST_PARTY=new ve("first-party-uid"),ve.MOCK_USER=new ve("mock-user");/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let fn="10.14.0";/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Dt=new po("@firebase/firestore");function Mn(){return Dt.logLevel}function V(n,...e){if(Dt.logLevel<=q.DEBUG){const t=e.map(mo);Dt.debug(`Firestore (${fn}): ${n}`,...t)}}function Ze(n,...e){if(Dt.logLevel<=q.ERROR){const t=e.map(mo);Dt.error(`Firestore (${fn}): ${n}`,...t)}}function rn(n,...e){if(Dt.logLevel<=q.WARN){const t=e.map(mo);Dt.warn(`Firestore (${fn}): ${n}`,...t)}}function mo(n){if(typeof n=="string")return n;try{/**
* @license
* Copyright 2020 Google LLC
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/return(function(t){return JSON.stringify(t)})(n)}catch{return n}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function x(n="Unexpected state"){const e=`FIRESTORE (${fn}) INTERNAL ASSERTION FAILED: `+n;throw Ze(e),new Error(e)}function G(n,e){n||x()}function U(n,e){return n}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const R={OK:"ok",CANCELLED:"cancelled",UNKNOWN:"unknown",INVALID_ARGUMENT:"invalid-argument",DEADLINE_EXCEEDED:"deadline-exceeded",NOT_FOUND:"not-found",ALREADY_EXISTS:"already-exists",PERMISSION_DENIED:"permission-denied",UNAUTHENTICATED:"unauthenticated",RESOURCE_EXHAUSTED:"resource-exhausted",FAILED_PRECONDITION:"failed-precondition",ABORTED:"aborted",OUT_OF_RANGE:"out-of-range",UNIMPLEMENTED:"unimplemented",INTERNAL:"internal",UNAVAILABLE:"unavailable",DATA_LOSS:"data-loss"};class D extends Le{constructor(e,t){super(e,t),this.code=e,this.message=t,this.toString=()=>`${this.name}: [code=${this.code}]: ${this.message}`}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ye{constructor(){this.promise=new Promise(((e,t)=>{this.resolve=e,this.reject=t}))}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class pl{constructor(e,t){this.user=t,this.type="OAuth",this.headers=new Map,this.headers.set("Authorization",`Bearer ${e}`)}}class sg{getToken(){return Promise.resolve(null)}invalidateToken(){}start(e,t){e.enqueueRetryable((()=>t(ve.UNAUTHENTICATED)))}shutdown(){}}class og{constructor(e){this.token=e,this.changeListener=null}getToken(){return Promise.resolve(this.token)}invalidateToken(){}start(e,t){this.changeListener=t,e.enqueueRetryable((()=>t(this.token.user)))}shutdown(){this.changeListener=null}}class ag{constructor(e){this.t=e,this.currentUser=ve.UNAUTHENTICATED,this.i=0,this.forceRefresh=!1,this.auth=null}start(e,t){G(this.o===void 0);let r=this.i;const i=l=>this.i!==r?(r=this.i,t(l)):Promise.resolve();let s=new Ye;this.o=()=>{this.i++,this.currentUser=this.u(),s.resolve(),s=new Ye,e.enqueueRetryable((()=>i(this.currentUser)))};const a=()=>{const l=s;e.enqueueRetryable((async()=>{await l.promise,await i(this.currentUser)}))},u=l=>{V("FirebaseAuthCredentialsProvider","Auth detected"),this.auth=l,this.o&&(this.auth.addAuthTokenListener(this.o),a())};this.t.onInit((l=>u(l))),setTimeout((()=>{if(!this.auth){const l=this.t.getImmediate({optional:!0});l?u(l):(V("FirebaseAuthCredentialsProvider","Auth not yet detected"),s.resolve(),s=new Ye)}}),0),a()}getToken(){const e=this.i,t=this.forceRefresh;return this.forceRefresh=!1,this.auth?this.auth.getToken(t).then((r=>this.i!==e?(V("FirebaseAuthCredentialsProvider","getToken aborted due to token change."),this.getToken()):r?(G(typeof r.accessToken=="string"),new pl(r.accessToken,this.currentUser)):null)):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.auth&&this.o&&this.auth.removeAuthTokenListener(this.o),this.o=void 0}u(){const e=this.auth&&this.auth.getUid();return G(e===null||typeof e=="string"),new ve(e)}}class cg{constructor(e,t,r){this.l=e,this.h=t,this.P=r,this.type="FirstParty",this.user=ve.FIRST_PARTY,this.I=new Map}T(){return this.P?this.P():null}get headers(){this.I.set("X-Goog-AuthUser",this.l);const e=this.T();return e&&this.I.set("Authorization",e),this.h&&this.I.set("X-Goog-Iam-Authorization-Token",this.h),this.I}}class ug{constructor(e,t,r){this.l=e,this.h=t,this.P=r}getToken(){return Promise.resolve(new cg(this.l,this.h,this.P))}start(e,t){e.enqueueRetryable((()=>t(ve.FIRST_PARTY)))}shutdown(){}invalidateToken(){}}class lg{constructor(e){this.value=e,this.type="AppCheck",this.headers=new Map,e&&e.length>0&&this.headers.set("x-firebase-appcheck",this.value)}}class hg{constructor(e){this.A=e,this.forceRefresh=!1,this.appCheck=null,this.R=null}start(e,t){G(this.o===void 0);const r=s=>{s.error!=null&&V("FirebaseAppCheckTokenProvider",`Error getting App Check token; using placeholder token instead. Error: ${s.error.message}`);const a=s.token!==this.R;return this.R=s.token,V("FirebaseAppCheckTokenProvider",`Received ${a?"new":"existing"} token.`),a?t(s.token):Promise.resolve()};this.o=s=>{e.enqueueRetryable((()=>r(s)))};const i=s=>{V("FirebaseAppCheckTokenProvider","AppCheck detected"),this.appCheck=s,this.o&&this.appCheck.addTokenListener(this.o)};this.A.onInit((s=>i(s))),setTimeout((()=>{if(!this.appCheck){const s=this.A.getImmediate({optional:!0});s?i(s):V("FirebaseAppCheckTokenProvider","AppCheck not yet detected")}}),0)}getToken(){const e=this.forceRefresh;return this.forceRefresh=!1,this.appCheck?this.appCheck.getToken(e).then((t=>t?(G(typeof t.token=="string"),this.R=t.token,new lg(t.token)):null)):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.appCheck&&this.o&&this.appCheck.removeTokenListener(this.o),this.o=void 0}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function dg(n){const e=typeof self<"u"&&(self.crypto||self.msCrypto),t=new Uint8Array(n);if(e&&typeof e.getRandomValues=="function")e.getRandomValues(t);else for(let r=0;r<n;r++)t[r]=Math.floor(256*Math.random());return t}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class gl{static newId(){const e="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",t=Math.floor(256/e.length)*e.length;let r="";for(;r.length<20;){const i=dg(40);for(let s=0;s<i.length;++s)r.length<20&&i[s]<t&&(r+=e.charAt(i[s]%e.length))}return r}}function z(n,e){return n<e?-1:n>e?1:0}function sn(n,e,t){return n.length===e.length&&n.every(((r,i)=>t(r,e[i])))}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class oe{constructor(e,t){if(this.seconds=e,this.nanoseconds=t,t<0)throw new D(R.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+t);if(t>=1e9)throw new D(R.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+t);if(e<-62135596800)throw new D(R.INVALID_ARGUMENT,"Timestamp seconds out of range: "+e);if(e>=253402300800)throw new D(R.INVALID_ARGUMENT,"Timestamp seconds out of range: "+e)}static now(){return oe.fromMillis(Date.now())}static fromDate(e){return oe.fromMillis(e.getTime())}static fromMillis(e){const t=Math.floor(e/1e3),r=Math.floor(1e6*(e-1e3*t));return new oe(t,r)}toDate(){return new Date(this.toMillis())}toMillis(){return 1e3*this.seconds+this.nanoseconds/1e6}_compareTo(e){return this.seconds===e.seconds?z(this.nanoseconds,e.nanoseconds):z(this.seconds,e.seconds)}isEqual(e){return e.seconds===this.seconds&&e.nanoseconds===this.nanoseconds}toString(){return"Timestamp(seconds="+this.seconds+", nanoseconds="+this.nanoseconds+")"}toJSON(){return{seconds:this.seconds,nanoseconds:this.nanoseconds}}valueOf(){const e=this.seconds- -62135596800;return String(e).padStart(12,"0")+"."+String(this.nanoseconds).padStart(9,"0")}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class F{constructor(e){this.timestamp=e}static fromTimestamp(e){return new F(e)}static min(){return new F(new oe(0,0))}static max(){return new F(new oe(253402300799,999999999))}compareTo(e){return this.timestamp._compareTo(e.timestamp)}isEqual(e){return this.timestamp.isEqual(e.timestamp)}toMicroseconds(){return 1e6*this.timestamp.seconds+this.timestamp.nanoseconds/1e3}toString(){return"SnapshotVersion("+this.timestamp.toString()+")"}toTimestamp(){return this.timestamp}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Jn{constructor(e,t,r){t===void 0?t=0:t>e.length&&x(),r===void 0?r=e.length-t:r>e.length-t&&x(),this.segments=e,this.offset=t,this.len=r}get length(){return this.len}isEqual(e){return Jn.comparator(this,e)===0}child(e){const t=this.segments.slice(this.offset,this.limit());return e instanceof Jn?e.forEach((r=>{t.push(r)})):t.push(e),this.construct(t)}limit(){return this.offset+this.length}popFirst(e){return e=e===void 0?1:e,this.construct(this.segments,this.offset+e,this.length-e)}popLast(){return this.construct(this.segments,this.offset,this.length-1)}firstSegment(){return this.segments[this.offset]}lastSegment(){return this.get(this.length-1)}get(e){return this.segments[this.offset+e]}isEmpty(){return this.length===0}isPrefixOf(e){if(e.length<this.length)return!1;for(let t=0;t<this.length;t++)if(this.get(t)!==e.get(t))return!1;return!0}isImmediateParentOf(e){if(this.length+1!==e.length)return!1;for(let t=0;t<this.length;t++)if(this.get(t)!==e.get(t))return!1;return!0}forEach(e){for(let t=this.offset,r=this.limit();t<r;t++)e(this.segments[t])}toArray(){return this.segments.slice(this.offset,this.limit())}static comparator(e,t){const r=Math.min(e.length,t.length);for(let i=0;i<r;i++){const s=e.get(i),a=t.get(i);if(s<a)return-1;if(s>a)return 1}return e.length<t.length?-1:e.length>t.length?1:0}}class Y extends Jn{construct(e,t,r){return new Y(e,t,r)}canonicalString(){return this.toArray().join("/")}toString(){return this.canonicalString()}toUriEncodedString(){return this.toArray().map(encodeURIComponent).join("/")}static fromString(...e){const t=[];for(const r of e){if(r.indexOf("//")>=0)throw new D(R.INVALID_ARGUMENT,`Invalid segment (${r}). Paths must not contain // in them.`);t.push(...r.split("/").filter((i=>i.length>0)))}return new Y(t)}static emptyPath(){return new Y([])}}const fg=/^[_a-zA-Z][_a-zA-Z0-9]*$/;class le extends Jn{construct(e,t,r){return new le(e,t,r)}static isValidIdentifier(e){return fg.test(e)}canonicalString(){return this.toArray().map((e=>(e=e.replace(/\\/g,"\\\\").replace(/`/g,"\\`"),le.isValidIdentifier(e)||(e="`"+e+"`"),e))).join(".")}toString(){return this.canonicalString()}isKeyField(){return this.length===1&&this.get(0)==="__name__"}static keyField(){return new le(["__name__"])}static fromServerFormat(e){const t=[];let r="",i=0;const s=()=>{if(r.length===0)throw new D(R.INVALID_ARGUMENT,`Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`);t.push(r),r=""};let a=!1;for(;i<e.length;){const u=e[i];if(u==="\\"){if(i+1===e.length)throw new D(R.INVALID_ARGUMENT,"Path has trailing escape character: "+e);const l=e[i+1];if(l!=="\\"&&l!=="."&&l!=="`")throw new D(R.INVALID_ARGUMENT,"Path has invalid escape sequence: "+e);r+=l,i+=2}else u==="`"?(a=!a,i++):u!=="."||a?(r+=u,i++):(s(),i++)}if(s(),a)throw new D(R.INVALID_ARGUMENT,"Unterminated ` in path: "+e);return new le(t)}static emptyPath(){return new le([])}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class L{constructor(e){this.path=e}static fromPath(e){return new L(Y.fromString(e))}static fromName(e){return new L(Y.fromString(e).popFirst(5))}static empty(){return new L(Y.emptyPath())}get collectionGroup(){return this.path.popLast().lastSegment()}hasCollectionId(e){return this.path.length>=2&&this.path.get(this.path.length-2)===e}getCollectionGroup(){return this.path.get(this.path.length-2)}getCollectionPath(){return this.path.popLast()}isEqual(e){return e!==null&&Y.comparator(this.path,e.path)===0}toString(){return this.path.toString()}static comparator(e,t){return Y.comparator(e.path,t.path)}static isDocumentKey(e){return e.length%2==0}static fromSegments(e){return new L(new Y(e.slice()))}}function pg(n,e){const t=n.toTimestamp().seconds,r=n.toTimestamp().nanoseconds+1,i=F.fromTimestamp(r===1e9?new oe(t+1,0):new oe(t,r));return new mt(i,L.empty(),e)}function gg(n){return new mt(n.readTime,n.key,-1)}class mt{constructor(e,t,r){this.readTime=e,this.documentKey=t,this.largestBatchId=r}static min(){return new mt(F.min(),L.empty(),-1)}static max(){return new mt(F.max(),L.empty(),-1)}}function mg(n,e){let t=n.readTime.compareTo(e.readTime);return t!==0?t:(t=L.comparator(n.documentKey,e.documentKey),t!==0?t:z(n.largestBatchId,e.largestBatchId))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const _g="The current tab is not in the required state to perform this operation. It might be necessary to refresh the browser tab.";class yg{constructor(){this.onCommittedListeners=[]}addOnCommittedListener(e){this.onCommittedListeners.push(e)}raiseOnCommittedEvent(){this.onCommittedListeners.forEach((e=>e()))}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function cr(n){if(n.code!==R.FAILED_PRECONDITION||n.message!==_g)throw n;V("LocalStore","Unexpectedly lost primary lease")}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class P{constructor(e){this.nextCallback=null,this.catchCallback=null,this.result=void 0,this.error=void 0,this.isDone=!1,this.callbackAttached=!1,e((t=>{this.isDone=!0,this.result=t,this.nextCallback&&this.nextCallback(t)}),(t=>{this.isDone=!0,this.error=t,this.catchCallback&&this.catchCallback(t)}))}catch(e){return this.next(void 0,e)}next(e,t){return this.callbackAttached&&x(),this.callbackAttached=!0,this.isDone?this.error?this.wrapFailure(t,this.error):this.wrapSuccess(e,this.result):new P(((r,i)=>{this.nextCallback=s=>{this.wrapSuccess(e,s).next(r,i)},this.catchCallback=s=>{this.wrapFailure(t,s).next(r,i)}}))}toPromise(){return new Promise(((e,t)=>{this.next(e,t)}))}wrapUserFunction(e){try{const t=e();return t instanceof P?t:P.resolve(t)}catch(t){return P.reject(t)}}wrapSuccess(e,t){return e?this.wrapUserFunction((()=>e(t))):P.resolve(t)}wrapFailure(e,t){return e?this.wrapUserFunction((()=>e(t))):P.reject(t)}static resolve(e){return new P(((t,r)=>{t(e)}))}static reject(e){return new P(((t,r)=>{r(e)}))}static waitFor(e){return new P(((t,r)=>{let i=0,s=0,a=!1;e.forEach((u=>{++i,u.next((()=>{++s,a&&s===i&&t()}),(l=>r(l)))})),a=!0,s===i&&t()}))}static or(e){let t=P.resolve(!1);for(const r of e)t=t.next((i=>i?P.resolve(i):r()));return t}static forEach(e,t){const r=[];return e.forEach(((i,s)=>{r.push(t.call(this,i,s))})),this.waitFor(r)}static mapArray(e,t){return new P(((r,i)=>{const s=e.length,a=new Array(s);let u=0;for(let l=0;l<s;l++){const d=l;t(e[d]).next((p=>{a[d]=p,++u,u===s&&r(a)}),(p=>i(p)))}}))}static doWhile(e,t){return new P(((r,i)=>{const s=()=>{e()===!0?t().next((()=>{s()}),i):r()};s()}))}}function vg(n){const e=n.match(/Android ([\d.]+)/i),t=e?e[1].split(".").slice(0,2).join("."):"-1";return Number(t)}function ur(n){return n.name==="IndexedDbTransactionError"}/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class _o{constructor(e,t){this.previousValue=e,t&&(t.sequenceNumberHandler=r=>this.ie(r),this.se=r=>t.writeSequenceNumber(r))}ie(e){return this.previousValue=Math.max(e,this.previousValue),this.previousValue}next(){const e=++this.previousValue;return this.se&&this.se(e),e}}_o.oe=-1;function Ti(n){return n==null}function ii(n){return n===0&&1/n==-1/0}function wg(n){return typeof n=="number"&&Number.isInteger(n)&&!ii(n)&&n<=Number.MAX_SAFE_INTEGER&&n>=Number.MIN_SAFE_INTEGER}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Sc(n){let e=0;for(const t in n)Object.prototype.hasOwnProperty.call(n,t)&&e++;return e}function Bt(n,e){for(const t in n)Object.prototype.hasOwnProperty.call(n,t)&&e(t,n[t])}function ml(n){for(const e in n)if(Object.prototype.hasOwnProperty.call(n,e))return!1;return!0}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class X{constructor(e,t){this.comparator=e,this.root=t||ue.EMPTY}insert(e,t){return new X(this.comparator,this.root.insert(e,t,this.comparator).copy(null,null,ue.BLACK,null,null))}remove(e){return new X(this.comparator,this.root.remove(e,this.comparator).copy(null,null,ue.BLACK,null,null))}get(e){let t=this.root;for(;!t.isEmpty();){const r=this.comparator(e,t.key);if(r===0)return t.value;r<0?t=t.left:r>0&&(t=t.right)}return null}indexOf(e){let t=0,r=this.root;for(;!r.isEmpty();){const i=this.comparator(e,r.key);if(i===0)return t+r.left.size;i<0?r=r.left:(t+=r.left.size+1,r=r.right)}return-1}isEmpty(){return this.root.isEmpty()}get size(){return this.root.size}minKey(){return this.root.minKey()}maxKey(){return this.root.maxKey()}inorderTraversal(e){return this.root.inorderTraversal(e)}forEach(e){this.inorderTraversal(((t,r)=>(e(t,r),!1)))}toString(){const e=[];return this.inorderTraversal(((t,r)=>(e.push(`${t}:${r}`),!1))),`{${e.join(", ")}}`}reverseTraversal(e){return this.root.reverseTraversal(e)}getIterator(){return new Ur(this.root,null,this.comparator,!1)}getIteratorFrom(e){return new Ur(this.root,e,this.comparator,!1)}getReverseIterator(){return new Ur(this.root,null,this.comparator,!0)}getReverseIteratorFrom(e){return new Ur(this.root,e,this.comparator,!0)}}class Ur{constructor(e,t,r,i){this.isReverse=i,this.nodeStack=[];let s=1;for(;!e.isEmpty();)if(s=t?r(e.key,t):1,t&&i&&(s*=-1),s<0)e=this.isReverse?e.left:e.right;else{if(s===0){this.nodeStack.push(e);break}this.nodeStack.push(e),e=this.isReverse?e.right:e.left}}getNext(){let e=this.nodeStack.pop();const t={key:e.key,value:e.value};if(this.isReverse)for(e=e.left;!e.isEmpty();)this.nodeStack.push(e),e=e.right;else for(e=e.right;!e.isEmpty();)this.nodeStack.push(e),e=e.left;return t}hasNext(){return this.nodeStack.length>0}peek(){if(this.nodeStack.length===0)return null;const e=this.nodeStack[this.nodeStack.length-1];return{key:e.key,value:e.value}}}class ue{constructor(e,t,r,i,s){this.key=e,this.value=t,this.color=r??ue.RED,this.left=i??ue.EMPTY,this.right=s??ue.EMPTY,this.size=this.left.size+1+this.right.size}copy(e,t,r,i,s){return new ue(e??this.key,t??this.value,r??this.color,i??this.left,s??this.right)}isEmpty(){return!1}inorderTraversal(e){return this.left.inorderTraversal(e)||e(this.key,this.value)||this.right.inorderTraversal(e)}reverseTraversal(e){return this.right.reverseTraversal(e)||e(this.key,this.value)||this.left.reverseTraversal(e)}min(){return this.left.isEmpty()?this:this.left.min()}minKey(){return this.min().key}maxKey(){return this.right.isEmpty()?this.key:this.right.maxKey()}insert(e,t,r){let i=this;const s=r(e,i.key);return i=s<0?i.copy(null,null,null,i.left.insert(e,t,r),null):s===0?i.copy(null,t,null,null,null):i.copy(null,null,null,null,i.right.insert(e,t,r)),i.fixUp()}removeMin(){if(this.left.isEmpty())return ue.EMPTY;let e=this;return e.left.isRed()||e.left.left.isRed()||(e=e.moveRedLeft()),e=e.copy(null,null,null,e.left.removeMin(),null),e.fixUp()}remove(e,t){let r,i=this;if(t(e,i.key)<0)i.left.isEmpty()||i.left.isRed()||i.left.left.isRed()||(i=i.moveRedLeft()),i=i.copy(null,null,null,i.left.remove(e,t),null);else{if(i.left.isRed()&&(i=i.rotateRight()),i.right.isEmpty()||i.right.isRed()||i.right.left.isRed()||(i=i.moveRedRight()),t(e,i.key)===0){if(i.right.isEmpty())return ue.EMPTY;r=i.right.min(),i=i.copy(r.key,r.value,null,null,i.right.removeMin())}i=i.copy(null,null,null,null,i.right.remove(e,t))}return i.fixUp()}isRed(){return this.color}fixUp(){let e=this;return e.right.isRed()&&!e.left.isRed()&&(e=e.rotateLeft()),e.left.isRed()&&e.left.left.isRed()&&(e=e.rotateRight()),e.left.isRed()&&e.right.isRed()&&(e=e.colorFlip()),e}moveRedLeft(){let e=this.colorFlip();return e.right.left.isRed()&&(e=e.copy(null,null,null,null,e.right.rotateRight()),e=e.rotateLeft(),e=e.colorFlip()),e}moveRedRight(){let e=this.colorFlip();return e.left.left.isRed()&&(e=e.rotateRight(),e=e.colorFlip()),e}rotateLeft(){const e=this.copy(null,null,ue.RED,null,this.right.left);return this.right.copy(null,null,this.color,e,null)}rotateRight(){const e=this.copy(null,null,ue.RED,this.left.right,null);return this.left.copy(null,null,this.color,null,e)}colorFlip(){const e=this.left.copy(null,null,!this.left.color,null,null),t=this.right.copy(null,null,!this.right.color,null,null);return this.copy(null,null,!this.color,e,t)}checkMaxDepth(){const e=this.check();return Math.pow(2,e)<=this.size+1}check(){if(this.isRed()&&this.left.isRed()||this.right.isRed())throw x();const e=this.left.check();if(e!==this.right.check())throw x();return e+(this.isRed()?0:1)}}ue.EMPTY=null,ue.RED=!0,ue.BLACK=!1;ue.EMPTY=new class{constructor(){this.size=0}get key(){throw x()}get value(){throw x()}get color(){throw x()}get left(){throw x()}get right(){throw x()}copy(e,t,r,i,s){return this}insert(e,t,r){return new ue(e,t)}remove(e,t){return this}isEmpty(){return!0}inorderTraversal(e){return!1}reverseTraversal(e){return!1}minKey(){return null}maxKey(){return null}isRed(){return!1}checkMaxDepth(){return!0}check(){return 0}};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class de{constructor(e){this.comparator=e,this.data=new X(this.comparator)}has(e){return this.data.get(e)!==null}first(){return this.data.minKey()}last(){return this.data.maxKey()}get size(){return this.data.size}indexOf(e){return this.data.indexOf(e)}forEach(e){this.data.inorderTraversal(((t,r)=>(e(t),!1)))}forEachInRange(e,t){const r=this.data.getIteratorFrom(e[0]);for(;r.hasNext();){const i=r.getNext();if(this.comparator(i.key,e[1])>=0)return;t(i.key)}}forEachWhile(e,t){let r;for(r=t!==void 0?this.data.getIteratorFrom(t):this.data.getIterator();r.hasNext();)if(!e(r.getNext().key))return}firstAfterOrEqual(e){const t=this.data.getIteratorFrom(e);return t.hasNext()?t.getNext().key:null}getIterator(){return new Pc(this.data.getIterator())}getIteratorFrom(e){return new Pc(this.data.getIteratorFrom(e))}add(e){return this.copy(this.data.remove(e).insert(e,!0))}delete(e){return this.has(e)?this.copy(this.data.remove(e)):this}isEmpty(){return this.data.isEmpty()}unionWith(e){let t=this;return t.size<e.size&&(t=e,e=this),e.forEach((r=>{t=t.add(r)})),t}isEqual(e){if(!(e instanceof de)||this.size!==e.size)return!1;const t=this.data.getIterator(),r=e.data.getIterator();for(;t.hasNext();){const i=t.getNext().key,s=r.getNext().key;if(this.comparator(i,s)!==0)return!1}return!0}toArray(){const e=[];return this.forEach((t=>{e.push(t)})),e}toString(){const e=[];return this.forEach((t=>e.push(t))),"SortedSet("+e.toString()+")"}copy(e){const t=new de(this.comparator);return t.data=e,t}}class Pc{constructor(e){this.iter=e}getNext(){return this.iter.getNext().key}hasNext(){return this.iter.hasNext()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ce{constructor(e){this.fields=e,e.sort(le.comparator)}static empty(){return new Ce([])}unionWith(e){let t=new de(le.comparator);for(const r of this.fields)t=t.add(r);for(const r of e)t=t.add(r);return new Ce(t.toArray())}covers(e){for(const t of this.fields)if(t.isPrefixOf(e))return!0;return!1}isEqual(e){return sn(this.fields,e.fields,((t,r)=>t.isEqual(r)))}}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class _l extends Error{constructor(){super(...arguments),this.name="Base64DecodeError"}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class fe{constructor(e){this.binaryString=e}static fromBase64String(e){const t=(function(i){try{return atob(i)}catch(s){throw typeof DOMException<"u"&&s instanceof DOMException?new _l("Invalid base64 string: "+s):s}})(e);return new fe(t)}static fromUint8Array(e){const t=(function(i){let s="";for(let a=0;a<i.length;++a)s+=String.fromCharCode(i[a]);return s})(e);return new fe(t)}[Symbol.iterator](){let e=0;return{next:()=>e<this.binaryString.length?{value:this.binaryString.charCodeAt(e++),done:!1}:{value:void 0,done:!0}}}toBase64(){return(function(t){return btoa(t)})(this.binaryString)}toUint8Array(){return(function(t){const r=new Uint8Array(t.length);for(let i=0;i<t.length;i++)r[i]=t.charCodeAt(i);return r})(this.binaryString)}approximateByteSize(){return 2*this.binaryString.length}compareTo(e){return z(this.binaryString,e.binaryString)}isEqual(e){return this.binaryString===e.binaryString}}fe.EMPTY_BYTE_STRING=new fe("");const Tg=new RegExp(/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.(\d+))?Z$/);function _t(n){if(G(!!n),typeof n=="string"){let e=0;const t=Tg.exec(n);if(G(!!t),t[1]){let i=t[1];i=(i+"000000000").substr(0,9),e=Number(i)}const r=new Date(n);return{seconds:Math.floor(r.getTime()/1e3),nanos:e}}return{seconds:ne(n.seconds),nanos:ne(n.nanos)}}function ne(n){return typeof n=="number"?n:typeof n=="string"?Number(n):0}function Vt(n){return typeof n=="string"?fe.fromBase64String(n):fe.fromUint8Array(n)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function yo(n){var e,t;return((t=(((e=n==null?void 0:n.mapValue)===null||e===void 0?void 0:e.fields)||{}).__type__)===null||t===void 0?void 0:t.stringValue)==="server_timestamp"}function vo(n){const e=n.mapValue.fields.__previous_value__;return yo(e)?vo(e):e}function Yn(n){const e=_t(n.mapValue.fields.__local_write_time__.timestampValue);return new oe(e.seconds,e.nanos)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Eg{constructor(e,t,r,i,s,a,u,l,d){this.databaseId=e,this.appId=t,this.persistenceKey=r,this.host=i,this.ssl=s,this.forceLongPolling=a,this.autoDetectLongPolling=u,this.longPollingOptions=l,this.useFetchStreams=d}}class Xn{constructor(e,t){this.projectId=e,this.database=t||"(default)"}static empty(){return new Xn("","")}get isDefaultDatabase(){return this.database==="(default)"}isEqual(e){return e instanceof Xn&&e.projectId===this.projectId&&e.database===this.database}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Br={mapValue:{}};function Ot(n){return"nullValue"in n?0:"booleanValue"in n?1:"integerValue"in n||"doubleValue"in n?2:"timestampValue"in n?3:"stringValue"in n?5:"bytesValue"in n?6:"referenceValue"in n?7:"geoPointValue"in n?8:"arrayValue"in n?9:"mapValue"in n?yo(n)?4:Ag(n)?9007199254740991:Ig(n)?10:11:x()}function qe(n,e){if(n===e)return!0;const t=Ot(n);if(t!==Ot(e))return!1;switch(t){case 0:case 9007199254740991:return!0;case 1:return n.booleanValue===e.booleanValue;case 4:return Yn(n).isEqual(Yn(e));case 3:return(function(i,s){if(typeof i.timestampValue=="string"&&typeof s.timestampValue=="string"&&i.timestampValue.length===s.timestampValue.length)return i.timestampValue===s.timestampValue;const a=_t(i.timestampValue),u=_t(s.timestampValue);return a.seconds===u.seconds&&a.nanos===u.nanos})(n,e);case 5:return n.stringValue===e.stringValue;case 6:return(function(i,s){return Vt(i.bytesValue).isEqual(Vt(s.bytesValue))})(n,e);case 7:return n.referenceValue===e.referenceValue;case 8:return(function(i,s){return ne(i.geoPointValue.latitude)===ne(s.geoPointValue.latitude)&&ne(i.geoPointValue.longitude)===ne(s.geoPointValue.longitude)})(n,e);case 2:return(function(i,s){if("integerValue"in i&&"integerValue"in s)return ne(i.integerValue)===ne(s.integerValue);if("doubleValue"in i&&"doubleValue"in s){const a=ne(i.doubleValue),u=ne(s.doubleValue);return a===u?ii(a)===ii(u):isNaN(a)&&isNaN(u)}return!1})(n,e);case 9:return sn(n.arrayValue.values||[],e.arrayValue.values||[],qe);case 10:case 11:return(function(i,s){const a=i.mapValue.fields||{},u=s.mapValue.fields||{};if(Sc(a)!==Sc(u))return!1;for(const l in a)if(a.hasOwnProperty(l)&&(u[l]===void 0||!qe(a[l],u[l])))return!1;return!0})(n,e);default:return x()}}function Zn(n,e){return(n.values||[]).find((t=>qe(t,e)))!==void 0}function on(n,e){if(n===e)return 0;const t=Ot(n),r=Ot(e);if(t!==r)return z(t,r);switch(t){case 0:case 9007199254740991:return 0;case 1:return z(n.booleanValue,e.booleanValue);case 2:return(function(s,a){const u=ne(s.integerValue||s.doubleValue),l=ne(a.integerValue||a.doubleValue);return u<l?-1:u>l?1:u===l?0:isNaN(u)?isNaN(l)?0:-1:1})(n,e);case 3:return Cc(n.timestampValue,e.timestampValue);case 4:return Cc(Yn(n),Yn(e));case 5:return z(n.stringValue,e.stringValue);case 6:return(function(s,a){const u=Vt(s),l=Vt(a);return u.compareTo(l)})(n.bytesValue,e.bytesValue);case 7:return(function(s,a){const u=s.split("/"),l=a.split("/");for(let d=0;d<u.length&&d<l.length;d++){const p=z(u[d],l[d]);if(p!==0)return p}return z(u.length,l.length)})(n.referenceValue,e.referenceValue);case 8:return(function(s,a){const u=z(ne(s.latitude),ne(a.latitude));return u!==0?u:z(ne(s.longitude),ne(a.longitude))})(n.geoPointValue,e.geoPointValue);case 9:return kc(n.arrayValue,e.arrayValue);case 10:return(function(s,a){var u,l,d,p;const v=s.fields||{},A=a.fields||{},S=(u=v.value)===null||u===void 0?void 0:u.arrayValue,k=(l=A.value)===null||l===void 0?void 0:l.arrayValue,O=z(((d=S==null?void 0:S.values)===null||d===void 0?void 0:d.length)||0,((p=k==null?void 0:k.values)===null||p===void 0?void 0:p.length)||0);return O!==0?O:kc(S,k)})(n.mapValue,e.mapValue);case 11:return(function(s,a){if(s===Br.mapValue&&a===Br.mapValue)return 0;if(s===Br.mapValue)return 1;if(a===Br.mapValue)return-1;const u=s.fields||{},l=Object.keys(u),d=a.fields||{},p=Object.keys(d);l.sort(),p.sort();for(let v=0;v<l.length&&v<p.length;++v){const A=z(l[v],p[v]);if(A!==0)return A;const S=on(u[l[v]],d[p[v]]);if(S!==0)return S}return z(l.length,p.length)})(n.mapValue,e.mapValue);default:throw x()}}function Cc(n,e){if(typeof n=="string"&&typeof e=="string"&&n.length===e.length)return z(n,e);const t=_t(n),r=_t(e),i=z(t.seconds,r.seconds);return i!==0?i:z(t.nanos,r.nanos)}function kc(n,e){const t=n.values||[],r=e.values||[];for(let i=0;i<t.length&&i<r.length;++i){const s=on(t[i],r[i]);if(s)return s}return z(t.length,r.length)}function an(n){return Hs(n)}function Hs(n){return"nullValue"in n?"null":"booleanValue"in n?""+n.booleanValue:"integerValue"in n?""+n.integerValue:"doubleValue"in n?""+n.doubleValue:"timestampValue"in n?(function(t){const r=_t(t);return`time(${r.seconds},${r.nanos})`})(n.timestampValue):"stringValue"in n?n.stringValue:"bytesValue"in n?(function(t){return Vt(t).toBase64()})(n.bytesValue):"referenceValue"in n?(function(t){return L.fromName(t).toString()})(n.referenceValue):"geoPointValue"in n?(function(t){return`geo(${t.latitude},${t.longitude})`})(n.geoPointValue):"arrayValue"in n?(function(t){let r="[",i=!0;for(const s of t.values||[])i?i=!1:r+=",",r+=Hs(s);return r+"]"})(n.arrayValue):"mapValue"in n?(function(t){const r=Object.keys(t.fields||{}).sort();let i="{",s=!0;for(const a of r)s?s=!1:i+=",",i+=`${a}:${Hs(t.fields[a])}`;return i+"}"})(n.mapValue):x()}function Nc(n,e){return{referenceValue:`projects/${n.projectId}/databases/${n.database}/documents/${e.path.canonicalString()}`}}function Ks(n){return!!n&&"integerValue"in n}function wo(n){return!!n&&"arrayValue"in n}function Dc(n){return!!n&&"nullValue"in n}function Vc(n){return!!n&&"doubleValue"in n&&isNaN(Number(n.doubleValue))}function Wr(n){return!!n&&"mapValue"in n}function Ig(n){var e,t;return((t=(((e=n==null?void 0:n.mapValue)===null||e===void 0?void 0:e.fields)||{}).__type__)===null||t===void 0?void 0:t.stringValue)==="__vector__"}function qn(n){if(n.geoPointValue)return{geoPointValue:Object.assign({},n.geoPointValue)};if(n.timestampValue&&typeof n.timestampValue=="object")return{timestampValue:Object.assign({},n.timestampValue)};if(n.mapValue){const e={mapValue:{fields:{}}};return Bt(n.mapValue.fields,((t,r)=>e.mapValue.fields[t]=qn(r))),e}if(n.arrayValue){const e={arrayValue:{values:[]}};for(let t=0;t<(n.arrayValue.values||[]).length;++t)e.arrayValue.values[t]=qn(n.arrayValue.values[t]);return e}return Object.assign({},n)}function Ag(n){return(((n.mapValue||{}).fields||{}).__type__||{}).stringValue==="__max__"}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class be{constructor(e){this.value=e}static empty(){return new be({mapValue:{}})}field(e){if(e.isEmpty())return this.value;{let t=this.value;for(let r=0;r<e.length-1;++r)if(t=(t.mapValue.fields||{})[e.get(r)],!Wr(t))return null;return t=(t.mapValue.fields||{})[e.lastSegment()],t||null}}set(e,t){this.getFieldsMap(e.popLast())[e.lastSegment()]=qn(t)}setAll(e){let t=le.emptyPath(),r={},i=[];e.forEach(((a,u)=>{if(!t.isImmediateParentOf(u)){const l=this.getFieldsMap(t);this.applyChanges(l,r,i),r={},i=[],t=u.popLast()}a?r[u.lastSegment()]=qn(a):i.push(u.lastSegment())}));const s=this.getFieldsMap(t);this.applyChanges(s,r,i)}delete(e){const t=this.field(e.popLast());Wr(t)&&t.mapValue.fields&&delete t.mapValue.fields[e.lastSegment()]}isEqual(e){return qe(this.value,e.value)}getFieldsMap(e){let t=this.value;t.mapValue.fields||(t.mapValue={fields:{}});for(let r=0;r<e.length;++r){let i=t.mapValue.fields[e.get(r)];Wr(i)&&i.mapValue.fields||(i={mapValue:{fields:{}}},t.mapValue.fields[e.get(r)]=i),t=i}return t.mapValue.fields}applyChanges(e,t,r){Bt(t,((i,s)=>e[i]=s));for(const i of r)delete e[i]}clone(){return new be(qn(this.value))}}function yl(n){const e=[];return Bt(n.fields,((t,r)=>{const i=new le([t]);if(Wr(r)){const s=yl(r.mapValue).fields;if(s.length===0)e.push(i);else for(const a of s)e.push(i.child(a))}else e.push(i)})),new Ce(e)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class we{constructor(e,t,r,i,s,a,u){this.key=e,this.documentType=t,this.version=r,this.readTime=i,this.createTime=s,this.data=a,this.documentState=u}static newInvalidDocument(e){return new we(e,0,F.min(),F.min(),F.min(),be.empty(),0)}static newFoundDocument(e,t,r,i){return new we(e,1,t,F.min(),r,i,0)}static newNoDocument(e,t){return new we(e,2,t,F.min(),F.min(),be.empty(),0)}static newUnknownDocument(e,t){return new we(e,3,t,F.min(),F.min(),be.empty(),2)}convertToFoundDocument(e,t){return!this.createTime.isEqual(F.min())||this.documentType!==2&&this.documentType!==0||(this.createTime=e),this.version=e,this.documentType=1,this.data=t,this.documentState=0,this}convertToNoDocument(e){return this.version=e,this.documentType=2,this.data=be.empty(),this.documentState=0,this}convertToUnknownDocument(e){return this.version=e,this.documentType=3,this.data=be.empty(),this.documentState=2,this}setHasCommittedMutations(){return this.documentState=2,this}setHasLocalMutations(){return this.documentState=1,this.version=F.min(),this}setReadTime(e){return this.readTime=e,this}get hasLocalMutations(){return this.documentState===1}get hasCommittedMutations(){return this.documentState===2}get hasPendingWrites(){return this.hasLocalMutations||this.hasCommittedMutations}isValidDocument(){return this.documentType!==0}isFoundDocument(){return this.documentType===1}isNoDocument(){return this.documentType===2}isUnknownDocument(){return this.documentType===3}isEqual(e){return e instanceof we&&this.key.isEqual(e.key)&&this.version.isEqual(e.version)&&this.documentType===e.documentType&&this.documentState===e.documentState&&this.data.isEqual(e.data)}mutableCopy(){return new we(this.key,this.documentType,this.version,this.readTime,this.createTime,this.data.clone(),this.documentState)}toString(){return`Document(${this.key}, ${this.version}, ${JSON.stringify(this.data.value)}, {createTime: ${this.createTime}}), {documentType: ${this.documentType}}), {documentState: ${this.documentState}})`}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class si{constructor(e,t){this.position=e,this.inclusive=t}}function Oc(n,e,t){let r=0;for(let i=0;i<n.position.length;i++){const s=e[i],a=n.position[i];if(s.field.isKeyField()?r=L.comparator(L.fromName(a.referenceValue),t.key):r=on(a,t.data.field(s.field)),s.dir==="desc"&&(r*=-1),r!==0)break}return r}function Lc(n,e){if(n===null)return e===null;if(e===null||n.inclusive!==e.inclusive||n.position.length!==e.position.length)return!1;for(let t=0;t<n.position.length;t++)if(!qe(n.position[t],e.position[t]))return!1;return!0}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class er{constructor(e,t="asc"){this.field=e,this.dir=t}}function bg(n,e){return n.dir===e.dir&&n.field.isEqual(e.field)}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class vl{}class se extends vl{constructor(e,t,r){super(),this.field=e,this.op=t,this.value=r}static create(e,t,r){return e.isKeyField()?t==="in"||t==="not-in"?this.createKeyFieldInFilter(e,t,r):new Sg(e,t,r):t==="array-contains"?new kg(e,r):t==="in"?new Ng(e,r):t==="not-in"?new Dg(e,r):t==="array-contains-any"?new Vg(e,r):new se(e,t,r)}static createKeyFieldInFilter(e,t,r){return t==="in"?new Pg(e,r):new Cg(e,r)}matches(e){const t=e.data.field(this.field);return this.op==="!="?t!==null&&this.matchesComparison(on(t,this.value)):t!==null&&Ot(this.value)===Ot(t)&&this.matchesComparison(on(t,this.value))}matchesComparison(e){switch(this.op){case"<":return e<0;case"<=":return e<=0;case"==":return e===0;case"!=":return e!==0;case">":return e>0;case">=":return e>=0;default:return x()}}isInequality(){return["<","<=",">",">=","!=","not-in"].indexOf(this.op)>=0}getFlattenedFilters(){return[this]}getFilters(){return[this]}}class Oe extends vl{constructor(e,t){super(),this.filters=e,this.op=t,this.ae=null}static create(e,t){return new Oe(e,t)}matches(e){return wl(this)?this.filters.find((t=>!t.matches(e)))===void 0:this.filters.find((t=>t.matches(e)))!==void 0}getFlattenedFilters(){return this.ae!==null||(this.ae=this.filters.reduce(((e,t)=>e.concat(t.getFlattenedFilters())),[])),this.ae}getFilters(){return Object.assign([],this.filters)}}function wl(n){return n.op==="and"}function Tl(n){return Rg(n)&&wl(n)}function Rg(n){for(const e of n.filters)if(e instanceof Oe)return!1;return!0}function Ws(n){if(n instanceof se)return n.field.canonicalString()+n.op.toString()+an(n.value);if(Tl(n))return n.filters.map((e=>Ws(e))).join(",");{const e=n.filters.map((t=>Ws(t))).join(",");return`${n.op}(${e})`}}function El(n,e){return n instanceof se?(function(r,i){return i instanceof se&&r.op===i.op&&r.field.isEqual(i.field)&&qe(r.value,i.value)})(n,e):n instanceof Oe?(function(r,i){return i instanceof Oe&&r.op===i.op&&r.filters.length===i.filters.length?r.filters.reduce(((s,a,u)=>s&&El(a,i.filters[u])),!0):!1})(n,e):void x()}function Il(n){return n instanceof se?(function(t){return`${t.field.canonicalString()} ${t.op} ${an(t.value)}`})(n):n instanceof Oe?(function(t){return t.op.toString()+" {"+t.getFilters().map(Il).join(" ,")+"}"})(n):"Filter"}class Sg extends se{constructor(e,t,r){super(e,t,r),this.key=L.fromName(r.referenceValue)}matches(e){const t=L.comparator(e.key,this.key);return this.matchesComparison(t)}}class Pg extends se{constructor(e,t){super(e,"in",t),this.keys=Al("in",t)}matches(e){return this.keys.some((t=>t.isEqual(e.key)))}}class Cg extends se{constructor(e,t){super(e,"not-in",t),this.keys=Al("not-in",t)}matches(e){return!this.keys.some((t=>t.isEqual(e.key)))}}function Al(n,e){var t;return(((t=e.arrayValue)===null||t===void 0?void 0:t.values)||[]).map((r=>L.fromName(r.referenceValue)))}class kg extends se{constructor(e,t){super(e,"array-contains",t)}matches(e){const t=e.data.field(this.field);return wo(t)&&Zn(t.arrayValue,this.value)}}class Ng extends se{constructor(e,t){super(e,"in",t)}matches(e){const t=e.data.field(this.field);return t!==null&&Zn(this.value.arrayValue,t)}}class Dg extends se{constructor(e,t){super(e,"not-in",t)}matches(e){if(Zn(this.value.arrayValue,{nullValue:"NULL_VALUE"}))return!1;const t=e.data.field(this.field);return t!==null&&!Zn(this.value.arrayValue,t)}}class Vg extends se{constructor(e,t){super(e,"array-contains-any",t)}matches(e){const t=e.data.field(this.field);return!(!wo(t)||!t.arrayValue.values)&&t.arrayValue.values.some((r=>Zn(this.value.arrayValue,r)))}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Og{constructor(e,t=null,r=[],i=[],s=null,a=null,u=null){this.path=e,this.collectionGroup=t,this.orderBy=r,this.filters=i,this.limit=s,this.startAt=a,this.endAt=u,this.ue=null}}function Mc(n,e=null,t=[],r=[],i=null,s=null,a=null){return new Og(n,e,t,r,i,s,a)}function To(n){const e=U(n);if(e.ue===null){let t=e.path.canonicalString();e.collectionGroup!==null&&(t+="|cg:"+e.collectionGroup),t+="|f:",t+=e.filters.map((r=>Ws(r))).join(","),t+="|ob:",t+=e.orderBy.map((r=>(function(s){return s.field.canonicalString()+s.dir})(r))).join(","),Ti(e.limit)||(t+="|l:",t+=e.limit),e.startAt&&(t+="|lb:",t+=e.startAt.inclusive?"b:":"a:",t+=e.startAt.position.map((r=>an(r))).join(",")),e.endAt&&(t+="|ub:",t+=e.endAt.inclusive?"a:":"b:",t+=e.endAt.position.map((r=>an(r))).join(",")),e.ue=t}return e.ue}function Eo(n,e){if(n.limit!==e.limit||n.orderBy.length!==e.orderBy.length)return!1;for(let t=0;t<n.orderBy.length;t++)if(!bg(n.orderBy[t],e.orderBy[t]))return!1;if(n.filters.length!==e.filters.length)return!1;for(let t=0;t<n.filters.length;t++)if(!El(n.filters[t],e.filters[t]))return!1;return n.collectionGroup===e.collectionGroup&&!!n.path.isEqual(e.path)&&!!Lc(n.startAt,e.startAt)&&Lc(n.endAt,e.endAt)}function Gs(n){return L.isDocumentKey(n.path)&&n.collectionGroup===null&&n.filters.length===0}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class pn{constructor(e,t=null,r=[],i=[],s=null,a="F",u=null,l=null){this.path=e,this.collectionGroup=t,this.explicitOrderBy=r,this.filters=i,this.limit=s,this.limitType=a,this.startAt=u,this.endAt=l,this.ce=null,this.le=null,this.he=null,this.startAt,this.endAt}}function Lg(n,e,t,r,i,s,a,u){return new pn(n,e,t,r,i,s,a,u)}function Io(n){return new pn(n)}function xc(n){return n.filters.length===0&&n.limit===null&&n.startAt==null&&n.endAt==null&&(n.explicitOrderBy.length===0||n.explicitOrderBy.length===1&&n.explicitOrderBy[0].field.isKeyField())}function bl(n){return n.collectionGroup!==null}function $n(n){const e=U(n);if(e.ce===null){e.ce=[];const t=new Set;for(const s of e.explicitOrderBy)e.ce.push(s),t.add(s.field.canonicalString());const r=e.explicitOrderBy.length>0?e.explicitOrderBy[e.explicitOrderBy.length-1].dir:"asc";(function(a){let u=new de(le.comparator);return a.filters.forEach((l=>{l.getFlattenedFilters().forEach((d=>{d.isInequality()&&(u=u.add(d.field))}))})),u})(e).forEach((s=>{t.has(s.canonicalString())||s.isKeyField()||e.ce.push(new er(s,r))})),t.has(le.keyField().canonicalString())||e.ce.push(new er(le.keyField(),r))}return e.ce}function Me(n){const e=U(n);return e.le||(e.le=Mg(e,$n(n))),e.le}function Mg(n,e){if(n.limitType==="F")return Mc(n.path,n.collectionGroup,e,n.filters,n.limit,n.startAt,n.endAt);{e=e.map((i=>{const s=i.dir==="desc"?"asc":"desc";return new er(i.field,s)}));const t=n.endAt?new si(n.endAt.position,n.endAt.inclusive):null,r=n.startAt?new si(n.startAt.position,n.startAt.inclusive):null;return Mc(n.path,n.collectionGroup,e,n.filters,n.limit,t,r)}}function Qs(n,e){const t=n.filters.concat([e]);return new pn(n.path,n.collectionGroup,n.explicitOrderBy.slice(),t,n.limit,n.limitType,n.startAt,n.endAt)}function Js(n,e,t){return new pn(n.path,n.collectionGroup,n.explicitOrderBy.slice(),n.filters.slice(),e,t,n.startAt,n.endAt)}function Ei(n,e){return Eo(Me(n),Me(e))&&n.limitType===e.limitType}function Rl(n){return`${To(Me(n))}|lt:${n.limitType}`}function Gt(n){return`Query(target=${(function(t){let r=t.path.canonicalString();return t.collectionGroup!==null&&(r+=" collectionGroup="+t.collectionGroup),t.filters.length>0&&(r+=`, filters: [${t.filters.map((i=>Il(i))).join(", ")}]`),Ti(t.limit)||(r+=", limit: "+t.limit),t.orderBy.length>0&&(r+=`, orderBy: [${t.orderBy.map((i=>(function(a){return`${a.field.canonicalString()} (${a.dir})`})(i))).join(", ")}]`),t.startAt&&(r+=", startAt: ",r+=t.startAt.inclusive?"b:":"a:",r+=t.startAt.position.map((i=>an(i))).join(",")),t.endAt&&(r+=", endAt: ",r+=t.endAt.inclusive?"a:":"b:",r+=t.endAt.position.map((i=>an(i))).join(",")),`Target(${r})`})(Me(n))}; limitType=${n.limitType})`}function Ii(n,e){return e.isFoundDocument()&&(function(r,i){const s=i.key.path;return r.collectionGroup!==null?i.key.hasCollectionId(r.collectionGroup)&&r.path.isPrefixOf(s):L.isDocumentKey(r.path)?r.path.isEqual(s):r.path.isImmediateParentOf(s)})(n,e)&&(function(r,i){for(const s of $n(r))if(!s.field.isKeyField()&&i.data.field(s.field)===null)return!1;return!0})(n,e)&&(function(r,i){for(const s of r.filters)if(!s.matches(i))return!1;return!0})(n,e)&&(function(r,i){return!(r.startAt&&!(function(a,u,l){const d=Oc(a,u,l);return a.inclusive?d<=0:d<0})(r.startAt,$n(r),i)||r.endAt&&!(function(a,u,l){const d=Oc(a,u,l);return a.inclusive?d>=0:d>0})(r.endAt,$n(r),i))})(n,e)}function xg(n){return n.collectionGroup||(n.path.length%2==1?n.path.lastSegment():n.path.get(n.path.length-2))}function Sl(n){return(e,t)=>{let r=!1;for(const i of $n(n)){const s=Fg(i,e,t);if(s!==0)return s;r=r||i.field.isKeyField()}return 0}}function Fg(n,e,t){const r=n.field.isKeyField()?L.comparator(e.key,t.key):(function(s,a,u){const l=a.data.field(s),d=u.data.field(s);return l!==null&&d!==null?on(l,d):x()})(n.field,e,t);switch(n.dir){case"asc":return r;case"desc":return-1*r;default:return x()}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class gn{constructor(e,t){this.mapKeyFn=e,this.equalsFn=t,this.inner={},this.innerSize=0}get(e){const t=this.mapKeyFn(e),r=this.inner[t];if(r!==void 0){for(const[i,s]of r)if(this.equalsFn(i,e))return s}}has(e){return this.get(e)!==void 0}set(e,t){const r=this.mapKeyFn(e),i=this.inner[r];if(i===void 0)return this.inner[r]=[[e,t]],void this.innerSize++;for(let s=0;s<i.length;s++)if(this.equalsFn(i[s][0],e))return void(i[s]=[e,t]);i.push([e,t]),this.innerSize++}delete(e){const t=this.mapKeyFn(e),r=this.inner[t];if(r===void 0)return!1;for(let i=0;i<r.length;i++)if(this.equalsFn(r[i][0],e))return r.length===1?delete this.inner[t]:r.splice(i,1),this.innerSize--,!0;return!1}forEach(e){Bt(this.inner,((t,r)=>{for(const[i,s]of r)e(i,s)}))}isEmpty(){return ml(this.inner)}size(){return this.innerSize}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ug=new X(L.comparator);function et(){return Ug}const Pl=new X(L.comparator);function Fn(...n){let e=Pl;for(const t of n)e=e.insert(t.key,t);return e}function Cl(n){let e=Pl;return n.forEach(((t,r)=>e=e.insert(t,r.overlayedDocument))),e}function Pt(){return jn()}function kl(){return jn()}function jn(){return new gn((n=>n.toString()),((n,e)=>n.isEqual(e)))}const Bg=new X(L.comparator),qg=new de(L.comparator);function B(...n){let e=qg;for(const t of n)e=e.add(t);return e}const $g=new de(z);function jg(){return $g}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ao(n,e){if(n.useProto3Json){if(isNaN(e))return{doubleValue:"NaN"};if(e===1/0)return{doubleValue:"Infinity"};if(e===-1/0)return{doubleValue:"-Infinity"}}return{doubleValue:ii(e)?"-0":e}}function Nl(n){return{integerValue:""+n}}function zg(n,e){return wg(e)?Nl(e):Ao(n,e)}/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ai{constructor(){this._=void 0}}function Hg(n,e,t){return n instanceof tr?(function(i,s){const a={fields:{__type__:{stringValue:"server_timestamp"},__local_write_time__:{timestampValue:{seconds:i.seconds,nanos:i.nanoseconds}}}};return s&&yo(s)&&(s=vo(s)),s&&(a.fields.__previous_value__=s),{mapValue:a}})(t,e):n instanceof nr?Vl(n,e):n instanceof rr?Ol(n,e):(function(i,s){const a=Dl(i,s),u=Fc(a)+Fc(i.Pe);return Ks(a)&&Ks(i.Pe)?Nl(u):Ao(i.serializer,u)})(n,e)}function Kg(n,e,t){return n instanceof nr?Vl(n,e):n instanceof rr?Ol(n,e):t}function Dl(n,e){return n instanceof oi?(function(r){return Ks(r)||(function(s){return!!s&&"doubleValue"in s})(r)})(e)?e:{integerValue:0}:null}class tr extends Ai{}class nr extends Ai{constructor(e){super(),this.elements=e}}function Vl(n,e){const t=Ll(e);for(const r of n.elements)t.some((i=>qe(i,r)))||t.push(r);return{arrayValue:{values:t}}}class rr extends Ai{constructor(e){super(),this.elements=e}}function Ol(n,e){let t=Ll(e);for(const r of n.elements)t=t.filter((i=>!qe(i,r)));return{arrayValue:{values:t}}}class oi extends Ai{constructor(e,t){super(),this.serializer=e,this.Pe=t}}function Fc(n){return ne(n.integerValue||n.doubleValue)}function Ll(n){return wo(n)&&n.arrayValue.values?n.arrayValue.values.slice():[]}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Wg{constructor(e,t){this.field=e,this.transform=t}}function Gg(n,e){return n.field.isEqual(e.field)&&(function(r,i){return r instanceof nr&&i instanceof nr||r instanceof rr&&i instanceof rr?sn(r.elements,i.elements,qe):r instanceof oi&&i instanceof oi?qe(r.Pe,i.Pe):r instanceof tr&&i instanceof tr})(n.transform,e.transform)}class Qg{constructor(e,t){this.version=e,this.transformResults=t}}class xe{constructor(e,t){this.updateTime=e,this.exists=t}static none(){return new xe}static exists(e){return new xe(void 0,e)}static updateTime(e){return new xe(e)}get isNone(){return this.updateTime===void 0&&this.exists===void 0}isEqual(e){return this.exists===e.exists&&(this.updateTime?!!e.updateTime&&this.updateTime.isEqual(e.updateTime):!e.updateTime)}}function Gr(n,e){return n.updateTime!==void 0?e.isFoundDocument()&&e.version.isEqual(n.updateTime):n.exists===void 0||n.exists===e.isFoundDocument()}class bi{}function Ml(n,e){if(!n.hasLocalMutations||e&&e.fields.length===0)return null;if(e===null)return n.isNoDocument()?new Fl(n.key,xe.none()):new lr(n.key,n.data,xe.none());{const t=n.data,r=be.empty();let i=new de(le.comparator);for(let s of e.fields)if(!i.has(s)){let a=t.field(s);a===null&&s.length>1&&(s=s.popLast(),a=t.field(s)),a===null?r.delete(s):r.set(s,a),i=i.add(s)}return new wt(n.key,r,new Ce(i.toArray()),xe.none())}}function Jg(n,e,t){n instanceof lr?(function(i,s,a){const u=i.value.clone(),l=Bc(i.fieldTransforms,s,a.transformResults);u.setAll(l),s.convertToFoundDocument(a.version,u).setHasCommittedMutations()})(n,e,t):n instanceof wt?(function(i,s,a){if(!Gr(i.precondition,s))return void s.convertToUnknownDocument(a.version);const u=Bc(i.fieldTransforms,s,a.transformResults),l=s.data;l.setAll(xl(i)),l.setAll(u),s.convertToFoundDocument(a.version,l).setHasCommittedMutations()})(n,e,t):(function(i,s,a){s.convertToNoDocument(a.version).setHasCommittedMutations()})(0,e,t)}function zn(n,e,t,r){return n instanceof lr?(function(s,a,u,l){if(!Gr(s.precondition,a))return u;const d=s.value.clone(),p=qc(s.fieldTransforms,l,a);return d.setAll(p),a.convertToFoundDocument(a.version,d).setHasLocalMutations(),null})(n,e,t,r):n instanceof wt?(function(s,a,u,l){if(!Gr(s.precondition,a))return u;const d=qc(s.fieldTransforms,l,a),p=a.data;return p.setAll(xl(s)),p.setAll(d),a.convertToFoundDocument(a.version,p).setHasLocalMutations(),u===null?null:u.unionWith(s.fieldMask.fields).unionWith(s.fieldTransforms.map((v=>v.field)))})(n,e,t,r):(function(s,a,u){return Gr(s.precondition,a)?(a.convertToNoDocument(a.version).setHasLocalMutations(),null):u})(n,e,t)}function Yg(n,e){let t=null;for(const r of n.fieldTransforms){const i=e.data.field(r.field),s=Dl(r.transform,i||null);s!=null&&(t===null&&(t=be.empty()),t.set(r.field,s))}return t||null}function Uc(n,e){return n.type===e.type&&!!n.key.isEqual(e.key)&&!!n.precondition.isEqual(e.precondition)&&!!(function(r,i){return r===void 0&&i===void 0||!(!r||!i)&&sn(r,i,((s,a)=>Gg(s,a)))})(n.fieldTransforms,e.fieldTransforms)&&(n.type===0?n.value.isEqual(e.value):n.type!==1||n.data.isEqual(e.data)&&n.fieldMask.isEqual(e.fieldMask))}class lr extends bi{constructor(e,t,r,i=[]){super(),this.key=e,this.value=t,this.precondition=r,this.fieldTransforms=i,this.type=0}getFieldMask(){return null}}class wt extends bi{constructor(e,t,r,i,s=[]){super(),this.key=e,this.data=t,this.fieldMask=r,this.precondition=i,this.fieldTransforms=s,this.type=1}getFieldMask(){return this.fieldMask}}function xl(n){const e=new Map;return n.fieldMask.fields.forEach((t=>{if(!t.isEmpty()){const r=n.data.field(t);e.set(t,r)}})),e}function Bc(n,e,t){const r=new Map;G(n.length===t.length);for(let i=0;i<t.length;i++){const s=n[i],a=s.transform,u=e.data.field(s.field);r.set(s.field,Kg(a,u,t[i]))}return r}function qc(n,e,t){const r=new Map;for(const i of n){const s=i.transform,a=t.data.field(i.field);r.set(i.field,Hg(s,a,e))}return r}class Fl extends bi{constructor(e,t){super(),this.key=e,this.precondition=t,this.type=2,this.fieldTransforms=[]}getFieldMask(){return null}}class Xg extends bi{constructor(e,t){super(),this.key=e,this.precondition=t,this.type=3,this.fieldTransforms=[]}getFieldMask(){return null}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Zg{constructor(e,t,r,i){this.batchId=e,this.localWriteTime=t,this.baseMutations=r,this.mutations=i}applyToRemoteDocument(e,t){const r=t.mutationResults;for(let i=0;i<this.mutations.length;i++){const s=this.mutations[i];s.key.isEqual(e.key)&&Jg(s,e,r[i])}}applyToLocalView(e,t){for(const r of this.baseMutations)r.key.isEqual(e.key)&&(t=zn(r,e,t,this.localWriteTime));for(const r of this.mutations)r.key.isEqual(e.key)&&(t=zn(r,e,t,this.localWriteTime));return t}applyToLocalDocumentSet(e,t){const r=kl();return this.mutations.forEach((i=>{const s=e.get(i.key),a=s.overlayedDocument;let u=this.applyToLocalView(a,s.mutatedFields);u=t.has(i.key)?null:u;const l=Ml(a,u);l!==null&&r.set(i.key,l),a.isValidDocument()||a.convertToNoDocument(F.min())})),r}keys(){return this.mutations.reduce(((e,t)=>e.add(t.key)),B())}isEqual(e){return this.batchId===e.batchId&&sn(this.mutations,e.mutations,((t,r)=>Uc(t,r)))&&sn(this.baseMutations,e.baseMutations,((t,r)=>Uc(t,r)))}}class bo{constructor(e,t,r,i){this.batch=e,this.commitVersion=t,this.mutationResults=r,this.docVersions=i}static from(e,t,r){G(e.mutations.length===r.length);let i=(function(){return Bg})();const s=e.mutations;for(let a=0;a<s.length;a++)i=i.insert(s[a].key,r[a].version);return new bo(e,t,r,i)}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class em{constructor(e,t){this.largestBatchId=e,this.mutation=t}getKey(){return this.mutation.key}isEqual(e){return e!==null&&this.mutation===e.mutation}toString(){return`Overlay{
      largestBatchId: ${this.largestBatchId},
      mutation: ${this.mutation.toString()}
    }`}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class tm{constructor(e,t){this.count=e,this.unchangedNames=t}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */var ie,$;function nm(n){switch(n){default:return x();case R.CANCELLED:case R.UNKNOWN:case R.DEADLINE_EXCEEDED:case R.RESOURCE_EXHAUSTED:case R.INTERNAL:case R.UNAVAILABLE:case R.UNAUTHENTICATED:return!1;case R.INVALID_ARGUMENT:case R.NOT_FOUND:case R.ALREADY_EXISTS:case R.PERMISSION_DENIED:case R.FAILED_PRECONDITION:case R.ABORTED:case R.OUT_OF_RANGE:case R.UNIMPLEMENTED:case R.DATA_LOSS:return!0}}function Ul(n){if(n===void 0)return Ze("GRPC error has no .code"),R.UNKNOWN;switch(n){case ie.OK:return R.OK;case ie.CANCELLED:return R.CANCELLED;case ie.UNKNOWN:return R.UNKNOWN;case ie.DEADLINE_EXCEEDED:return R.DEADLINE_EXCEEDED;case ie.RESOURCE_EXHAUSTED:return R.RESOURCE_EXHAUSTED;case ie.INTERNAL:return R.INTERNAL;case ie.UNAVAILABLE:return R.UNAVAILABLE;case ie.UNAUTHENTICATED:return R.UNAUTHENTICATED;case ie.INVALID_ARGUMENT:return R.INVALID_ARGUMENT;case ie.NOT_FOUND:return R.NOT_FOUND;case ie.ALREADY_EXISTS:return R.ALREADY_EXISTS;case ie.PERMISSION_DENIED:return R.PERMISSION_DENIED;case ie.FAILED_PRECONDITION:return R.FAILED_PRECONDITION;case ie.ABORTED:return R.ABORTED;case ie.OUT_OF_RANGE:return R.OUT_OF_RANGE;case ie.UNIMPLEMENTED:return R.UNIMPLEMENTED;case ie.DATA_LOSS:return R.DATA_LOSS;default:return x()}}($=ie||(ie={}))[$.OK=0]="OK",$[$.CANCELLED=1]="CANCELLED",$[$.UNKNOWN=2]="UNKNOWN",$[$.INVALID_ARGUMENT=3]="INVALID_ARGUMENT",$[$.DEADLINE_EXCEEDED=4]="DEADLINE_EXCEEDED",$[$.NOT_FOUND=5]="NOT_FOUND",$[$.ALREADY_EXISTS=6]="ALREADY_EXISTS",$[$.PERMISSION_DENIED=7]="PERMISSION_DENIED",$[$.UNAUTHENTICATED=16]="UNAUTHENTICATED",$[$.RESOURCE_EXHAUSTED=8]="RESOURCE_EXHAUSTED",$[$.FAILED_PRECONDITION=9]="FAILED_PRECONDITION",$[$.ABORTED=10]="ABORTED",$[$.OUT_OF_RANGE=11]="OUT_OF_RANGE",$[$.UNIMPLEMENTED=12]="UNIMPLEMENTED",$[$.INTERNAL=13]="INTERNAL",$[$.UNAVAILABLE=14]="UNAVAILABLE",$[$.DATA_LOSS=15]="DATA_LOSS";/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function rm(){return new TextEncoder}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const im=new kt([4294967295,4294967295],0);function $c(n){const e=rm().encode(n),t=new cl;return t.update(e),new Uint8Array(t.digest())}function jc(n){const e=new DataView(n.buffer),t=e.getUint32(0,!0),r=e.getUint32(4,!0),i=e.getUint32(8,!0),s=e.getUint32(12,!0);return[new kt([t,r],0),new kt([i,s],0)]}class Ro{constructor(e,t,r){if(this.bitmap=e,this.padding=t,this.hashCount=r,t<0||t>=8)throw new Un(`Invalid padding: ${t}`);if(r<0)throw new Un(`Invalid hash count: ${r}`);if(e.length>0&&this.hashCount===0)throw new Un(`Invalid hash count: ${r}`);if(e.length===0&&t!==0)throw new Un(`Invalid padding when bitmap length is 0: ${t}`);this.Ie=8*e.length-t,this.Te=kt.fromNumber(this.Ie)}Ee(e,t,r){let i=e.add(t.multiply(kt.fromNumber(r)));return i.compare(im)===1&&(i=new kt([i.getBits(0),i.getBits(1)],0)),i.modulo(this.Te).toNumber()}de(e){return(this.bitmap[Math.floor(e/8)]&1<<e%8)!=0}mightContain(e){if(this.Ie===0)return!1;const t=$c(e),[r,i]=jc(t);for(let s=0;s<this.hashCount;s++){const a=this.Ee(r,i,s);if(!this.de(a))return!1}return!0}static create(e,t,r){const i=e%8==0?0:8-e%8,s=new Uint8Array(Math.ceil(e/8)),a=new Ro(s,i,t);return r.forEach((u=>a.insert(u))),a}insert(e){if(this.Ie===0)return;const t=$c(e),[r,i]=jc(t);for(let s=0;s<this.hashCount;s++){const a=this.Ee(r,i,s);this.Ae(a)}}Ae(e){const t=Math.floor(e/8),r=e%8;this.bitmap[t]|=1<<r}}class Un extends Error{constructor(){super(...arguments),this.name="BloomFilterError"}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ri{constructor(e,t,r,i,s){this.snapshotVersion=e,this.targetChanges=t,this.targetMismatches=r,this.documentUpdates=i,this.resolvedLimboDocuments=s}static createSynthesizedRemoteEventForCurrentChange(e,t,r){const i=new Map;return i.set(e,hr.createSynthesizedTargetChangeForCurrentChange(e,t,r)),new Ri(F.min(),i,new X(z),et(),B())}}class hr{constructor(e,t,r,i,s){this.resumeToken=e,this.current=t,this.addedDocuments=r,this.modifiedDocuments=i,this.removedDocuments=s}static createSynthesizedTargetChangeForCurrentChange(e,t,r){return new hr(r,t,B(),B(),B())}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Qr{constructor(e,t,r,i){this.Re=e,this.removedTargetIds=t,this.key=r,this.Ve=i}}class Bl{constructor(e,t){this.targetId=e,this.me=t}}class ql{constructor(e,t,r=fe.EMPTY_BYTE_STRING,i=null){this.state=e,this.targetIds=t,this.resumeToken=r,this.cause=i}}class zc{constructor(){this.fe=0,this.ge=Kc(),this.pe=fe.EMPTY_BYTE_STRING,this.ye=!1,this.we=!0}get current(){return this.ye}get resumeToken(){return this.pe}get Se(){return this.fe!==0}get be(){return this.we}De(e){e.approximateByteSize()>0&&(this.we=!0,this.pe=e)}ve(){let e=B(),t=B(),r=B();return this.ge.forEach(((i,s)=>{switch(s){case 0:e=e.add(i);break;case 2:t=t.add(i);break;case 1:r=r.add(i);break;default:x()}})),new hr(this.pe,this.ye,e,t,r)}Ce(){this.we=!1,this.ge=Kc()}Fe(e,t){this.we=!0,this.ge=this.ge.insert(e,t)}Me(e){this.we=!0,this.ge=this.ge.remove(e)}xe(){this.fe+=1}Oe(){this.fe-=1,G(this.fe>=0)}Ne(){this.we=!0,this.ye=!0}}class sm{constructor(e){this.Le=e,this.Be=new Map,this.ke=et(),this.qe=Hc(),this.Qe=new X(z)}Ke(e){for(const t of e.Re)e.Ve&&e.Ve.isFoundDocument()?this.$e(t,e.Ve):this.Ue(t,e.key,e.Ve);for(const t of e.removedTargetIds)this.Ue(t,e.key,e.Ve)}We(e){this.forEachTarget(e,(t=>{const r=this.Ge(t);switch(e.state){case 0:this.ze(t)&&r.De(e.resumeToken);break;case 1:r.Oe(),r.Se||r.Ce(),r.De(e.resumeToken);break;case 2:r.Oe(),r.Se||this.removeTarget(t);break;case 3:this.ze(t)&&(r.Ne(),r.De(e.resumeToken));break;case 4:this.ze(t)&&(this.je(t),r.De(e.resumeToken));break;default:x()}}))}forEachTarget(e,t){e.targetIds.length>0?e.targetIds.forEach(t):this.Be.forEach(((r,i)=>{this.ze(i)&&t(i)}))}He(e){const t=e.targetId,r=e.me.count,i=this.Je(t);if(i){const s=i.target;if(Gs(s))if(r===0){const a=new L(s.path);this.Ue(t,a,we.newNoDocument(a,F.min()))}else G(r===1);else{const a=this.Ye(t);if(a!==r){const u=this.Ze(e),l=u?this.Xe(u,e,a):1;if(l!==0){this.je(t);const d=l===2?"TargetPurposeExistenceFilterMismatchBloom":"TargetPurposeExistenceFilterMismatch";this.Qe=this.Qe.insert(t,d)}}}}}Ze(e){const t=e.me.unchangedNames;if(!t||!t.bits)return null;const{bits:{bitmap:r="",padding:i=0},hashCount:s=0}=t;let a,u;try{a=Vt(r).toUint8Array()}catch(l){if(l instanceof _l)return rn("Decoding the base64 bloom filter in existence filter failed ("+l.message+"); ignoring the bloom filter and falling back to full re-query."),null;throw l}try{u=new Ro(a,i,s)}catch(l){return rn(l instanceof Un?"BloomFilter error: ":"Applying bloom filter failed: ",l),null}return u.Ie===0?null:u}Xe(e,t,r){return t.me.count===r-this.nt(e,t.targetId)?0:2}nt(e,t){const r=this.Le.getRemoteKeysForTarget(t);let i=0;return r.forEach((s=>{const a=this.Le.tt(),u=`projects/${a.projectId}/databases/${a.database}/documents/${s.path.canonicalString()}`;e.mightContain(u)||(this.Ue(t,s,null),i++)})),i}rt(e){const t=new Map;this.Be.forEach(((s,a)=>{const u=this.Je(a);if(u){if(s.current&&Gs(u.target)){const l=new L(u.target.path);this.ke.get(l)!==null||this.it(a,l)||this.Ue(a,l,we.newNoDocument(l,e))}s.be&&(t.set(a,s.ve()),s.Ce())}}));let r=B();this.qe.forEach(((s,a)=>{let u=!0;a.forEachWhile((l=>{const d=this.Je(l);return!d||d.purpose==="TargetPurposeLimboResolution"||(u=!1,!1)})),u&&(r=r.add(s))})),this.ke.forEach(((s,a)=>a.setReadTime(e)));const i=new Ri(e,t,this.Qe,this.ke,r);return this.ke=et(),this.qe=Hc(),this.Qe=new X(z),i}$e(e,t){if(!this.ze(e))return;const r=this.it(e,t.key)?2:0;this.Ge(e).Fe(t.key,r),this.ke=this.ke.insert(t.key,t),this.qe=this.qe.insert(t.key,this.st(t.key).add(e))}Ue(e,t,r){if(!this.ze(e))return;const i=this.Ge(e);this.it(e,t)?i.Fe(t,1):i.Me(t),this.qe=this.qe.insert(t,this.st(t).delete(e)),r&&(this.ke=this.ke.insert(t,r))}removeTarget(e){this.Be.delete(e)}Ye(e){const t=this.Ge(e).ve();return this.Le.getRemoteKeysForTarget(e).size+t.addedDocuments.size-t.removedDocuments.size}xe(e){this.Ge(e).xe()}Ge(e){let t=this.Be.get(e);return t||(t=new zc,this.Be.set(e,t)),t}st(e){let t=this.qe.get(e);return t||(t=new de(z),this.qe=this.qe.insert(e,t)),t}ze(e){const t=this.Je(e)!==null;return t||V("WatchChangeAggregator","Detected inactive target",e),t}Je(e){const t=this.Be.get(e);return t&&t.Se?null:this.Le.ot(e)}je(e){this.Be.set(e,new zc),this.Le.getRemoteKeysForTarget(e).forEach((t=>{this.Ue(e,t,null)}))}it(e,t){return this.Le.getRemoteKeysForTarget(e).has(t)}}function Hc(){return new X(L.comparator)}function Kc(){return new X(L.comparator)}const om={asc:"ASCENDING",desc:"DESCENDING"},am={"<":"LESS_THAN","<=":"LESS_THAN_OR_EQUAL",">":"GREATER_THAN",">=":"GREATER_THAN_OR_EQUAL","==":"EQUAL","!=":"NOT_EQUAL","array-contains":"ARRAY_CONTAINS",in:"IN","not-in":"NOT_IN","array-contains-any":"ARRAY_CONTAINS_ANY"},cm={and:"AND",or:"OR"};class um{constructor(e,t){this.databaseId=e,this.useProto3Json=t}}function Ys(n,e){return n.useProto3Json||Ti(e)?e:{value:e}}function ai(n,e){return n.useProto3Json?`${new Date(1e3*e.seconds).toISOString().replace(/\.\d*/,"").replace("Z","")}.${("000000000"+e.nanoseconds).slice(-9)}Z`:{seconds:""+e.seconds,nanos:e.nanoseconds}}function $l(n,e){return n.useProto3Json?e.toBase64():e.toUint8Array()}function lm(n,e){return ai(n,e.toTimestamp())}function Fe(n){return G(!!n),F.fromTimestamp((function(t){const r=_t(t);return new oe(r.seconds,r.nanos)})(n))}function So(n,e){return Xs(n,e).canonicalString()}function Xs(n,e){const t=(function(i){return new Y(["projects",i.projectId,"databases",i.database])})(n).child("documents");return e===void 0?t:t.child(e)}function jl(n){const e=Y.fromString(n);return G(Gl(e)),e}function Zs(n,e){return So(n.databaseId,e.path)}function Es(n,e){const t=jl(e);if(t.get(1)!==n.databaseId.projectId)throw new D(R.INVALID_ARGUMENT,"Tried to deserialize key from different project: "+t.get(1)+" vs "+n.databaseId.projectId);if(t.get(3)!==n.databaseId.database)throw new D(R.INVALID_ARGUMENT,"Tried to deserialize key from different database: "+t.get(3)+" vs "+n.databaseId.database);return new L(Hl(t))}function zl(n,e){return So(n.databaseId,e)}function hm(n){const e=jl(n);return e.length===4?Y.emptyPath():Hl(e)}function eo(n){return new Y(["projects",n.databaseId.projectId,"databases",n.databaseId.database]).canonicalString()}function Hl(n){return G(n.length>4&&n.get(4)==="documents"),n.popFirst(5)}function Wc(n,e,t){return{name:Zs(n,e),fields:t.value.mapValue.fields}}function dm(n,e){let t;if("targetChange"in e){e.targetChange;const r=(function(d){return d==="NO_CHANGE"?0:d==="ADD"?1:d==="REMOVE"?2:d==="CURRENT"?3:d==="RESET"?4:x()})(e.targetChange.targetChangeType||"NO_CHANGE"),i=e.targetChange.targetIds||[],s=(function(d,p){return d.useProto3Json?(G(p===void 0||typeof p=="string"),fe.fromBase64String(p||"")):(G(p===void 0||p instanceof Buffer||p instanceof Uint8Array),fe.fromUint8Array(p||new Uint8Array))})(n,e.targetChange.resumeToken),a=e.targetChange.cause,u=a&&(function(d){const p=d.code===void 0?R.UNKNOWN:Ul(d.code);return new D(p,d.message||"")})(a);t=new ql(r,i,s,u||null)}else if("documentChange"in e){e.documentChange;const r=e.documentChange;r.document,r.document.name,r.document.updateTime;const i=Es(n,r.document.name),s=Fe(r.document.updateTime),a=r.document.createTime?Fe(r.document.createTime):F.min(),u=new be({mapValue:{fields:r.document.fields}}),l=we.newFoundDocument(i,s,a,u),d=r.targetIds||[],p=r.removedTargetIds||[];t=new Qr(d,p,l.key,l)}else if("documentDelete"in e){e.documentDelete;const r=e.documentDelete;r.document;const i=Es(n,r.document),s=r.readTime?Fe(r.readTime):F.min(),a=we.newNoDocument(i,s),u=r.removedTargetIds||[];t=new Qr([],u,a.key,a)}else if("documentRemove"in e){e.documentRemove;const r=e.documentRemove;r.document;const i=Es(n,r.document),s=r.removedTargetIds||[];t=new Qr([],s,i,null)}else{if(!("filter"in e))return x();{e.filter;const r=e.filter;r.targetId;const{count:i=0,unchangedNames:s}=r,a=new tm(i,s),u=r.targetId;t=new Bl(u,a)}}return t}function fm(n,e){let t;if(e instanceof lr)t={update:Wc(n,e.key,e.value)};else if(e instanceof Fl)t={delete:Zs(n,e.key)};else if(e instanceof wt)t={update:Wc(n,e.key,e.data),updateMask:Em(e.fieldMask)};else{if(!(e instanceof Xg))return x();t={verify:Zs(n,e.key)}}return e.fieldTransforms.length>0&&(t.updateTransforms=e.fieldTransforms.map((r=>(function(s,a){const u=a.transform;if(u instanceof tr)return{fieldPath:a.field.canonicalString(),setToServerValue:"REQUEST_TIME"};if(u instanceof nr)return{fieldPath:a.field.canonicalString(),appendMissingElements:{values:u.elements}};if(u instanceof rr)return{fieldPath:a.field.canonicalString(),removeAllFromArray:{values:u.elements}};if(u instanceof oi)return{fieldPath:a.field.canonicalString(),increment:u.Pe};throw x()})(0,r)))),e.precondition.isNone||(t.currentDocument=(function(i,s){return s.updateTime!==void 0?{updateTime:lm(i,s.updateTime)}:s.exists!==void 0?{exists:s.exists}:x()})(n,e.precondition)),t}function pm(n,e){return n&&n.length>0?(G(e!==void 0),n.map((t=>(function(i,s){let a=i.updateTime?Fe(i.updateTime):Fe(s);return a.isEqual(F.min())&&(a=Fe(s)),new Qg(a,i.transformResults||[])})(t,e)))):[]}function gm(n,e){return{documents:[zl(n,e.path)]}}function mm(n,e){const t={structuredQuery:{}},r=e.path;let i;e.collectionGroup!==null?(i=r,t.structuredQuery.from=[{collectionId:e.collectionGroup,allDescendants:!0}]):(i=r.popLast(),t.structuredQuery.from=[{collectionId:r.lastSegment()}]),t.parent=zl(n,i);const s=(function(d){if(d.length!==0)return Wl(Oe.create(d,"and"))})(e.filters);s&&(t.structuredQuery.where=s);const a=(function(d){if(d.length!==0)return d.map((p=>(function(A){return{field:Qt(A.field),direction:vm(A.dir)}})(p)))})(e.orderBy);a&&(t.structuredQuery.orderBy=a);const u=Ys(n,e.limit);return u!==null&&(t.structuredQuery.limit=u),e.startAt&&(t.structuredQuery.startAt=(function(d){return{before:d.inclusive,values:d.position}})(e.startAt)),e.endAt&&(t.structuredQuery.endAt=(function(d){return{before:!d.inclusive,values:d.position}})(e.endAt)),{_t:t,parent:i}}function _m(n){let e=hm(n.parent);const t=n.structuredQuery,r=t.from?t.from.length:0;let i=null;if(r>0){G(r===1);const p=t.from[0];p.allDescendants?i=p.collectionId:e=e.child(p.collectionId)}let s=[];t.where&&(s=(function(v){const A=Kl(v);return A instanceof Oe&&Tl(A)?A.getFilters():[A]})(t.where));let a=[];t.orderBy&&(a=(function(v){return v.map((A=>(function(k){return new er(Jt(k.field),(function(N){switch(N){case"ASCENDING":return"asc";case"DESCENDING":return"desc";default:return}})(k.direction))})(A)))})(t.orderBy));let u=null;t.limit&&(u=(function(v){let A;return A=typeof v=="object"?v.value:v,Ti(A)?null:A})(t.limit));let l=null;t.startAt&&(l=(function(v){const A=!!v.before,S=v.values||[];return new si(S,A)})(t.startAt));let d=null;return t.endAt&&(d=(function(v){const A=!v.before,S=v.values||[];return new si(S,A)})(t.endAt)),Lg(e,i,a,s,u,"F",l,d)}function ym(n,e){const t=(function(i){switch(i){case"TargetPurposeListen":return null;case"TargetPurposeExistenceFilterMismatch":return"existence-filter-mismatch";case"TargetPurposeExistenceFilterMismatchBloom":return"existence-filter-mismatch-bloom";case"TargetPurposeLimboResolution":return"limbo-document";default:return x()}})(e.purpose);return t==null?null:{"goog-listen-tags":t}}function Kl(n){return n.unaryFilter!==void 0?(function(t){switch(t.unaryFilter.op){case"IS_NAN":const r=Jt(t.unaryFilter.field);return se.create(r,"==",{doubleValue:NaN});case"IS_NULL":const i=Jt(t.unaryFilter.field);return se.create(i,"==",{nullValue:"NULL_VALUE"});case"IS_NOT_NAN":const s=Jt(t.unaryFilter.field);return se.create(s,"!=",{doubleValue:NaN});case"IS_NOT_NULL":const a=Jt(t.unaryFilter.field);return se.create(a,"!=",{nullValue:"NULL_VALUE"});default:return x()}})(n):n.fieldFilter!==void 0?(function(t){return se.create(Jt(t.fieldFilter.field),(function(i){switch(i){case"EQUAL":return"==";case"NOT_EQUAL":return"!=";case"GREATER_THAN":return">";case"GREATER_THAN_OR_EQUAL":return">=";case"LESS_THAN":return"<";case"LESS_THAN_OR_EQUAL":return"<=";case"ARRAY_CONTAINS":return"array-contains";case"IN":return"in";case"NOT_IN":return"not-in";case"ARRAY_CONTAINS_ANY":return"array-contains-any";default:return x()}})(t.fieldFilter.op),t.fieldFilter.value)})(n):n.compositeFilter!==void 0?(function(t){return Oe.create(t.compositeFilter.filters.map((r=>Kl(r))),(function(i){switch(i){case"AND":return"and";case"OR":return"or";default:return x()}})(t.compositeFilter.op))})(n):x()}function vm(n){return om[n]}function wm(n){return am[n]}function Tm(n){return cm[n]}function Qt(n){return{fieldPath:n.canonicalString()}}function Jt(n){return le.fromServerFormat(n.fieldPath)}function Wl(n){return n instanceof se?(function(t){if(t.op==="=="){if(Vc(t.value))return{unaryFilter:{field:Qt(t.field),op:"IS_NAN"}};if(Dc(t.value))return{unaryFilter:{field:Qt(t.field),op:"IS_NULL"}}}else if(t.op==="!="){if(Vc(t.value))return{unaryFilter:{field:Qt(t.field),op:"IS_NOT_NAN"}};if(Dc(t.value))return{unaryFilter:{field:Qt(t.field),op:"IS_NOT_NULL"}}}return{fieldFilter:{field:Qt(t.field),op:wm(t.op),value:t.value}}})(n):n instanceof Oe?(function(t){const r=t.getFilters().map((i=>Wl(i)));return r.length===1?r[0]:{compositeFilter:{op:Tm(t.op),filters:r}}})(n):x()}function Em(n){const e=[];return n.fields.forEach((t=>e.push(t.canonicalString()))),{fieldPaths:e}}function Gl(n){return n.length>=4&&n.get(0)==="projects"&&n.get(2)==="databases"}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class dt{constructor(e,t,r,i,s=F.min(),a=F.min(),u=fe.EMPTY_BYTE_STRING,l=null){this.target=e,this.targetId=t,this.purpose=r,this.sequenceNumber=i,this.snapshotVersion=s,this.lastLimboFreeSnapshotVersion=a,this.resumeToken=u,this.expectedCount=l}withSequenceNumber(e){return new dt(this.target,this.targetId,this.purpose,e,this.snapshotVersion,this.lastLimboFreeSnapshotVersion,this.resumeToken,this.expectedCount)}withResumeToken(e,t){return new dt(this.target,this.targetId,this.purpose,this.sequenceNumber,t,this.lastLimboFreeSnapshotVersion,e,null)}withExpectedCount(e){return new dt(this.target,this.targetId,this.purpose,this.sequenceNumber,this.snapshotVersion,this.lastLimboFreeSnapshotVersion,this.resumeToken,e)}withLastLimboFreeSnapshotVersion(e){return new dt(this.target,this.targetId,this.purpose,this.sequenceNumber,this.snapshotVersion,e,this.resumeToken,this.expectedCount)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Im{constructor(e){this.ct=e}}function Am(n){const e=_m({parent:n.parent,structuredQuery:n.structuredQuery});return n.limitType==="LAST"?Js(e,e.limit,"L"):e}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class bm{constructor(){this.un=new Rm}addToCollectionParentIndex(e,t){return this.un.add(t),P.resolve()}getCollectionParents(e,t){return P.resolve(this.un.getEntries(t))}addFieldIndex(e,t){return P.resolve()}deleteFieldIndex(e,t){return P.resolve()}deleteAllFieldIndexes(e){return P.resolve()}createTargetIndexes(e,t){return P.resolve()}getDocumentsMatchingTarget(e,t){return P.resolve(null)}getIndexType(e,t){return P.resolve(0)}getFieldIndexes(e,t){return P.resolve([])}getNextCollectionGroupToUpdate(e){return P.resolve(null)}getMinOffset(e,t){return P.resolve(mt.min())}getMinOffsetFromCollectionGroup(e,t){return P.resolve(mt.min())}updateCollectionGroup(e,t,r){return P.resolve()}updateIndexEntries(e,t){return P.resolve()}}class Rm{constructor(){this.index={}}add(e){const t=e.lastSegment(),r=e.popLast(),i=this.index[t]||new de(Y.comparator),s=!i.has(r);return this.index[t]=i.add(r),s}has(e){const t=e.lastSegment(),r=e.popLast(),i=this.index[t];return i&&i.has(r)}getEntries(e){return(this.index[e]||new de(Y.comparator)).toArray()}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class cn{constructor(e){this.Ln=e}next(){return this.Ln+=2,this.Ln}static Bn(){return new cn(0)}static kn(){return new cn(-1)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Sm{constructor(){this.changes=new gn((e=>e.toString()),((e,t)=>e.isEqual(t))),this.changesApplied=!1}addEntry(e){this.assertNotApplied(),this.changes.set(e.key,e)}removeEntry(e,t){this.assertNotApplied(),this.changes.set(e,we.newInvalidDocument(e).setReadTime(t))}getEntry(e,t){this.assertNotApplied();const r=this.changes.get(t);return r!==void 0?P.resolve(r):this.getFromCache(e,t)}getEntries(e,t){return this.getAllFromCache(e,t)}apply(e){return this.assertNotApplied(),this.changesApplied=!0,this.applyChanges(e)}assertNotApplied(){}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *//**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Pm{constructor(e,t){this.overlayedDocument=e,this.mutatedFields=t}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Cm{constructor(e,t,r,i){this.remoteDocumentCache=e,this.mutationQueue=t,this.documentOverlayCache=r,this.indexManager=i}getDocument(e,t){let r=null;return this.documentOverlayCache.getOverlay(e,t).next((i=>(r=i,this.remoteDocumentCache.getEntry(e,t)))).next((i=>(r!==null&&zn(r.mutation,i,Ce.empty(),oe.now()),i)))}getDocuments(e,t){return this.remoteDocumentCache.getEntries(e,t).next((r=>this.getLocalViewOfDocuments(e,r,B()).next((()=>r))))}getLocalViewOfDocuments(e,t,r=B()){const i=Pt();return this.populateOverlays(e,i,t).next((()=>this.computeViews(e,t,i,r).next((s=>{let a=Fn();return s.forEach(((u,l)=>{a=a.insert(u,l.overlayedDocument)})),a}))))}getOverlayedDocuments(e,t){const r=Pt();return this.populateOverlays(e,r,t).next((()=>this.computeViews(e,t,r,B())))}populateOverlays(e,t,r){const i=[];return r.forEach((s=>{t.has(s)||i.push(s)})),this.documentOverlayCache.getOverlays(e,i).next((s=>{s.forEach(((a,u)=>{t.set(a,u)}))}))}computeViews(e,t,r,i){let s=et();const a=jn(),u=(function(){return jn()})();return t.forEach(((l,d)=>{const p=r.get(d.key);i.has(d.key)&&(p===void 0||p.mutation instanceof wt)?s=s.insert(d.key,d):p!==void 0?(a.set(d.key,p.mutation.getFieldMask()),zn(p.mutation,d,p.mutation.getFieldMask(),oe.now())):a.set(d.key,Ce.empty())})),this.recalculateAndSaveOverlays(e,s).next((l=>(l.forEach(((d,p)=>a.set(d,p))),t.forEach(((d,p)=>{var v;return u.set(d,new Pm(p,(v=a.get(d))!==null&&v!==void 0?v:null))})),u)))}recalculateAndSaveOverlays(e,t){const r=jn();let i=new X(((a,u)=>a-u)),s=B();return this.mutationQueue.getAllMutationBatchesAffectingDocumentKeys(e,t).next((a=>{for(const u of a)u.keys().forEach((l=>{const d=t.get(l);if(d===null)return;let p=r.get(l)||Ce.empty();p=u.applyToLocalView(d,p),r.set(l,p);const v=(i.get(u.batchId)||B()).add(l);i=i.insert(u.batchId,v)}))})).next((()=>{const a=[],u=i.getReverseIterator();for(;u.hasNext();){const l=u.getNext(),d=l.key,p=l.value,v=kl();p.forEach((A=>{if(!s.has(A)){const S=Ml(t.get(A),r.get(A));S!==null&&v.set(A,S),s=s.add(A)}})),a.push(this.documentOverlayCache.saveOverlays(e,d,v))}return P.waitFor(a)})).next((()=>r))}recalculateAndSaveOverlaysForDocumentKeys(e,t){return this.remoteDocumentCache.getEntries(e,t).next((r=>this.recalculateAndSaveOverlays(e,r)))}getDocumentsMatchingQuery(e,t,r,i){return(function(a){return L.isDocumentKey(a.path)&&a.collectionGroup===null&&a.filters.length===0})(t)?this.getDocumentsMatchingDocumentQuery(e,t.path):bl(t)?this.getDocumentsMatchingCollectionGroupQuery(e,t,r,i):this.getDocumentsMatchingCollectionQuery(e,t,r,i)}getNextDocuments(e,t,r,i){return this.remoteDocumentCache.getAllFromCollectionGroup(e,t,r,i).next((s=>{const a=i-s.size>0?this.documentOverlayCache.getOverlaysForCollectionGroup(e,t,r.largestBatchId,i-s.size):P.resolve(Pt());let u=-1,l=s;return a.next((d=>P.forEach(d,((p,v)=>(u<v.largestBatchId&&(u=v.largestBatchId),s.get(p)?P.resolve():this.remoteDocumentCache.getEntry(e,p).next((A=>{l=l.insert(p,A)}))))).next((()=>this.populateOverlays(e,d,s))).next((()=>this.computeViews(e,l,d,B()))).next((p=>({batchId:u,changes:Cl(p)})))))}))}getDocumentsMatchingDocumentQuery(e,t){return this.getDocument(e,new L(t)).next((r=>{let i=Fn();return r.isFoundDocument()&&(i=i.insert(r.key,r)),i}))}getDocumentsMatchingCollectionGroupQuery(e,t,r,i){const s=t.collectionGroup;let a=Fn();return this.indexManager.getCollectionParents(e,s).next((u=>P.forEach(u,(l=>{const d=(function(v,A){return new pn(A,null,v.explicitOrderBy.slice(),v.filters.slice(),v.limit,v.limitType,v.startAt,v.endAt)})(t,l.child(s));return this.getDocumentsMatchingCollectionQuery(e,d,r,i).next((p=>{p.forEach(((v,A)=>{a=a.insert(v,A)}))}))})).next((()=>a))))}getDocumentsMatchingCollectionQuery(e,t,r,i){let s;return this.documentOverlayCache.getOverlaysForCollection(e,t.path,r.largestBatchId).next((a=>(s=a,this.remoteDocumentCache.getDocumentsMatchingQuery(e,t,r,s,i)))).next((a=>{s.forEach(((l,d)=>{const p=d.getKey();a.get(p)===null&&(a=a.insert(p,we.newInvalidDocument(p)))}));let u=Fn();return a.forEach(((l,d)=>{const p=s.get(l);p!==void 0&&zn(p.mutation,d,Ce.empty(),oe.now()),Ii(t,d)&&(u=u.insert(l,d))})),u}))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class km{constructor(e){this.serializer=e,this.hr=new Map,this.Pr=new Map}getBundleMetadata(e,t){return P.resolve(this.hr.get(t))}saveBundleMetadata(e,t){return this.hr.set(t.id,(function(i){return{id:i.id,version:i.version,createTime:Fe(i.createTime)}})(t)),P.resolve()}getNamedQuery(e,t){return P.resolve(this.Pr.get(t))}saveNamedQuery(e,t){return this.Pr.set(t.name,(function(i){return{name:i.name,query:Am(i.bundledQuery),readTime:Fe(i.readTime)}})(t)),P.resolve()}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Nm{constructor(){this.overlays=new X(L.comparator),this.Ir=new Map}getOverlay(e,t){return P.resolve(this.overlays.get(t))}getOverlays(e,t){const r=Pt();return P.forEach(t,(i=>this.getOverlay(e,i).next((s=>{s!==null&&r.set(i,s)})))).next((()=>r))}saveOverlays(e,t,r){return r.forEach(((i,s)=>{this.ht(e,t,s)})),P.resolve()}removeOverlaysForBatchId(e,t,r){const i=this.Ir.get(r);return i!==void 0&&(i.forEach((s=>this.overlays=this.overlays.remove(s))),this.Ir.delete(r)),P.resolve()}getOverlaysForCollection(e,t,r){const i=Pt(),s=t.length+1,a=new L(t.child("")),u=this.overlays.getIteratorFrom(a);for(;u.hasNext();){const l=u.getNext().value,d=l.getKey();if(!t.isPrefixOf(d.path))break;d.path.length===s&&l.largestBatchId>r&&i.set(l.getKey(),l)}return P.resolve(i)}getOverlaysForCollectionGroup(e,t,r,i){let s=new X(((d,p)=>d-p));const a=this.overlays.getIterator();for(;a.hasNext();){const d=a.getNext().value;if(d.getKey().getCollectionGroup()===t&&d.largestBatchId>r){let p=s.get(d.largestBatchId);p===null&&(p=Pt(),s=s.insert(d.largestBatchId,p)),p.set(d.getKey(),d)}}const u=Pt(),l=s.getIterator();for(;l.hasNext()&&(l.getNext().value.forEach(((d,p)=>u.set(d,p))),!(u.size()>=i)););return P.resolve(u)}ht(e,t,r){const i=this.overlays.get(r.key);if(i!==null){const a=this.Ir.get(i.largestBatchId).delete(r.key);this.Ir.set(i.largestBatchId,a)}this.overlays=this.overlays.insert(r.key,new em(t,r));let s=this.Ir.get(t);s===void 0&&(s=B(),this.Ir.set(t,s)),this.Ir.set(t,s.add(r.key))}}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Dm{constructor(){this.sessionToken=fe.EMPTY_BYTE_STRING}getSessionToken(e){return P.resolve(this.sessionToken)}setSessionToken(e,t){return this.sessionToken=t,P.resolve()}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Po{constructor(){this.Tr=new de(ae.Er),this.dr=new de(ae.Ar)}isEmpty(){return this.Tr.isEmpty()}addReference(e,t){const r=new ae(e,t);this.Tr=this.Tr.add(r),this.dr=this.dr.add(r)}Rr(e,t){e.forEach((r=>this.addReference(r,t)))}removeReference(e,t){this.Vr(new ae(e,t))}mr(e,t){e.forEach((r=>this.removeReference(r,t)))}gr(e){const t=new L(new Y([])),r=new ae(t,e),i=new ae(t,e+1),s=[];return this.dr.forEachInRange([r,i],(a=>{this.Vr(a),s.push(a.key)})),s}pr(){this.Tr.forEach((e=>this.Vr(e)))}Vr(e){this.Tr=this.Tr.delete(e),this.dr=this.dr.delete(e)}yr(e){const t=new L(new Y([])),r=new ae(t,e),i=new ae(t,e+1);let s=B();return this.dr.forEachInRange([r,i],(a=>{s=s.add(a.key)})),s}containsKey(e){const t=new ae(e,0),r=this.Tr.firstAfterOrEqual(t);return r!==null&&e.isEqual(r.key)}}class ae{constructor(e,t){this.key=e,this.wr=t}static Er(e,t){return L.comparator(e.key,t.key)||z(e.wr,t.wr)}static Ar(e,t){return z(e.wr,t.wr)||L.comparator(e.key,t.key)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Vm{constructor(e,t){this.indexManager=e,this.referenceDelegate=t,this.mutationQueue=[],this.Sr=1,this.br=new de(ae.Er)}checkEmpty(e){return P.resolve(this.mutationQueue.length===0)}addMutationBatch(e,t,r,i){const s=this.Sr;this.Sr++,this.mutationQueue.length>0&&this.mutationQueue[this.mutationQueue.length-1];const a=new Zg(s,t,r,i);this.mutationQueue.push(a);for(const u of i)this.br=this.br.add(new ae(u.key,s)),this.indexManager.addToCollectionParentIndex(e,u.key.path.popLast());return P.resolve(a)}lookupMutationBatch(e,t){return P.resolve(this.Dr(t))}getNextMutationBatchAfterBatchId(e,t){const r=t+1,i=this.vr(r),s=i<0?0:i;return P.resolve(this.mutationQueue.length>s?this.mutationQueue[s]:null)}getHighestUnacknowledgedBatchId(){return P.resolve(this.mutationQueue.length===0?-1:this.Sr-1)}getAllMutationBatches(e){return P.resolve(this.mutationQueue.slice())}getAllMutationBatchesAffectingDocumentKey(e,t){const r=new ae(t,0),i=new ae(t,Number.POSITIVE_INFINITY),s=[];return this.br.forEachInRange([r,i],(a=>{const u=this.Dr(a.wr);s.push(u)})),P.resolve(s)}getAllMutationBatchesAffectingDocumentKeys(e,t){let r=new de(z);return t.forEach((i=>{const s=new ae(i,0),a=new ae(i,Number.POSITIVE_INFINITY);this.br.forEachInRange([s,a],(u=>{r=r.add(u.wr)}))})),P.resolve(this.Cr(r))}getAllMutationBatchesAffectingQuery(e,t){const r=t.path,i=r.length+1;let s=r;L.isDocumentKey(s)||(s=s.child(""));const a=new ae(new L(s),0);let u=new de(z);return this.br.forEachWhile((l=>{const d=l.key.path;return!!r.isPrefixOf(d)&&(d.length===i&&(u=u.add(l.wr)),!0)}),a),P.resolve(this.Cr(u))}Cr(e){const t=[];return e.forEach((r=>{const i=this.Dr(r);i!==null&&t.push(i)})),t}removeMutationBatch(e,t){G(this.Fr(t.batchId,"removed")===0),this.mutationQueue.shift();let r=this.br;return P.forEach(t.mutations,(i=>{const s=new ae(i.key,t.batchId);return r=r.delete(s),this.referenceDelegate.markPotentiallyOrphaned(e,i.key)})).next((()=>{this.br=r}))}On(e){}containsKey(e,t){const r=new ae(t,0),i=this.br.firstAfterOrEqual(r);return P.resolve(t.isEqual(i&&i.key))}performConsistencyCheck(e){return this.mutationQueue.length,P.resolve()}Fr(e,t){return this.vr(e)}vr(e){return this.mutationQueue.length===0?0:e-this.mutationQueue[0].batchId}Dr(e){const t=this.vr(e);return t<0||t>=this.mutationQueue.length?null:this.mutationQueue[t]}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Om{constructor(e){this.Mr=e,this.docs=(function(){return new X(L.comparator)})(),this.size=0}setIndexManager(e){this.indexManager=e}addEntry(e,t){const r=t.key,i=this.docs.get(r),s=i?i.size:0,a=this.Mr(t);return this.docs=this.docs.insert(r,{document:t.mutableCopy(),size:a}),this.size+=a-s,this.indexManager.addToCollectionParentIndex(e,r.path.popLast())}removeEntry(e){const t=this.docs.get(e);t&&(this.docs=this.docs.remove(e),this.size-=t.size)}getEntry(e,t){const r=this.docs.get(t);return P.resolve(r?r.document.mutableCopy():we.newInvalidDocument(t))}getEntries(e,t){let r=et();return t.forEach((i=>{const s=this.docs.get(i);r=r.insert(i,s?s.document.mutableCopy():we.newInvalidDocument(i))})),P.resolve(r)}getDocumentsMatchingQuery(e,t,r,i){let s=et();const a=t.path,u=new L(a.child("")),l=this.docs.getIteratorFrom(u);for(;l.hasNext();){const{key:d,value:{document:p}}=l.getNext();if(!a.isPrefixOf(d.path))break;d.path.length>a.length+1||mg(gg(p),r)<=0||(i.has(p.key)||Ii(t,p))&&(s=s.insert(p.key,p.mutableCopy()))}return P.resolve(s)}getAllFromCollectionGroup(e,t,r,i){x()}Or(e,t){return P.forEach(this.docs,(r=>t(r)))}newChangeBuffer(e){return new Lm(this)}getSize(e){return P.resolve(this.size)}}class Lm extends Sm{constructor(e){super(),this.cr=e}applyChanges(e){const t=[];return this.changes.forEach(((r,i)=>{i.isValidDocument()?t.push(this.cr.addEntry(e,i)):this.cr.removeEntry(r)})),P.waitFor(t)}getFromCache(e,t){return this.cr.getEntry(e,t)}getAllFromCache(e,t){return this.cr.getEntries(e,t)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Mm{constructor(e){this.persistence=e,this.Nr=new gn((t=>To(t)),Eo),this.lastRemoteSnapshotVersion=F.min(),this.highestTargetId=0,this.Lr=0,this.Br=new Po,this.targetCount=0,this.kr=cn.Bn()}forEachTarget(e,t){return this.Nr.forEach(((r,i)=>t(i))),P.resolve()}getLastRemoteSnapshotVersion(e){return P.resolve(this.lastRemoteSnapshotVersion)}getHighestSequenceNumber(e){return P.resolve(this.Lr)}allocateTargetId(e){return this.highestTargetId=this.kr.next(),P.resolve(this.highestTargetId)}setTargetsMetadata(e,t,r){return r&&(this.lastRemoteSnapshotVersion=r),t>this.Lr&&(this.Lr=t),P.resolve()}Kn(e){this.Nr.set(e.target,e);const t=e.targetId;t>this.highestTargetId&&(this.kr=new cn(t),this.highestTargetId=t),e.sequenceNumber>this.Lr&&(this.Lr=e.sequenceNumber)}addTargetData(e,t){return this.Kn(t),this.targetCount+=1,P.resolve()}updateTargetData(e,t){return this.Kn(t),P.resolve()}removeTargetData(e,t){return this.Nr.delete(t.target),this.Br.gr(t.targetId),this.targetCount-=1,P.resolve()}removeTargets(e,t,r){let i=0;const s=[];return this.Nr.forEach(((a,u)=>{u.sequenceNumber<=t&&r.get(u.targetId)===null&&(this.Nr.delete(a),s.push(this.removeMatchingKeysForTargetId(e,u.targetId)),i++)})),P.waitFor(s).next((()=>i))}getTargetCount(e){return P.resolve(this.targetCount)}getTargetData(e,t){const r=this.Nr.get(t)||null;return P.resolve(r)}addMatchingKeys(e,t,r){return this.Br.Rr(t,r),P.resolve()}removeMatchingKeys(e,t,r){this.Br.mr(t,r);const i=this.persistence.referenceDelegate,s=[];return i&&t.forEach((a=>{s.push(i.markPotentiallyOrphaned(e,a))})),P.waitFor(s)}removeMatchingKeysForTargetId(e,t){return this.Br.gr(t),P.resolve()}getMatchingKeysForTargetId(e,t){const r=this.Br.yr(t);return P.resolve(r)}containsKey(e,t){return P.resolve(this.Br.containsKey(t))}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class xm{constructor(e,t){this.qr={},this.overlays={},this.Qr=new _o(0),this.Kr=!1,this.Kr=!0,this.$r=new Dm,this.referenceDelegate=e(this),this.Ur=new Mm(this),this.indexManager=new bm,this.remoteDocumentCache=(function(i){return new Om(i)})((r=>this.referenceDelegate.Wr(r))),this.serializer=new Im(t),this.Gr=new km(this.serializer)}start(){return Promise.resolve()}shutdown(){return this.Kr=!1,Promise.resolve()}get started(){return this.Kr}setDatabaseDeletedListener(){}setNetworkEnabled(){}getIndexManager(e){return this.indexManager}getDocumentOverlayCache(e){let t=this.overlays[e.toKey()];return t||(t=new Nm,this.overlays[e.toKey()]=t),t}getMutationQueue(e,t){let r=this.qr[e.toKey()];return r||(r=new Vm(t,this.referenceDelegate),this.qr[e.toKey()]=r),r}getGlobalsCache(){return this.$r}getTargetCache(){return this.Ur}getRemoteDocumentCache(){return this.remoteDocumentCache}getBundleCache(){return this.Gr}runTransaction(e,t,r){V("MemoryPersistence","Starting transaction:",e);const i=new Fm(this.Qr.next());return this.referenceDelegate.zr(),r(i).next((s=>this.referenceDelegate.jr(i).next((()=>s)))).toPromise().then((s=>(i.raiseOnCommittedEvent(),s)))}Hr(e,t){return P.or(Object.values(this.qr).map((r=>()=>r.containsKey(e,t))))}}class Fm extends yg{constructor(e){super(),this.currentSequenceNumber=e}}class Co{constructor(e){this.persistence=e,this.Jr=new Po,this.Yr=null}static Zr(e){return new Co(e)}get Xr(){if(this.Yr)return this.Yr;throw x()}addReference(e,t,r){return this.Jr.addReference(r,t),this.Xr.delete(r.toString()),P.resolve()}removeReference(e,t,r){return this.Jr.removeReference(r,t),this.Xr.add(r.toString()),P.resolve()}markPotentiallyOrphaned(e,t){return this.Xr.add(t.toString()),P.resolve()}removeTarget(e,t){this.Jr.gr(t.targetId).forEach((i=>this.Xr.add(i.toString())));const r=this.persistence.getTargetCache();return r.getMatchingKeysForTargetId(e,t.targetId).next((i=>{i.forEach((s=>this.Xr.add(s.toString())))})).next((()=>r.removeTargetData(e,t)))}zr(){this.Yr=new Set}jr(e){const t=this.persistence.getRemoteDocumentCache().newChangeBuffer();return P.forEach(this.Xr,(r=>{const i=L.fromPath(r);return this.ei(e,i).next((s=>{s||t.removeEntry(i,F.min())}))})).next((()=>(this.Yr=null,t.apply(e))))}updateLimboDocument(e,t){return this.ei(e,t).next((r=>{r?this.Xr.delete(t.toString()):this.Xr.add(t.toString())}))}Wr(e){return 0}ei(e,t){return P.or([()=>P.resolve(this.Jr.containsKey(t)),()=>this.persistence.getTargetCache().containsKey(e,t),()=>this.persistence.Hr(e,t)])}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ko{constructor(e,t,r,i){this.targetId=e,this.fromCache=t,this.$i=r,this.Ui=i}static Wi(e,t){let r=B(),i=B();for(const s of t.docChanges)switch(s.type){case 0:r=r.add(s.doc.key);break;case 1:i=i.add(s.doc.key)}return new ko(e,t.fromCache,r,i)}}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Um{constructor(){this._documentReadCount=0}get documentReadCount(){return this._documentReadCount}incrementDocumentReadCount(e){this._documentReadCount+=e}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Bm{constructor(){this.Gi=!1,this.zi=!1,this.ji=100,this.Hi=(function(){return zf()?8:vg(Te())>0?6:4})()}initialize(e,t){this.Ji=e,this.indexManager=t,this.Gi=!0}getDocumentsMatchingQuery(e,t,r,i){const s={result:null};return this.Yi(e,t).next((a=>{s.result=a})).next((()=>{if(!s.result)return this.Zi(e,t,i,r).next((a=>{s.result=a}))})).next((()=>{if(s.result)return;const a=new Um;return this.Xi(e,t,a).next((u=>{if(s.result=u,this.zi)return this.es(e,t,a,u.size)}))})).next((()=>s.result))}es(e,t,r,i){return r.documentReadCount<this.ji?(Mn()<=q.DEBUG&&V("QueryEngine","SDK will not create cache indexes for query:",Gt(t),"since it only creates cache indexes for collection contains","more than or equal to",this.ji,"documents"),P.resolve()):(Mn()<=q.DEBUG&&V("QueryEngine","Query:",Gt(t),"scans",r.documentReadCount,"local documents and returns",i,"documents as results."),r.documentReadCount>this.Hi*i?(Mn()<=q.DEBUG&&V("QueryEngine","The SDK decides to create cache indexes for query:",Gt(t),"as using cache indexes may help improve performance."),this.indexManager.createTargetIndexes(e,Me(t))):P.resolve())}Yi(e,t){if(xc(t))return P.resolve(null);let r=Me(t);return this.indexManager.getIndexType(e,r).next((i=>i===0?null:(t.limit!==null&&i===1&&(t=Js(t,null,"F"),r=Me(t)),this.indexManager.getDocumentsMatchingTarget(e,r).next((s=>{const a=B(...s);return this.Ji.getDocuments(e,a).next((u=>this.indexManager.getMinOffset(e,r).next((l=>{const d=this.ts(t,u);return this.ns(t,d,a,l.readTime)?this.Yi(e,Js(t,null,"F")):this.rs(e,d,t,l)}))))})))))}Zi(e,t,r,i){return xc(t)||i.isEqual(F.min())?P.resolve(null):this.Ji.getDocuments(e,r).next((s=>{const a=this.ts(t,s);return this.ns(t,a,r,i)?P.resolve(null):(Mn()<=q.DEBUG&&V("QueryEngine","Re-using previous result from %s to execute query: %s",i.toString(),Gt(t)),this.rs(e,a,t,pg(i,-1)).next((u=>u)))}))}ts(e,t){let r=new de(Sl(e));return t.forEach(((i,s)=>{Ii(e,s)&&(r=r.add(s))})),r}ns(e,t,r,i){if(e.limit===null)return!1;if(r.size!==t.size)return!0;const s=e.limitType==="F"?t.last():t.first();return!!s&&(s.hasPendingWrites||s.version.compareTo(i)>0)}Xi(e,t,r){return Mn()<=q.DEBUG&&V("QueryEngine","Using full collection scan to execute query:",Gt(t)),this.Ji.getDocumentsMatchingQuery(e,t,mt.min(),r)}rs(e,t,r,i){return this.Ji.getDocumentsMatchingQuery(e,r,i).next((s=>(t.forEach((a=>{s=s.insert(a.key,a)})),s)))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class qm{constructor(e,t,r,i){this.persistence=e,this.ss=t,this.serializer=i,this.os=new X(z),this._s=new gn((s=>To(s)),Eo),this.us=new Map,this.cs=e.getRemoteDocumentCache(),this.Ur=e.getTargetCache(),this.Gr=e.getBundleCache(),this.ls(r)}ls(e){this.documentOverlayCache=this.persistence.getDocumentOverlayCache(e),this.indexManager=this.persistence.getIndexManager(e),this.mutationQueue=this.persistence.getMutationQueue(e,this.indexManager),this.localDocuments=new Cm(this.cs,this.mutationQueue,this.documentOverlayCache,this.indexManager),this.cs.setIndexManager(this.indexManager),this.ss.initialize(this.localDocuments,this.indexManager)}collectGarbage(e){return this.persistence.runTransaction("Collect garbage","readwrite-primary",(t=>e.collect(t,this.os)))}}function $m(n,e,t,r){return new qm(n,e,t,r)}async function Ql(n,e){const t=U(n);return await t.persistence.runTransaction("Handle user change","readonly",(r=>{let i;return t.mutationQueue.getAllMutationBatches(r).next((s=>(i=s,t.ls(e),t.mutationQueue.getAllMutationBatches(r)))).next((s=>{const a=[],u=[];let l=B();for(const d of i){a.push(d.batchId);for(const p of d.mutations)l=l.add(p.key)}for(const d of s){u.push(d.batchId);for(const p of d.mutations)l=l.add(p.key)}return t.localDocuments.getDocuments(r,l).next((d=>({hs:d,removedBatchIds:a,addedBatchIds:u})))}))}))}function jm(n,e){const t=U(n);return t.persistence.runTransaction("Acknowledge batch","readwrite-primary",(r=>{const i=e.batch.keys(),s=t.cs.newChangeBuffer({trackRemovals:!0});return(function(u,l,d,p){const v=d.batch,A=v.keys();let S=P.resolve();return A.forEach((k=>{S=S.next((()=>p.getEntry(l,k))).next((O=>{const N=d.docVersions.get(k);G(N!==null),O.version.compareTo(N)<0&&(v.applyToRemoteDocument(O,d),O.isValidDocument()&&(O.setReadTime(d.commitVersion),p.addEntry(O)))}))})),S.next((()=>u.mutationQueue.removeMutationBatch(l,v)))})(t,r,e,s).next((()=>s.apply(r))).next((()=>t.mutationQueue.performConsistencyCheck(r))).next((()=>t.documentOverlayCache.removeOverlaysForBatchId(r,i,e.batch.batchId))).next((()=>t.localDocuments.recalculateAndSaveOverlaysForDocumentKeys(r,(function(u){let l=B();for(let d=0;d<u.mutationResults.length;++d)u.mutationResults[d].transformResults.length>0&&(l=l.add(u.batch.mutations[d].key));return l})(e)))).next((()=>t.localDocuments.getDocuments(r,i)))}))}function Jl(n){const e=U(n);return e.persistence.runTransaction("Get last remote snapshot version","readonly",(t=>e.Ur.getLastRemoteSnapshotVersion(t)))}function zm(n,e){const t=U(n),r=e.snapshotVersion;let i=t.os;return t.persistence.runTransaction("Apply remote event","readwrite-primary",(s=>{const a=t.cs.newChangeBuffer({trackRemovals:!0});i=t.os;const u=[];e.targetChanges.forEach(((p,v)=>{const A=i.get(v);if(!A)return;u.push(t.Ur.removeMatchingKeys(s,p.removedDocuments,v).next((()=>t.Ur.addMatchingKeys(s,p.addedDocuments,v))));let S=A.withSequenceNumber(s.currentSequenceNumber);e.targetMismatches.get(v)!==null?S=S.withResumeToken(fe.EMPTY_BYTE_STRING,F.min()).withLastLimboFreeSnapshotVersion(F.min()):p.resumeToken.approximateByteSize()>0&&(S=S.withResumeToken(p.resumeToken,r)),i=i.insert(v,S),(function(O,N,H){return O.resumeToken.approximateByteSize()===0||N.snapshotVersion.toMicroseconds()-O.snapshotVersion.toMicroseconds()>=3e8?!0:H.addedDocuments.size+H.modifiedDocuments.size+H.removedDocuments.size>0})(A,S,p)&&u.push(t.Ur.updateTargetData(s,S))}));let l=et(),d=B();if(e.documentUpdates.forEach((p=>{e.resolvedLimboDocuments.has(p)&&u.push(t.persistence.referenceDelegate.updateLimboDocument(s,p))})),u.push(Hm(s,a,e.documentUpdates).next((p=>{l=p.Ps,d=p.Is}))),!r.isEqual(F.min())){const p=t.Ur.getLastRemoteSnapshotVersion(s).next((v=>t.Ur.setTargetsMetadata(s,s.currentSequenceNumber,r)));u.push(p)}return P.waitFor(u).next((()=>a.apply(s))).next((()=>t.localDocuments.getLocalViewOfDocuments(s,l,d))).next((()=>l))})).then((s=>(t.os=i,s)))}function Hm(n,e,t){let r=B(),i=B();return t.forEach((s=>r=r.add(s))),e.getEntries(n,r).next((s=>{let a=et();return t.forEach(((u,l)=>{const d=s.get(u);l.isFoundDocument()!==d.isFoundDocument()&&(i=i.add(u)),l.isNoDocument()&&l.version.isEqual(F.min())?(e.removeEntry(u,l.readTime),a=a.insert(u,l)):!d.isValidDocument()||l.version.compareTo(d.version)>0||l.version.compareTo(d.version)===0&&d.hasPendingWrites?(e.addEntry(l),a=a.insert(u,l)):V("LocalStore","Ignoring outdated watch update for ",u,". Current version:",d.version," Watch version:",l.version)})),{Ps:a,Is:i}}))}function Km(n,e){const t=U(n);return t.persistence.runTransaction("Get next mutation batch","readonly",(r=>(e===void 0&&(e=-1),t.mutationQueue.getNextMutationBatchAfterBatchId(r,e))))}function Wm(n,e){const t=U(n);return t.persistence.runTransaction("Allocate target","readwrite",(r=>{let i;return t.Ur.getTargetData(r,e).next((s=>s?(i=s,P.resolve(i)):t.Ur.allocateTargetId(r).next((a=>(i=new dt(e,a,"TargetPurposeListen",r.currentSequenceNumber),t.Ur.addTargetData(r,i).next((()=>i)))))))})).then((r=>{const i=t.os.get(r.targetId);return(i===null||r.snapshotVersion.compareTo(i.snapshotVersion)>0)&&(t.os=t.os.insert(r.targetId,r),t._s.set(e,r.targetId)),r}))}async function to(n,e,t){const r=U(n),i=r.os.get(e),s=t?"readwrite":"readwrite-primary";try{t||await r.persistence.runTransaction("Release target",s,(a=>r.persistence.referenceDelegate.removeTarget(a,i)))}catch(a){if(!ur(a))throw a;V("LocalStore",`Failed to update sequence numbers for target ${e}: ${a}`)}r.os=r.os.remove(e),r._s.delete(i.target)}function Gc(n,e,t){const r=U(n);let i=F.min(),s=B();return r.persistence.runTransaction("Execute query","readwrite",(a=>(function(l,d,p){const v=U(l),A=v._s.get(p);return A!==void 0?P.resolve(v.os.get(A)):v.Ur.getTargetData(d,p)})(r,a,Me(e)).next((u=>{if(u)return i=u.lastLimboFreeSnapshotVersion,r.Ur.getMatchingKeysForTargetId(a,u.targetId).next((l=>{s=l}))})).next((()=>r.ss.getDocumentsMatchingQuery(a,e,t?i:F.min(),t?s:B()))).next((u=>(Gm(r,xg(e),u),{documents:u,Ts:s})))))}function Gm(n,e,t){let r=n.us.get(e)||F.min();t.forEach(((i,s)=>{s.readTime.compareTo(r)>0&&(r=s.readTime)})),n.us.set(e,r)}class Qc{constructor(){this.activeTargetIds=jg()}fs(e){this.activeTargetIds=this.activeTargetIds.add(e)}gs(e){this.activeTargetIds=this.activeTargetIds.delete(e)}Vs(){const e={activeTargetIds:this.activeTargetIds.toArray(),updateTimeMs:Date.now()};return JSON.stringify(e)}}class Qm{constructor(){this.so=new Qc,this.oo={},this.onlineStateHandler=null,this.sequenceNumberHandler=null}addPendingMutation(e){}updateMutationState(e,t,r){}addLocalQueryTarget(e,t=!0){return t&&this.so.fs(e),this.oo[e]||"not-current"}updateQueryState(e,t,r){this.oo[e]=t}removeLocalQueryTarget(e){this.so.gs(e)}isLocalQueryTarget(e){return this.so.activeTargetIds.has(e)}clearQueryState(e){delete this.oo[e]}getAllActiveQueryTargets(){return this.so.activeTargetIds}isActiveQueryTarget(e){return this.so.activeTargetIds.has(e)}start(){return this.so=new Qc,Promise.resolve()}handleUserChange(e,t,r){}setOnlineState(e){}shutdown(){}writeSequenceNumber(e){}notifyBundleLoaded(e){}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Jm{_o(e){}shutdown(){}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Jc{constructor(){this.ao=()=>this.uo(),this.co=()=>this.lo(),this.ho=[],this.Po()}_o(e){this.ho.push(e)}shutdown(){window.removeEventListener("online",this.ao),window.removeEventListener("offline",this.co)}Po(){window.addEventListener("online",this.ao),window.addEventListener("offline",this.co)}uo(){V("ConnectivityMonitor","Network connectivity changed: AVAILABLE");for(const e of this.ho)e(0)}lo(){V("ConnectivityMonitor","Network connectivity changed: UNAVAILABLE");for(const e of this.ho)e(1)}static D(){return typeof window<"u"&&window.addEventListener!==void 0&&window.removeEventListener!==void 0}}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let qr=null;function Is(){return qr===null?qr=(function(){return 268435456+Math.round(2147483648*Math.random())})():qr++,"0x"+qr.toString(16)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ym={BatchGetDocuments:"batchGet",Commit:"commit",RunQuery:"runQuery",RunAggregationQuery:"runAggregationQuery"};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Xm{constructor(e){this.Io=e.Io,this.To=e.To}Eo(e){this.Ao=e}Ro(e){this.Vo=e}mo(e){this.fo=e}onMessage(e){this.po=e}close(){this.To()}send(e){this.Io(e)}yo(){this.Ao()}wo(){this.Vo()}So(e){this.fo(e)}bo(e){this.po(e)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ye="WebChannelConnection";class Zm extends class{constructor(t){this.databaseInfo=t,this.databaseId=t.databaseId;const r=t.ssl?"https":"http",i=encodeURIComponent(this.databaseId.projectId),s=encodeURIComponent(this.databaseId.database);this.Do=r+"://"+t.host,this.vo=`projects/${i}/databases/${s}`,this.Co=this.databaseId.database==="(default)"?`project_id=${i}`:`project_id=${i}&database_id=${s}`}get Fo(){return!1}Mo(t,r,i,s,a){const u=Is(),l=this.xo(t,r.toUriEncodedString());V("RestConnection",`Sending RPC '${t}' ${u}:`,l,i);const d={"google-cloud-resource-prefix":this.vo,"x-goog-request-params":this.Co};return this.Oo(d,s,a),this.No(t,l,d,i).then((p=>(V("RestConnection",`Received RPC '${t}' ${u}: `,p),p)),(p=>{throw rn("RestConnection",`RPC '${t}' ${u} failed with error: `,p,"url: ",l,"request:",i),p}))}Lo(t,r,i,s,a,u){return this.Mo(t,r,i,s,a)}Oo(t,r,i){t["X-Goog-Api-Client"]=(function(){return"gl-js/ fire/"+fn})(),t["Content-Type"]="text/plain",this.databaseInfo.appId&&(t["X-Firebase-GMPID"]=this.databaseInfo.appId),r&&r.headers.forEach(((s,a)=>t[a]=s)),i&&i.headers.forEach(((s,a)=>t[a]=s))}xo(t,r){const i=Ym[t];return`${this.Do}/v1/${r}:${i}`}terminate(){}}{constructor(e){super(e),this.forceLongPolling=e.forceLongPolling,this.autoDetectLongPolling=e.autoDetectLongPolling,this.useFetchStreams=e.useFetchStreams,this.longPollingOptions=e.longPollingOptions}No(e,t,r,i){const s=Is();return new Promise(((a,u)=>{const l=new ul;l.setWithCredentials(!0),l.listenOnce(ll.COMPLETE,(()=>{try{switch(l.getLastErrorCode()){case Kr.NO_ERROR:const p=l.getResponseJson();V(ye,`XHR for RPC '${e}' ${s} received:`,JSON.stringify(p)),a(p);break;case Kr.TIMEOUT:V(ye,`RPC '${e}' ${s} timed out`),u(new D(R.DEADLINE_EXCEEDED,"Request time out"));break;case Kr.HTTP_ERROR:const v=l.getStatus();if(V(ye,`RPC '${e}' ${s} failed with status:`,v,"response text:",l.getResponseText()),v>0){let A=l.getResponseJson();Array.isArray(A)&&(A=A[0]);const S=A==null?void 0:A.error;if(S&&S.status&&S.message){const k=(function(N){const H=N.toLowerCase().replace(/_/g,"-");return Object.values(R).indexOf(H)>=0?H:R.UNKNOWN})(S.status);u(new D(k,S.message))}else u(new D(R.UNKNOWN,"Server responded with status "+l.getStatus()))}else u(new D(R.UNAVAILABLE,"Connection failed."));break;default:x()}}finally{V(ye,`RPC '${e}' ${s} completed.`)}}));const d=JSON.stringify(i);V(ye,`RPC '${e}' ${s} sending request:`,i),l.send(t,"POST",d,r,15)}))}Bo(e,t,r){const i=Is(),s=[this.Do,"/","google.firestore.v1.Firestore","/",e,"/channel"],a=fl(),u=dl(),l={httpSessionIdParam:"gsessionid",initMessageHeaders:{},messageUrlParams:{database:`projects/${this.databaseId.projectId}/databases/${this.databaseId.database}`},sendRawJson:!0,supportsCrossDomainXhr:!0,internalChannelParams:{forwardChannelRequestTimeoutMs:6e5},forceLongPolling:this.forceLongPolling,detectBufferingProxy:this.autoDetectLongPolling},d=this.longPollingOptions.timeoutSeconds;d!==void 0&&(l.longPollingTimeout=Math.round(1e3*d)),this.useFetchStreams&&(l.useFetchStreams=!0),this.Oo(l.initMessageHeaders,t,r),l.encodeInitMessageHeaders=!0;const p=s.join("");V(ye,`Creating RPC '${e}' stream ${i}: ${p}`,l);const v=a.createWebChannel(p,l);let A=!1,S=!1;const k=new Xm({Io:N=>{S?V(ye,`Not sending because RPC '${e}' stream ${i} is closed:`,N):(A||(V(ye,`Opening RPC '${e}' stream ${i} transport.`),v.open(),A=!0),V(ye,`RPC '${e}' stream ${i} sending:`,N),v.send(N))},To:()=>v.close()}),O=(N,H,K)=>{N.listen(H,(W=>{try{K(W)}catch(ee){setTimeout((()=>{throw ee}),0)}}))};return O(v,xn.EventType.OPEN,(()=>{S||(V(ye,`RPC '${e}' stream ${i} transport opened.`),k.yo())})),O(v,xn.EventType.CLOSE,(()=>{S||(S=!0,V(ye,`RPC '${e}' stream ${i} transport closed`),k.So())})),O(v,xn.EventType.ERROR,(N=>{S||(S=!0,rn(ye,`RPC '${e}' stream ${i} transport errored:`,N),k.So(new D(R.UNAVAILABLE,"The operation could not be completed")))})),O(v,xn.EventType.MESSAGE,(N=>{var H;if(!S){const K=N.data[0];G(!!K);const W=K,ee=W.error||((H=W[0])===null||H===void 0?void 0:H.error);if(ee){V(ye,`RPC '${e}' stream ${i} received error:`,ee);const ke=ee.status;let te=(function(_){const y=ie[_];if(y!==void 0)return Ul(y)})(ke),w=ee.message;te===void 0&&(te=R.INTERNAL,w="Unknown error status: "+ke+" with message "+ee.message),S=!0,k.So(new D(te,w)),v.close()}else V(ye,`RPC '${e}' stream ${i} received:`,K),k.bo(K)}})),O(u,hl.STAT_EVENT,(N=>{N.stat===zs.PROXY?V(ye,`RPC '${e}' stream ${i} detected buffering proxy`):N.stat===zs.NOPROXY&&V(ye,`RPC '${e}' stream ${i} detected no buffering proxy`)})),setTimeout((()=>{k.wo()}),0),k}}function As(){return typeof document<"u"?document:null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Si(n){return new um(n,!0)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Yl{constructor(e,t,r=1e3,i=1.5,s=6e4){this.ui=e,this.timerId=t,this.ko=r,this.qo=i,this.Qo=s,this.Ko=0,this.$o=null,this.Uo=Date.now(),this.reset()}reset(){this.Ko=0}Wo(){this.Ko=this.Qo}Go(e){this.cancel();const t=Math.floor(this.Ko+this.zo()),r=Math.max(0,Date.now()-this.Uo),i=Math.max(0,t-r);i>0&&V("ExponentialBackoff",`Backing off for ${i} ms (base delay: ${this.Ko} ms, delay with jitter: ${t} ms, last attempt: ${r} ms ago)`),this.$o=this.ui.enqueueAfterDelay(this.timerId,i,(()=>(this.Uo=Date.now(),e()))),this.Ko*=this.qo,this.Ko<this.ko&&(this.Ko=this.ko),this.Ko>this.Qo&&(this.Ko=this.Qo)}jo(){this.$o!==null&&(this.$o.skipDelay(),this.$o=null)}cancel(){this.$o!==null&&(this.$o.cancel(),this.$o=null)}zo(){return(Math.random()-.5)*this.Ko}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Xl{constructor(e,t,r,i,s,a,u,l){this.ui=e,this.Ho=r,this.Jo=i,this.connection=s,this.authCredentialsProvider=a,this.appCheckCredentialsProvider=u,this.listener=l,this.state=0,this.Yo=0,this.Zo=null,this.Xo=null,this.stream=null,this.e_=0,this.t_=new Yl(e,t)}n_(){return this.state===1||this.state===5||this.r_()}r_(){return this.state===2||this.state===3}start(){this.e_=0,this.state!==4?this.auth():this.i_()}async stop(){this.n_()&&await this.close(0)}s_(){this.state=0,this.t_.reset()}o_(){this.r_()&&this.Zo===null&&(this.Zo=this.ui.enqueueAfterDelay(this.Ho,6e4,(()=>this.__())))}a_(e){this.u_(),this.stream.send(e)}async __(){if(this.r_())return this.close(0)}u_(){this.Zo&&(this.Zo.cancel(),this.Zo=null)}c_(){this.Xo&&(this.Xo.cancel(),this.Xo=null)}async close(e,t){this.u_(),this.c_(),this.t_.cancel(),this.Yo++,e!==4?this.t_.reset():t&&t.code===R.RESOURCE_EXHAUSTED?(Ze(t.toString()),Ze("Using maximum backoff delay to prevent overloading the backend."),this.t_.Wo()):t&&t.code===R.UNAUTHENTICATED&&this.state!==3&&(this.authCredentialsProvider.invalidateToken(),this.appCheckCredentialsProvider.invalidateToken()),this.stream!==null&&(this.l_(),this.stream.close(),this.stream=null),this.state=e,await this.listener.mo(t)}l_(){}auth(){this.state=1;const e=this.h_(this.Yo),t=this.Yo;Promise.all([this.authCredentialsProvider.getToken(),this.appCheckCredentialsProvider.getToken()]).then((([r,i])=>{this.Yo===t&&this.P_(r,i)}),(r=>{e((()=>{const i=new D(R.UNKNOWN,"Fetching auth token failed: "+r.message);return this.I_(i)}))}))}P_(e,t){const r=this.h_(this.Yo);this.stream=this.T_(e,t),this.stream.Eo((()=>{r((()=>this.listener.Eo()))})),this.stream.Ro((()=>{r((()=>(this.state=2,this.Xo=this.ui.enqueueAfterDelay(this.Jo,1e4,(()=>(this.r_()&&(this.state=3),Promise.resolve()))),this.listener.Ro())))})),this.stream.mo((i=>{r((()=>this.I_(i)))})),this.stream.onMessage((i=>{r((()=>++this.e_==1?this.E_(i):this.onNext(i)))}))}i_(){this.state=5,this.t_.Go((async()=>{this.state=0,this.start()}))}I_(e){return V("PersistentStream",`close with error: ${e}`),this.stream=null,this.close(4,e)}h_(e){return t=>{this.ui.enqueueAndForget((()=>this.Yo===e?t():(V("PersistentStream","stream callback skipped by getCloseGuardedDispatcher."),Promise.resolve())))}}}class e_ extends Xl{constructor(e,t,r,i,s,a){super(e,"listen_stream_connection_backoff","listen_stream_idle","health_check_timeout",t,r,i,a),this.serializer=s}T_(e,t){return this.connection.Bo("Listen",e,t)}E_(e){return this.onNext(e)}onNext(e){this.t_.reset();const t=dm(this.serializer,e),r=(function(s){if(!("targetChange"in s))return F.min();const a=s.targetChange;return a.targetIds&&a.targetIds.length?F.min():a.readTime?Fe(a.readTime):F.min()})(e);return this.listener.d_(t,r)}A_(e){const t={};t.database=eo(this.serializer),t.addTarget=(function(s,a){let u;const l=a.target;if(u=Gs(l)?{documents:gm(s,l)}:{query:mm(s,l)._t},u.targetId=a.targetId,a.resumeToken.approximateByteSize()>0){u.resumeToken=$l(s,a.resumeToken);const d=Ys(s,a.expectedCount);d!==null&&(u.expectedCount=d)}else if(a.snapshotVersion.compareTo(F.min())>0){u.readTime=ai(s,a.snapshotVersion.toTimestamp());const d=Ys(s,a.expectedCount);d!==null&&(u.expectedCount=d)}return u})(this.serializer,e);const r=ym(this.serializer,e);r&&(t.labels=r),this.a_(t)}R_(e){const t={};t.database=eo(this.serializer),t.removeTarget=e,this.a_(t)}}class t_ extends Xl{constructor(e,t,r,i,s,a){super(e,"write_stream_connection_backoff","write_stream_idle","health_check_timeout",t,r,i,a),this.serializer=s}get V_(){return this.e_>0}start(){this.lastStreamToken=void 0,super.start()}l_(){this.V_&&this.m_([])}T_(e,t){return this.connection.Bo("Write",e,t)}E_(e){return G(!!e.streamToken),this.lastStreamToken=e.streamToken,G(!e.writeResults||e.writeResults.length===0),this.listener.f_()}onNext(e){G(!!e.streamToken),this.lastStreamToken=e.streamToken,this.t_.reset();const t=pm(e.writeResults,e.commitTime),r=Fe(e.commitTime);return this.listener.g_(r,t)}p_(){const e={};e.database=eo(this.serializer),this.a_(e)}m_(e){const t={streamToken:this.lastStreamToken,writes:e.map((r=>fm(this.serializer,r)))};this.a_(t)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class n_ extends class{}{constructor(e,t,r,i){super(),this.authCredentials=e,this.appCheckCredentials=t,this.connection=r,this.serializer=i,this.y_=!1}w_(){if(this.y_)throw new D(R.FAILED_PRECONDITION,"The client has already been terminated.")}Mo(e,t,r,i){return this.w_(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then((([s,a])=>this.connection.Mo(e,Xs(t,r),i,s,a))).catch((s=>{throw s.name==="FirebaseError"?(s.code===R.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),s):new D(R.UNKNOWN,s.toString())}))}Lo(e,t,r,i,s){return this.w_(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then((([a,u])=>this.connection.Lo(e,Xs(t,r),i,a,u,s))).catch((a=>{throw a.name==="FirebaseError"?(a.code===R.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),a):new D(R.UNKNOWN,a.toString())}))}terminate(){this.y_=!0,this.connection.terminate()}}class r_{constructor(e,t){this.asyncQueue=e,this.onlineStateHandler=t,this.state="Unknown",this.S_=0,this.b_=null,this.D_=!0}v_(){this.S_===0&&(this.C_("Unknown"),this.b_=this.asyncQueue.enqueueAfterDelay("online_state_timeout",1e4,(()=>(this.b_=null,this.F_("Backend didn't respond within 10 seconds."),this.C_("Offline"),Promise.resolve()))))}M_(e){this.state==="Online"?this.C_("Unknown"):(this.S_++,this.S_>=1&&(this.x_(),this.F_(`Connection failed 1 times. Most recent error: ${e.toString()}`),this.C_("Offline")))}set(e){this.x_(),this.S_=0,e==="Online"&&(this.D_=!1),this.C_(e)}C_(e){e!==this.state&&(this.state=e,this.onlineStateHandler(e))}F_(e){const t=`Could not reach Cloud Firestore backend. ${e}
This typically indicates that your device does not have a healthy Internet connection at the moment. The client will operate in offline mode until it is able to successfully connect to the backend.`;this.D_?(Ze(t),this.D_=!1):V("OnlineStateTracker",t)}x_(){this.b_!==null&&(this.b_.cancel(),this.b_=null)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class i_{constructor(e,t,r,i,s){this.localStore=e,this.datastore=t,this.asyncQueue=r,this.remoteSyncer={},this.O_=[],this.N_=new Map,this.L_=new Set,this.B_=[],this.k_=s,this.k_._o((a=>{r.enqueueAndForget((async()=>{qt(this)&&(V("RemoteStore","Restarting streams for network reachability change."),await(async function(l){const d=U(l);d.L_.add(4),await dr(d),d.q_.set("Unknown"),d.L_.delete(4),await Pi(d)})(this))}))})),this.q_=new r_(r,i)}}async function Pi(n){if(qt(n))for(const e of n.B_)await e(!0)}async function dr(n){for(const e of n.B_)await e(!1)}function Zl(n,e){const t=U(n);t.N_.has(e.targetId)||(t.N_.set(e.targetId,e),Oo(t)?Vo(t):mn(t).r_()&&Do(t,e))}function No(n,e){const t=U(n),r=mn(t);t.N_.delete(e),r.r_()&&eh(t,e),t.N_.size===0&&(r.r_()?r.o_():qt(t)&&t.q_.set("Unknown"))}function Do(n,e){if(n.Q_.xe(e.targetId),e.resumeToken.approximateByteSize()>0||e.snapshotVersion.compareTo(F.min())>0){const t=n.remoteSyncer.getRemoteKeysForTarget(e.targetId).size;e=e.withExpectedCount(t)}mn(n).A_(e)}function eh(n,e){n.Q_.xe(e),mn(n).R_(e)}function Vo(n){n.Q_=new sm({getRemoteKeysForTarget:e=>n.remoteSyncer.getRemoteKeysForTarget(e),ot:e=>n.N_.get(e)||null,tt:()=>n.datastore.serializer.databaseId}),mn(n).start(),n.q_.v_()}function Oo(n){return qt(n)&&!mn(n).n_()&&n.N_.size>0}function qt(n){return U(n).L_.size===0}function th(n){n.Q_=void 0}async function s_(n){n.q_.set("Online")}async function o_(n){n.N_.forEach(((e,t)=>{Do(n,e)}))}async function a_(n,e){th(n),Oo(n)?(n.q_.M_(e),Vo(n)):n.q_.set("Unknown")}async function c_(n,e,t){if(n.q_.set("Online"),e instanceof ql&&e.state===2&&e.cause)try{await(async function(i,s){const a=s.cause;for(const u of s.targetIds)i.N_.has(u)&&(await i.remoteSyncer.rejectListen(u,a),i.N_.delete(u),i.Q_.removeTarget(u))})(n,e)}catch(r){V("RemoteStore","Failed to remove targets %s: %s ",e.targetIds.join(","),r),await ci(n,r)}else if(e instanceof Qr?n.Q_.Ke(e):e instanceof Bl?n.Q_.He(e):n.Q_.We(e),!t.isEqual(F.min()))try{const r=await Jl(n.localStore);t.compareTo(r)>=0&&await(function(s,a){const u=s.Q_.rt(a);return u.targetChanges.forEach(((l,d)=>{if(l.resumeToken.approximateByteSize()>0){const p=s.N_.get(d);p&&s.N_.set(d,p.withResumeToken(l.resumeToken,a))}})),u.targetMismatches.forEach(((l,d)=>{const p=s.N_.get(l);if(!p)return;s.N_.set(l,p.withResumeToken(fe.EMPTY_BYTE_STRING,p.snapshotVersion)),eh(s,l);const v=new dt(p.target,l,d,p.sequenceNumber);Do(s,v)})),s.remoteSyncer.applyRemoteEvent(u)})(n,t)}catch(r){V("RemoteStore","Failed to raise snapshot:",r),await ci(n,r)}}async function ci(n,e,t){if(!ur(e))throw e;n.L_.add(1),await dr(n),n.q_.set("Offline"),t||(t=()=>Jl(n.localStore)),n.asyncQueue.enqueueRetryable((async()=>{V("RemoteStore","Retrying IndexedDB access"),await t(),n.L_.delete(1),await Pi(n)}))}function nh(n,e){return e().catch((t=>ci(n,t,e)))}async function Ci(n){const e=U(n),t=yt(e);let r=e.O_.length>0?e.O_[e.O_.length-1].batchId:-1;for(;u_(e);)try{const i=await Km(e.localStore,r);if(i===null){e.O_.length===0&&t.o_();break}r=i.batchId,l_(e,i)}catch(i){await ci(e,i)}rh(e)&&ih(e)}function u_(n){return qt(n)&&n.O_.length<10}function l_(n,e){n.O_.push(e);const t=yt(n);t.r_()&&t.V_&&t.m_(e.mutations)}function rh(n){return qt(n)&&!yt(n).n_()&&n.O_.length>0}function ih(n){yt(n).start()}async function h_(n){yt(n).p_()}async function d_(n){const e=yt(n);for(const t of n.O_)e.m_(t.mutations)}async function f_(n,e,t){const r=n.O_.shift(),i=bo.from(r,e,t);await nh(n,(()=>n.remoteSyncer.applySuccessfulWrite(i))),await Ci(n)}async function p_(n,e){e&&yt(n).V_&&await(async function(r,i){if((function(a){return nm(a)&&a!==R.ABORTED})(i.code)){const s=r.O_.shift();yt(r).s_(),await nh(r,(()=>r.remoteSyncer.rejectFailedWrite(s.batchId,i))),await Ci(r)}})(n,e),rh(n)&&ih(n)}async function Yc(n,e){const t=U(n);t.asyncQueue.verifyOperationInProgress(),V("RemoteStore","RemoteStore received new credentials");const r=qt(t);t.L_.add(3),await dr(t),r&&t.q_.set("Unknown"),await t.remoteSyncer.handleCredentialChange(e),t.L_.delete(3),await Pi(t)}async function g_(n,e){const t=U(n);e?(t.L_.delete(2),await Pi(t)):e||(t.L_.add(2),await dr(t),t.q_.set("Unknown"))}function mn(n){return n.K_||(n.K_=(function(t,r,i){const s=U(t);return s.w_(),new e_(r,s.connection,s.authCredentials,s.appCheckCredentials,s.serializer,i)})(n.datastore,n.asyncQueue,{Eo:s_.bind(null,n),Ro:o_.bind(null,n),mo:a_.bind(null,n),d_:c_.bind(null,n)}),n.B_.push((async e=>{e?(n.K_.s_(),Oo(n)?Vo(n):n.q_.set("Unknown")):(await n.K_.stop(),th(n))}))),n.K_}function yt(n){return n.U_||(n.U_=(function(t,r,i){const s=U(t);return s.w_(),new t_(r,s.connection,s.authCredentials,s.appCheckCredentials,s.serializer,i)})(n.datastore,n.asyncQueue,{Eo:()=>Promise.resolve(),Ro:h_.bind(null,n),mo:p_.bind(null,n),f_:d_.bind(null,n),g_:f_.bind(null,n)}),n.B_.push((async e=>{e?(n.U_.s_(),await Ci(n)):(await n.U_.stop(),n.O_.length>0&&(V("RemoteStore",`Stopping write stream with ${n.O_.length} pending writes`),n.O_=[]))}))),n.U_}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Lo{constructor(e,t,r,i,s){this.asyncQueue=e,this.timerId=t,this.targetTimeMs=r,this.op=i,this.removalCallback=s,this.deferred=new Ye,this.then=this.deferred.promise.then.bind(this.deferred.promise),this.deferred.promise.catch((a=>{}))}get promise(){return this.deferred.promise}static createAndSchedule(e,t,r,i,s){const a=Date.now()+r,u=new Lo(e,t,a,i,s);return u.start(r),u}start(e){this.timerHandle=setTimeout((()=>this.handleDelayElapsed()),e)}skipDelay(){return this.handleDelayElapsed()}cancel(e){this.timerHandle!==null&&(this.clearTimeout(),this.deferred.reject(new D(R.CANCELLED,"Operation cancelled"+(e?": "+e:""))))}handleDelayElapsed(){this.asyncQueue.enqueueAndForget((()=>this.timerHandle!==null?(this.clearTimeout(),this.op().then((e=>this.deferred.resolve(e)))):Promise.resolve()))}clearTimeout(){this.timerHandle!==null&&(this.removalCallback(this),clearTimeout(this.timerHandle),this.timerHandle=null)}}function Mo(n,e){if(Ze("AsyncQueue",`${e}: ${n}`),ur(n))return new D(R.UNAVAILABLE,`${e}: ${n}`);throw n}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Xt{constructor(e){this.comparator=e?(t,r)=>e(t,r)||L.comparator(t.key,r.key):(t,r)=>L.comparator(t.key,r.key),this.keyedMap=Fn(),this.sortedSet=new X(this.comparator)}static emptySet(e){return new Xt(e.comparator)}has(e){return this.keyedMap.get(e)!=null}get(e){return this.keyedMap.get(e)}first(){return this.sortedSet.minKey()}last(){return this.sortedSet.maxKey()}isEmpty(){return this.sortedSet.isEmpty()}indexOf(e){const t=this.keyedMap.get(e);return t?this.sortedSet.indexOf(t):-1}get size(){return this.sortedSet.size}forEach(e){this.sortedSet.inorderTraversal(((t,r)=>(e(t),!1)))}add(e){const t=this.delete(e.key);return t.copy(t.keyedMap.insert(e.key,e),t.sortedSet.insert(e,null))}delete(e){const t=this.get(e);return t?this.copy(this.keyedMap.remove(e),this.sortedSet.remove(t)):this}isEqual(e){if(!(e instanceof Xt)||this.size!==e.size)return!1;const t=this.sortedSet.getIterator(),r=e.sortedSet.getIterator();for(;t.hasNext();){const i=t.getNext().key,s=r.getNext().key;if(!i.isEqual(s))return!1}return!0}toString(){const e=[];return this.forEach((t=>{e.push(t.toString())})),e.length===0?"DocumentSet ()":`DocumentSet (
  `+e.join(`  
`)+`
)`}copy(e,t){const r=new Xt;return r.comparator=this.comparator,r.keyedMap=e,r.sortedSet=t,r}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Xc{constructor(){this.W_=new X(L.comparator)}track(e){const t=e.doc.key,r=this.W_.get(t);r?e.type!==0&&r.type===3?this.W_=this.W_.insert(t,e):e.type===3&&r.type!==1?this.W_=this.W_.insert(t,{type:r.type,doc:e.doc}):e.type===2&&r.type===2?this.W_=this.W_.insert(t,{type:2,doc:e.doc}):e.type===2&&r.type===0?this.W_=this.W_.insert(t,{type:0,doc:e.doc}):e.type===1&&r.type===0?this.W_=this.W_.remove(t):e.type===1&&r.type===2?this.W_=this.W_.insert(t,{type:1,doc:r.doc}):e.type===0&&r.type===1?this.W_=this.W_.insert(t,{type:2,doc:e.doc}):x():this.W_=this.W_.insert(t,e)}G_(){const e=[];return this.W_.inorderTraversal(((t,r)=>{e.push(r)})),e}}class un{constructor(e,t,r,i,s,a,u,l,d){this.query=e,this.docs=t,this.oldDocs=r,this.docChanges=i,this.mutatedKeys=s,this.fromCache=a,this.syncStateChanged=u,this.excludesMetadataChanges=l,this.hasCachedResults=d}static fromInitialDocuments(e,t,r,i,s){const a=[];return t.forEach((u=>{a.push({type:0,doc:u})})),new un(e,t,Xt.emptySet(t),a,r,i,!0,!1,s)}get hasPendingWrites(){return!this.mutatedKeys.isEmpty()}isEqual(e){if(!(this.fromCache===e.fromCache&&this.hasCachedResults===e.hasCachedResults&&this.syncStateChanged===e.syncStateChanged&&this.mutatedKeys.isEqual(e.mutatedKeys)&&Ei(this.query,e.query)&&this.docs.isEqual(e.docs)&&this.oldDocs.isEqual(e.oldDocs)))return!1;const t=this.docChanges,r=e.docChanges;if(t.length!==r.length)return!1;for(let i=0;i<t.length;i++)if(t[i].type!==r[i].type||!t[i].doc.isEqual(r[i].doc))return!1;return!0}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class m_{constructor(){this.z_=void 0,this.j_=[]}H_(){return this.j_.some((e=>e.J_()))}}class __{constructor(){this.queries=Zc(),this.onlineState="Unknown",this.Y_=new Set}terminate(){(function(t,r){const i=U(t),s=i.queries;i.queries=Zc(),s.forEach(((a,u)=>{for(const l of u.j_)l.onError(r)}))})(this,new D(R.ABORTED,"Firestore shutting down"))}}function Zc(){return new gn((n=>Rl(n)),Ei)}async function sh(n,e){const t=U(n);let r=3;const i=e.query;let s=t.queries.get(i);s?!s.H_()&&e.J_()&&(r=2):(s=new m_,r=e.J_()?0:1);try{switch(r){case 0:s.z_=await t.onListen(i,!0);break;case 1:s.z_=await t.onListen(i,!1);break;case 2:await t.onFirstRemoteStoreListen(i)}}catch(a){const u=Mo(a,`Initialization of query '${Gt(e.query)}' failed`);return void e.onError(u)}t.queries.set(i,s),s.j_.push(e),e.Z_(t.onlineState),s.z_&&e.X_(s.z_)&&xo(t)}async function oh(n,e){const t=U(n),r=e.query;let i=3;const s=t.queries.get(r);if(s){const a=s.j_.indexOf(e);a>=0&&(s.j_.splice(a,1),s.j_.length===0?i=e.J_()?0:1:!s.H_()&&e.J_()&&(i=2))}switch(i){case 0:return t.queries.delete(r),t.onUnlisten(r,!0);case 1:return t.queries.delete(r),t.onUnlisten(r,!1);case 2:return t.onLastRemoteStoreUnlisten(r);default:return}}function y_(n,e){const t=U(n);let r=!1;for(const i of e){const s=i.query,a=t.queries.get(s);if(a){for(const u of a.j_)u.X_(i)&&(r=!0);a.z_=i}}r&&xo(t)}function v_(n,e,t){const r=U(n),i=r.queries.get(e);if(i)for(const s of i.j_)s.onError(t);r.queries.delete(e)}function xo(n){n.Y_.forEach((e=>{e.next()}))}var no,eu;(eu=no||(no={})).ea="default",eu.Cache="cache";class ah{constructor(e,t,r){this.query=e,this.ta=t,this.na=!1,this.ra=null,this.onlineState="Unknown",this.options=r||{}}X_(e){if(!this.options.includeMetadataChanges){const r=[];for(const i of e.docChanges)i.type!==3&&r.push(i);e=new un(e.query,e.docs,e.oldDocs,r,e.mutatedKeys,e.fromCache,e.syncStateChanged,!0,e.hasCachedResults)}let t=!1;return this.na?this.ia(e)&&(this.ta.next(e),t=!0):this.sa(e,this.onlineState)&&(this.oa(e),t=!0),this.ra=e,t}onError(e){this.ta.error(e)}Z_(e){this.onlineState=e;let t=!1;return this.ra&&!this.na&&this.sa(this.ra,e)&&(this.oa(this.ra),t=!0),t}sa(e,t){if(!e.fromCache||!this.J_())return!0;const r=t!=="Offline";return(!this.options._a||!r)&&(!e.docs.isEmpty()||e.hasCachedResults||t==="Offline")}ia(e){if(e.docChanges.length>0)return!0;const t=this.ra&&this.ra.hasPendingWrites!==e.hasPendingWrites;return!(!e.syncStateChanged&&!t)&&this.options.includeMetadataChanges===!0}oa(e){e=un.fromInitialDocuments(e.query,e.docs,e.mutatedKeys,e.fromCache,e.hasCachedResults),this.na=!0,this.ta.next(e)}J_(){return this.options.source!==no.Cache}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ch{constructor(e){this.key=e}}class uh{constructor(e){this.key=e}}class w_{constructor(e,t){this.query=e,this.Ta=t,this.Ea=null,this.hasCachedResults=!1,this.current=!1,this.da=B(),this.mutatedKeys=B(),this.Aa=Sl(e),this.Ra=new Xt(this.Aa)}get Va(){return this.Ta}ma(e,t){const r=t?t.fa:new Xc,i=t?t.Ra:this.Ra;let s=t?t.mutatedKeys:this.mutatedKeys,a=i,u=!1;const l=this.query.limitType==="F"&&i.size===this.query.limit?i.last():null,d=this.query.limitType==="L"&&i.size===this.query.limit?i.first():null;if(e.inorderTraversal(((p,v)=>{const A=i.get(p),S=Ii(this.query,v)?v:null,k=!!A&&this.mutatedKeys.has(A.key),O=!!S&&(S.hasLocalMutations||this.mutatedKeys.has(S.key)&&S.hasCommittedMutations);let N=!1;A&&S?A.data.isEqual(S.data)?k!==O&&(r.track({type:3,doc:S}),N=!0):this.ga(A,S)||(r.track({type:2,doc:S}),N=!0,(l&&this.Aa(S,l)>0||d&&this.Aa(S,d)<0)&&(u=!0)):!A&&S?(r.track({type:0,doc:S}),N=!0):A&&!S&&(r.track({type:1,doc:A}),N=!0,(l||d)&&(u=!0)),N&&(S?(a=a.add(S),s=O?s.add(p):s.delete(p)):(a=a.delete(p),s=s.delete(p)))})),this.query.limit!==null)for(;a.size>this.query.limit;){const p=this.query.limitType==="F"?a.last():a.first();a=a.delete(p.key),s=s.delete(p.key),r.track({type:1,doc:p})}return{Ra:a,fa:r,ns:u,mutatedKeys:s}}ga(e,t){return e.hasLocalMutations&&t.hasCommittedMutations&&!t.hasLocalMutations}applyChanges(e,t,r,i){const s=this.Ra;this.Ra=e.Ra,this.mutatedKeys=e.mutatedKeys;const a=e.fa.G_();a.sort(((p,v)=>(function(S,k){const O=N=>{switch(N){case 0:return 1;case 2:case 3:return 2;case 1:return 0;default:return x()}};return O(S)-O(k)})(p.type,v.type)||this.Aa(p.doc,v.doc))),this.pa(r),i=i!=null&&i;const u=t&&!i?this.ya():[],l=this.da.size===0&&this.current&&!i?1:0,d=l!==this.Ea;return this.Ea=l,a.length!==0||d?{snapshot:new un(this.query,e.Ra,s,a,e.mutatedKeys,l===0,d,!1,!!r&&r.resumeToken.approximateByteSize()>0),wa:u}:{wa:u}}Z_(e){return this.current&&e==="Offline"?(this.current=!1,this.applyChanges({Ra:this.Ra,fa:new Xc,mutatedKeys:this.mutatedKeys,ns:!1},!1)):{wa:[]}}Sa(e){return!this.Ta.has(e)&&!!this.Ra.has(e)&&!this.Ra.get(e).hasLocalMutations}pa(e){e&&(e.addedDocuments.forEach((t=>this.Ta=this.Ta.add(t))),e.modifiedDocuments.forEach((t=>{})),e.removedDocuments.forEach((t=>this.Ta=this.Ta.delete(t))),this.current=e.current)}ya(){if(!this.current)return[];const e=this.da;this.da=B(),this.Ra.forEach((r=>{this.Sa(r.key)&&(this.da=this.da.add(r.key))}));const t=[];return e.forEach((r=>{this.da.has(r)||t.push(new uh(r))})),this.da.forEach((r=>{e.has(r)||t.push(new ch(r))})),t}ba(e){this.Ta=e.Ts,this.da=B();const t=this.ma(e.documents);return this.applyChanges(t,!0)}Da(){return un.fromInitialDocuments(this.query,this.Ra,this.mutatedKeys,this.Ea===0,this.hasCachedResults)}}class T_{constructor(e,t,r){this.query=e,this.targetId=t,this.view=r}}class E_{constructor(e){this.key=e,this.va=!1}}class I_{constructor(e,t,r,i,s,a){this.localStore=e,this.remoteStore=t,this.eventManager=r,this.sharedClientState=i,this.currentUser=s,this.maxConcurrentLimboResolutions=a,this.Ca={},this.Fa=new gn((u=>Rl(u)),Ei),this.Ma=new Map,this.xa=new Set,this.Oa=new X(L.comparator),this.Na=new Map,this.La=new Po,this.Ba={},this.ka=new Map,this.qa=cn.kn(),this.onlineState="Unknown",this.Qa=void 0}get isPrimaryClient(){return this.Qa===!0}}async function A_(n,e,t=!0){const r=gh(n);let i;const s=r.Fa.get(e);return s?(r.sharedClientState.addLocalQueryTarget(s.targetId),i=s.view.Da()):i=await lh(r,e,t,!0),i}async function b_(n,e){const t=gh(n);await lh(t,e,!0,!1)}async function lh(n,e,t,r){const i=await Wm(n.localStore,Me(e)),s=i.targetId,a=n.sharedClientState.addLocalQueryTarget(s,t);let u;return r&&(u=await R_(n,e,s,a==="current",i.resumeToken)),n.isPrimaryClient&&t&&Zl(n.remoteStore,i),u}async function R_(n,e,t,r,i){n.Ka=(v,A,S)=>(async function(O,N,H,K){let W=N.view.ma(H);W.ns&&(W=await Gc(O.localStore,N.query,!1).then((({documents:w})=>N.view.ma(w,W))));const ee=K&&K.targetChanges.get(N.targetId),ke=K&&K.targetMismatches.get(N.targetId)!=null,te=N.view.applyChanges(W,O.isPrimaryClient,ee,ke);return nu(O,N.targetId,te.wa),te.snapshot})(n,v,A,S);const s=await Gc(n.localStore,e,!0),a=new w_(e,s.Ts),u=a.ma(s.documents),l=hr.createSynthesizedTargetChangeForCurrentChange(t,r&&n.onlineState!=="Offline",i),d=a.applyChanges(u,n.isPrimaryClient,l);nu(n,t,d.wa);const p=new T_(e,t,a);return n.Fa.set(e,p),n.Ma.has(t)?n.Ma.get(t).push(e):n.Ma.set(t,[e]),d.snapshot}async function S_(n,e,t){const r=U(n),i=r.Fa.get(e),s=r.Ma.get(i.targetId);if(s.length>1)return r.Ma.set(i.targetId,s.filter((a=>!Ei(a,e)))),void r.Fa.delete(e);r.isPrimaryClient?(r.sharedClientState.removeLocalQueryTarget(i.targetId),r.sharedClientState.isActiveQueryTarget(i.targetId)||await to(r.localStore,i.targetId,!1).then((()=>{r.sharedClientState.clearQueryState(i.targetId),t&&No(r.remoteStore,i.targetId),ro(r,i.targetId)})).catch(cr)):(ro(r,i.targetId),await to(r.localStore,i.targetId,!0))}async function P_(n,e){const t=U(n),r=t.Fa.get(e),i=t.Ma.get(r.targetId);t.isPrimaryClient&&i.length===1&&(t.sharedClientState.removeLocalQueryTarget(r.targetId),No(t.remoteStore,r.targetId))}async function C_(n,e,t){const r=M_(n);try{const i=await(function(a,u){const l=U(a),d=oe.now(),p=u.reduce(((S,k)=>S.add(k.key)),B());let v,A;return l.persistence.runTransaction("Locally write mutations","readwrite",(S=>{let k=et(),O=B();return l.cs.getEntries(S,p).next((N=>{k=N,k.forEach(((H,K)=>{K.isValidDocument()||(O=O.add(H))}))})).next((()=>l.localDocuments.getOverlayedDocuments(S,k))).next((N=>{v=N;const H=[];for(const K of u){const W=Yg(K,v.get(K.key).overlayedDocument);W!=null&&H.push(new wt(K.key,W,yl(W.value.mapValue),xe.exists(!0)))}return l.mutationQueue.addMutationBatch(S,d,H,u)})).next((N=>{A=N;const H=N.applyToLocalDocumentSet(v,O);return l.documentOverlayCache.saveOverlays(S,N.batchId,H)}))})).then((()=>({batchId:A.batchId,changes:Cl(v)})))})(r.localStore,e);r.sharedClientState.addPendingMutation(i.batchId),(function(a,u,l){let d=a.Ba[a.currentUser.toKey()];d||(d=new X(z)),d=d.insert(u,l),a.Ba[a.currentUser.toKey()]=d})(r,i.batchId,t),await fr(r,i.changes),await Ci(r.remoteStore)}catch(i){const s=Mo(i,"Failed to persist write");t.reject(s)}}async function hh(n,e){const t=U(n);try{const r=await zm(t.localStore,e);e.targetChanges.forEach(((i,s)=>{const a=t.Na.get(s);a&&(G(i.addedDocuments.size+i.modifiedDocuments.size+i.removedDocuments.size<=1),i.addedDocuments.size>0?a.va=!0:i.modifiedDocuments.size>0?G(a.va):i.removedDocuments.size>0&&(G(a.va),a.va=!1))})),await fr(t,r,e)}catch(r){await cr(r)}}function tu(n,e,t){const r=U(n);if(r.isPrimaryClient&&t===0||!r.isPrimaryClient&&t===1){const i=[];r.Fa.forEach(((s,a)=>{const u=a.view.Z_(e);u.snapshot&&i.push(u.snapshot)})),(function(a,u){const l=U(a);l.onlineState=u;let d=!1;l.queries.forEach(((p,v)=>{for(const A of v.j_)A.Z_(u)&&(d=!0)})),d&&xo(l)})(r.eventManager,e),i.length&&r.Ca.d_(i),r.onlineState=e,r.isPrimaryClient&&r.sharedClientState.setOnlineState(e)}}async function k_(n,e,t){const r=U(n);r.sharedClientState.updateQueryState(e,"rejected",t);const i=r.Na.get(e),s=i&&i.key;if(s){let a=new X(L.comparator);a=a.insert(s,we.newNoDocument(s,F.min()));const u=B().add(s),l=new Ri(F.min(),new Map,new X(z),a,u);await hh(r,l),r.Oa=r.Oa.remove(s),r.Na.delete(e),Fo(r)}else await to(r.localStore,e,!1).then((()=>ro(r,e,t))).catch(cr)}async function N_(n,e){const t=U(n),r=e.batch.batchId;try{const i=await jm(t.localStore,e);fh(t,r,null),dh(t,r),t.sharedClientState.updateMutationState(r,"acknowledged"),await fr(t,i)}catch(i){await cr(i)}}async function D_(n,e,t){const r=U(n);try{const i=await(function(a,u){const l=U(a);return l.persistence.runTransaction("Reject batch","readwrite-primary",(d=>{let p;return l.mutationQueue.lookupMutationBatch(d,u).next((v=>(G(v!==null),p=v.keys(),l.mutationQueue.removeMutationBatch(d,v)))).next((()=>l.mutationQueue.performConsistencyCheck(d))).next((()=>l.documentOverlayCache.removeOverlaysForBatchId(d,p,u))).next((()=>l.localDocuments.recalculateAndSaveOverlaysForDocumentKeys(d,p))).next((()=>l.localDocuments.getDocuments(d,p)))}))})(r.localStore,e);fh(r,e,t),dh(r,e),r.sharedClientState.updateMutationState(e,"rejected",t),await fr(r,i)}catch(i){await cr(i)}}function dh(n,e){(n.ka.get(e)||[]).forEach((t=>{t.resolve()})),n.ka.delete(e)}function fh(n,e,t){const r=U(n);let i=r.Ba[r.currentUser.toKey()];if(i){const s=i.get(e);s&&(t?s.reject(t):s.resolve(),i=i.remove(e)),r.Ba[r.currentUser.toKey()]=i}}function ro(n,e,t=null){n.sharedClientState.removeLocalQueryTarget(e);for(const r of n.Ma.get(e))n.Fa.delete(r),t&&n.Ca.$a(r,t);n.Ma.delete(e),n.isPrimaryClient&&n.La.gr(e).forEach((r=>{n.La.containsKey(r)||ph(n,r)}))}function ph(n,e){n.xa.delete(e.path.canonicalString());const t=n.Oa.get(e);t!==null&&(No(n.remoteStore,t),n.Oa=n.Oa.remove(e),n.Na.delete(t),Fo(n))}function nu(n,e,t){for(const r of t)r instanceof ch?(n.La.addReference(r.key,e),V_(n,r)):r instanceof uh?(V("SyncEngine","Document no longer in limbo: "+r.key),n.La.removeReference(r.key,e),n.La.containsKey(r.key)||ph(n,r.key)):x()}function V_(n,e){const t=e.key,r=t.path.canonicalString();n.Oa.get(t)||n.xa.has(r)||(V("SyncEngine","New document in limbo: "+t),n.xa.add(r),Fo(n))}function Fo(n){for(;n.xa.size>0&&n.Oa.size<n.maxConcurrentLimboResolutions;){const e=n.xa.values().next().value;n.xa.delete(e);const t=new L(Y.fromString(e)),r=n.qa.next();n.Na.set(r,new E_(t)),n.Oa=n.Oa.insert(t,r),Zl(n.remoteStore,new dt(Me(Io(t.path)),r,"TargetPurposeLimboResolution",_o.oe))}}async function fr(n,e,t){const r=U(n),i=[],s=[],a=[];r.Fa.isEmpty()||(r.Fa.forEach(((u,l)=>{a.push(r.Ka(l,e,t).then((d=>{var p;if((d||t)&&r.isPrimaryClient){const v=d?!d.fromCache:(p=t==null?void 0:t.targetChanges.get(l.targetId))===null||p===void 0?void 0:p.current;r.sharedClientState.updateQueryState(l.targetId,v?"current":"not-current")}if(d){i.push(d);const v=ko.Wi(l.targetId,d);s.push(v)}})))})),await Promise.all(a),r.Ca.d_(i),await(async function(l,d){const p=U(l);try{await p.persistence.runTransaction("notifyLocalViewChanges","readwrite",(v=>P.forEach(d,(A=>P.forEach(A.$i,(S=>p.persistence.referenceDelegate.addReference(v,A.targetId,S))).next((()=>P.forEach(A.Ui,(S=>p.persistence.referenceDelegate.removeReference(v,A.targetId,S)))))))))}catch(v){if(!ur(v))throw v;V("LocalStore","Failed to update sequence numbers: "+v)}for(const v of d){const A=v.targetId;if(!v.fromCache){const S=p.os.get(A),k=S.snapshotVersion,O=S.withLastLimboFreeSnapshotVersion(k);p.os=p.os.insert(A,O)}}})(r.localStore,s))}async function O_(n,e){const t=U(n);if(!t.currentUser.isEqual(e)){V("SyncEngine","User change. New user:",e.toKey());const r=await Ql(t.localStore,e);t.currentUser=e,(function(s,a){s.ka.forEach((u=>{u.forEach((l=>{l.reject(new D(R.CANCELLED,a))}))})),s.ka.clear()})(t,"'waitForPendingWrites' promise is rejected due to a user change."),t.sharedClientState.handleUserChange(e,r.removedBatchIds,r.addedBatchIds),await fr(t,r.hs)}}function L_(n,e){const t=U(n),r=t.Na.get(e);if(r&&r.va)return B().add(r.key);{let i=B();const s=t.Ma.get(e);if(!s)return i;for(const a of s){const u=t.Fa.get(a);i=i.unionWith(u.view.Va)}return i}}function gh(n){const e=U(n);return e.remoteStore.remoteSyncer.applyRemoteEvent=hh.bind(null,e),e.remoteStore.remoteSyncer.getRemoteKeysForTarget=L_.bind(null,e),e.remoteStore.remoteSyncer.rejectListen=k_.bind(null,e),e.Ca.d_=y_.bind(null,e.eventManager),e.Ca.$a=v_.bind(null,e.eventManager),e}function M_(n){const e=U(n);return e.remoteStore.remoteSyncer.applySuccessfulWrite=N_.bind(null,e),e.remoteStore.remoteSyncer.rejectFailedWrite=D_.bind(null,e),e}class ui{constructor(){this.kind="memory",this.synchronizeTabs=!1}async initialize(e){this.serializer=Si(e.databaseInfo.databaseId),this.sharedClientState=this.Wa(e),this.persistence=this.Ga(e),await this.persistence.start(),this.localStore=this.za(e),this.gcScheduler=this.ja(e,this.localStore),this.indexBackfillerScheduler=this.Ha(e,this.localStore)}ja(e,t){return null}Ha(e,t){return null}za(e){return $m(this.persistence,new Bm,e.initialUser,this.serializer)}Ga(e){return new xm(Co.Zr,this.serializer)}Wa(e){return new Qm}async terminate(){var e,t;(e=this.gcScheduler)===null||e===void 0||e.stop(),(t=this.indexBackfillerScheduler)===null||t===void 0||t.stop(),this.sharedClientState.shutdown(),await this.persistence.shutdown()}}ui.provider={build:()=>new ui};class io{async initialize(e,t){this.localStore||(this.localStore=e.localStore,this.sharedClientState=e.sharedClientState,this.datastore=this.createDatastore(t),this.remoteStore=this.createRemoteStore(t),this.eventManager=this.createEventManager(t),this.syncEngine=this.createSyncEngine(t,!e.synchronizeTabs),this.sharedClientState.onlineStateHandler=r=>tu(this.syncEngine,r,1),this.remoteStore.remoteSyncer.handleCredentialChange=O_.bind(null,this.syncEngine),await g_(this.remoteStore,this.syncEngine.isPrimaryClient))}createEventManager(e){return(function(){return new __})()}createDatastore(e){const t=Si(e.databaseInfo.databaseId),r=(function(s){return new Zm(s)})(e.databaseInfo);return(function(s,a,u,l){return new n_(s,a,u,l)})(e.authCredentials,e.appCheckCredentials,r,t)}createRemoteStore(e){return(function(r,i,s,a,u){return new i_(r,i,s,a,u)})(this.localStore,this.datastore,e.asyncQueue,(t=>tu(this.syncEngine,t,0)),(function(){return Jc.D()?new Jc:new Jm})())}createSyncEngine(e,t){return(function(i,s,a,u,l,d,p){const v=new I_(i,s,a,u,l,d);return p&&(v.Qa=!0),v})(this.localStore,this.remoteStore,this.eventManager,this.sharedClientState,e.initialUser,e.maxConcurrentLimboResolutions,t)}async terminate(){var e,t;await(async function(i){const s=U(i);V("RemoteStore","RemoteStore shutting down."),s.L_.add(5),await dr(s),s.k_.shutdown(),s.q_.set("Unknown")})(this.remoteStore),(e=this.datastore)===null||e===void 0||e.terminate(),(t=this.eventManager)===null||t===void 0||t.terminate()}}io.provider={build:()=>new io};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *//**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class mh{constructor(e){this.observer=e,this.muted=!1}next(e){this.muted||this.observer.next&&this.Ya(this.observer.next,e)}error(e){this.muted||(this.observer.error?this.Ya(this.observer.error,e):Ze("Uncaught Error in snapshot listener:",e.toString()))}Za(){this.muted=!0}Ya(e,t){setTimeout((()=>{this.muted||e(t)}),0)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class x_{constructor(e,t,r,i,s){this.authCredentials=e,this.appCheckCredentials=t,this.asyncQueue=r,this.databaseInfo=i,this.user=ve.UNAUTHENTICATED,this.clientId=gl.newId(),this.authCredentialListener=()=>Promise.resolve(),this.appCheckCredentialListener=()=>Promise.resolve(),this._uninitializedComponentsProvider=s,this.authCredentials.start(r,(async a=>{V("FirestoreClient","Received user=",a.uid),await this.authCredentialListener(a),this.user=a})),this.appCheckCredentials.start(r,(a=>(V("FirestoreClient","Received new app check token=",a),this.appCheckCredentialListener(a,this.user))))}get configuration(){return{asyncQueue:this.asyncQueue,databaseInfo:this.databaseInfo,clientId:this.clientId,authCredentials:this.authCredentials,appCheckCredentials:this.appCheckCredentials,initialUser:this.user,maxConcurrentLimboResolutions:100}}setCredentialChangeListener(e){this.authCredentialListener=e}setAppCheckTokenChangeListener(e){this.appCheckCredentialListener=e}terminate(){this.asyncQueue.enterRestrictedMode();const e=new Ye;return this.asyncQueue.enqueueAndForgetEvenWhileRestricted((async()=>{try{this._onlineComponents&&await this._onlineComponents.terminate(),this._offlineComponents&&await this._offlineComponents.terminate(),this.authCredentials.shutdown(),this.appCheckCredentials.shutdown(),e.resolve()}catch(t){const r=Mo(t,"Failed to shutdown persistence");e.reject(r)}})),e.promise}}async function bs(n,e){n.asyncQueue.verifyOperationInProgress(),V("FirestoreClient","Initializing OfflineComponentProvider");const t=n.configuration;await e.initialize(t);let r=t.initialUser;n.setCredentialChangeListener((async i=>{r.isEqual(i)||(await Ql(e.localStore,i),r=i)})),e.persistence.setDatabaseDeletedListener((()=>n.terminate())),n._offlineComponents=e}async function ru(n,e){n.asyncQueue.verifyOperationInProgress();const t=await F_(n);V("FirestoreClient","Initializing OnlineComponentProvider"),await e.initialize(t,n.configuration),n.setCredentialChangeListener((r=>Yc(e.remoteStore,r))),n.setAppCheckTokenChangeListener(((r,i)=>Yc(e.remoteStore,i))),n._onlineComponents=e}async function F_(n){if(!n._offlineComponents)if(n._uninitializedComponentsProvider){V("FirestoreClient","Using user provided OfflineComponentProvider");try{await bs(n,n._uninitializedComponentsProvider._offline)}catch(e){const t=e;if(!(function(i){return i.name==="FirebaseError"?i.code===R.FAILED_PRECONDITION||i.code===R.UNIMPLEMENTED:!(typeof DOMException<"u"&&i instanceof DOMException)||i.code===22||i.code===20||i.code===11})(t))throw t;rn("Error using user provided cache. Falling back to memory cache: "+t),await bs(n,new ui)}}else V("FirestoreClient","Using default OfflineComponentProvider"),await bs(n,new ui);return n._offlineComponents}async function _h(n){return n._onlineComponents||(n._uninitializedComponentsProvider?(V("FirestoreClient","Using user provided OnlineComponentProvider"),await ru(n,n._uninitializedComponentsProvider._online)):(V("FirestoreClient","Using default OnlineComponentProvider"),await ru(n,new io))),n._onlineComponents}function U_(n){return _h(n).then((e=>e.syncEngine))}async function yh(n){const e=await _h(n),t=e.eventManager;return t.onListen=A_.bind(null,e.syncEngine),t.onUnlisten=S_.bind(null,e.syncEngine),t.onFirstRemoteStoreListen=b_.bind(null,e.syncEngine),t.onLastRemoteStoreUnlisten=P_.bind(null,e.syncEngine),t}function B_(n,e,t={}){const r=new Ye;return n.asyncQueue.enqueueAndForget((async()=>(function(s,a,u,l,d){const p=new mh({next:A=>{p.Za(),a.enqueueAndForget((()=>oh(s,v)));const S=A.docs.has(u);!S&&A.fromCache?d.reject(new D(R.UNAVAILABLE,"Failed to get document because the client is offline.")):S&&A.fromCache&&l&&l.source==="server"?d.reject(new D(R.UNAVAILABLE,'Failed to get document from server. (However, this document does exist in the local cache. Run again without setting source to "server" to retrieve the cached document.)')):d.resolve(A)},error:A=>d.reject(A)}),v=new ah(Io(u.path),p,{includeMetadataChanges:!0,_a:!0});return sh(s,v)})(await yh(n),n.asyncQueue,e,t,r))),r.promise}function q_(n,e,t={}){const r=new Ye;return n.asyncQueue.enqueueAndForget((async()=>(function(s,a,u,l,d){const p=new mh({next:A=>{p.Za(),a.enqueueAndForget((()=>oh(s,v))),A.fromCache&&l.source==="server"?d.reject(new D(R.UNAVAILABLE,'Failed to get documents from server. (However, these documents may exist in the local cache. Run again without setting source to "server" to retrieve the cached documents.)')):d.resolve(A)},error:A=>d.reject(A)}),v=new ah(u,p,{includeMetadataChanges:!0,_a:!0});return sh(s,v)})(await yh(n),n.asyncQueue,e,t,r))),r.promise}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function vh(n){const e={};return n.timeoutSeconds!==void 0&&(e.timeoutSeconds=n.timeoutSeconds),e}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const iu=new Map;/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function wh(n,e,t){if(!t)throw new D(R.INVALID_ARGUMENT,`Function ${n}() cannot be called with an empty ${e}.`)}function $_(n,e,t,r){if(e===!0&&r===!0)throw new D(R.INVALID_ARGUMENT,`${n} and ${t} cannot be used together.`)}function su(n){if(!L.isDocumentKey(n))throw new D(R.INVALID_ARGUMENT,`Invalid document reference. Document references must have an even number of segments, but ${n} has ${n.length}.`)}function ou(n){if(L.isDocumentKey(n))throw new D(R.INVALID_ARGUMENT,`Invalid collection reference. Collection references must have an odd number of segments, but ${n} has ${n.length}.`)}function ki(n){if(n===void 0)return"undefined";if(n===null)return"null";if(typeof n=="string")return n.length>20&&(n=`${n.substring(0,20)}...`),JSON.stringify(n);if(typeof n=="number"||typeof n=="boolean")return""+n;if(typeof n=="object"){if(n instanceof Array)return"an array";{const e=(function(r){return r.constructor?r.constructor.name:null})(n);return e?`a custom ${e} object`:"an object"}}return typeof n=="function"?"a function":x()}function vt(n,e){if("_delegate"in n&&(n=n._delegate),!(n instanceof e)){if(e.name===n.constructor.name)throw new D(R.INVALID_ARGUMENT,"Type does not match the expected instance. Did you pass a reference from a different Firestore SDK?");{const t=ki(n);throw new D(R.INVALID_ARGUMENT,`Expected type '${e.name}', but it was: ${t}`)}}return n}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class au{constructor(e){var t,r;if(e.host===void 0){if(e.ssl!==void 0)throw new D(R.INVALID_ARGUMENT,"Can't provide ssl option if host option is not set");this.host="firestore.googleapis.com",this.ssl=!0}else this.host=e.host,this.ssl=(t=e.ssl)===null||t===void 0||t;if(this.credentials=e.credentials,this.ignoreUndefinedProperties=!!e.ignoreUndefinedProperties,this.localCache=e.localCache,e.cacheSizeBytes===void 0)this.cacheSizeBytes=41943040;else{if(e.cacheSizeBytes!==-1&&e.cacheSizeBytes<1048576)throw new D(R.INVALID_ARGUMENT,"cacheSizeBytes must be at least 1048576");this.cacheSizeBytes=e.cacheSizeBytes}$_("experimentalForceLongPolling",e.experimentalForceLongPolling,"experimentalAutoDetectLongPolling",e.experimentalAutoDetectLongPolling),this.experimentalForceLongPolling=!!e.experimentalForceLongPolling,this.experimentalForceLongPolling?this.experimentalAutoDetectLongPolling=!1:e.experimentalAutoDetectLongPolling===void 0?this.experimentalAutoDetectLongPolling=!0:this.experimentalAutoDetectLongPolling=!!e.experimentalAutoDetectLongPolling,this.experimentalLongPollingOptions=vh((r=e.experimentalLongPollingOptions)!==null&&r!==void 0?r:{}),(function(s){if(s.timeoutSeconds!==void 0){if(isNaN(s.timeoutSeconds))throw new D(R.INVALID_ARGUMENT,`invalid long polling timeout: ${s.timeoutSeconds} (must not be NaN)`);if(s.timeoutSeconds<5)throw new D(R.INVALID_ARGUMENT,`invalid long polling timeout: ${s.timeoutSeconds} (minimum allowed value is 5)`);if(s.timeoutSeconds>30)throw new D(R.INVALID_ARGUMENT,`invalid long polling timeout: ${s.timeoutSeconds} (maximum allowed value is 30)`)}})(this.experimentalLongPollingOptions),this.useFetchStreams=!!e.useFetchStreams}isEqual(e){return this.host===e.host&&this.ssl===e.ssl&&this.credentials===e.credentials&&this.cacheSizeBytes===e.cacheSizeBytes&&this.experimentalForceLongPolling===e.experimentalForceLongPolling&&this.experimentalAutoDetectLongPolling===e.experimentalAutoDetectLongPolling&&(function(r,i){return r.timeoutSeconds===i.timeoutSeconds})(this.experimentalLongPollingOptions,e.experimentalLongPollingOptions)&&this.ignoreUndefinedProperties===e.ignoreUndefinedProperties&&this.useFetchStreams===e.useFetchStreams}}class Ni{constructor(e,t,r,i){this._authCredentials=e,this._appCheckCredentials=t,this._databaseId=r,this._app=i,this.type="firestore-lite",this._persistenceKey="(lite)",this._settings=new au({}),this._settingsFrozen=!1,this._terminateTask="notTerminated"}get app(){if(!this._app)throw new D(R.FAILED_PRECONDITION,"Firestore was not initialized using the Firebase SDK. 'app' is not available");return this._app}get _initialized(){return this._settingsFrozen}get _terminated(){return this._terminateTask!=="notTerminated"}_setSettings(e){if(this._settingsFrozen)throw new D(R.FAILED_PRECONDITION,"Firestore has already been started and its settings can no longer be changed. You can only modify settings before calling any other methods on a Firestore object.");this._settings=new au(e),e.credentials!==void 0&&(this._authCredentials=(function(r){if(!r)return new sg;switch(r.type){case"firstParty":return new ug(r.sessionIndex||"0",r.iamToken||null,r.authTokenFactory||null);case"provider":return r.client;default:throw new D(R.INVALID_ARGUMENT,"makeAuthCredentialsProvider failed due to invalid credential type")}})(e.credentials))}_getSettings(){return this._settings}_freezeSettings(){return this._settingsFrozen=!0,this._settings}_delete(){return this._terminateTask==="notTerminated"&&(this._terminateTask=this._terminate()),this._terminateTask}async _restart(){this._terminateTask==="notTerminated"?await this._terminate():this._terminateTask="notTerminated"}toJSON(){return{app:this._app,databaseId:this._databaseId,settings:this._settings}}_terminate(){return(function(t){const r=iu.get(t);r&&(V("ComponentProvider","Removing Datastore"),iu.delete(t),r.terminate())})(this),Promise.resolve()}}function j_(n,e,t,r={}){var i;const s=(n=vt(n,Ni))._getSettings(),a=`${e}:${t}`;if(s.host!=="firestore.googleapis.com"&&s.host!==a&&rn("Host has been set in both settings() and connectFirestoreEmulator(), emulator host will be used."),n._setSettings(Object.assign(Object.assign({},s),{host:a,ssl:!1})),r.mockUserToken){let u,l;if(typeof r.mockUserToken=="string")u=r.mockUserToken,l=ve.MOCK_USER;else{u=xf(r.mockUserToken,(i=n._app)===null||i===void 0?void 0:i.options.projectId);const d=r.mockUserToken.sub||r.mockUserToken.user_id;if(!d)throw new D(R.INVALID_ARGUMENT,"mockUserToken must contain 'sub' or 'user_id' field!");l=new ve(d)}n._authCredentials=new og(new pl(u,l))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class $t{constructor(e,t,r){this.converter=t,this._query=r,this.type="query",this.firestore=e}withConverter(e){return new $t(this.firestore,e,this._query)}}class Se{constructor(e,t,r){this.converter=t,this._key=r,this.type="document",this.firestore=e}get _path(){return this._key.path}get id(){return this._key.path.lastSegment()}get path(){return this._key.path.canonicalString()}get parent(){return new pt(this.firestore,this.converter,this._key.path.popLast())}withConverter(e){return new Se(this.firestore,e,this._key)}}class pt extends $t{constructor(e,t,r){super(e,t,Io(r)),this._path=r,this.type="collection"}get id(){return this._query.path.lastSegment()}get path(){return this._query.path.canonicalString()}get parent(){const e=this._path.popLast();return e.isEmpty()?null:new Se(this.firestore,null,new L(e))}withConverter(e){return new pt(this.firestore,e,this._path)}}function Uo(n,e,...t){if(n=re(n),wh("collection","path",e),n instanceof Ni){const r=Y.fromString(e,...t);return ou(r),new pt(n,null,r)}{if(!(n instanceof Se||n instanceof pt))throw new D(R.INVALID_ARGUMENT,"Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore");const r=n._path.child(Y.fromString(e,...t));return ou(r),new pt(n.firestore,null,r)}}function Di(n,e,...t){if(n=re(n),arguments.length===1&&(e=gl.newId()),wh("doc","path",e),n instanceof Ni){const r=Y.fromString(e,...t);return su(r),new Se(n,null,new L(r))}{if(!(n instanceof Se||n instanceof pt))throw new D(R.INVALID_ARGUMENT,"Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore");const r=n._path.child(Y.fromString(e,...t));return su(r),new Se(n.firestore,n instanceof pt?n.converter:null,new L(r))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class cu{constructor(e=Promise.resolve()){this.Pu=[],this.Iu=!1,this.Tu=[],this.Eu=null,this.du=!1,this.Au=!1,this.Ru=[],this.t_=new Yl(this,"async_queue_retry"),this.Vu=()=>{const r=As();r&&V("AsyncQueue","Visibility state changed to "+r.visibilityState),this.t_.jo()},this.mu=e;const t=As();t&&typeof t.addEventListener=="function"&&t.addEventListener("visibilitychange",this.Vu)}get isShuttingDown(){return this.Iu}enqueueAndForget(e){this.enqueue(e)}enqueueAndForgetEvenWhileRestricted(e){this.fu(),this.gu(e)}enterRestrictedMode(e){if(!this.Iu){this.Iu=!0,this.Au=e||!1;const t=As();t&&typeof t.removeEventListener=="function"&&t.removeEventListener("visibilitychange",this.Vu)}}enqueue(e){if(this.fu(),this.Iu)return new Promise((()=>{}));const t=new Ye;return this.gu((()=>this.Iu&&this.Au?Promise.resolve():(e().then(t.resolve,t.reject),t.promise))).then((()=>t.promise))}enqueueRetryable(e){this.enqueueAndForget((()=>(this.Pu.push(e),this.pu())))}async pu(){if(this.Pu.length!==0){try{await this.Pu[0](),this.Pu.shift(),this.t_.reset()}catch(e){if(!ur(e))throw e;V("AsyncQueue","Operation failed with retryable error: "+e)}this.Pu.length>0&&this.t_.Go((()=>this.pu()))}}gu(e){const t=this.mu.then((()=>(this.du=!0,e().catch((r=>{this.Eu=r,this.du=!1;const i=(function(a){let u=a.message||"";return a.stack&&(u=a.stack.includes(a.message)?a.stack:a.message+`
`+a.stack),u})(r);throw Ze("INTERNAL UNHANDLED ERROR: ",i),r})).then((r=>(this.du=!1,r))))));return this.mu=t,t}enqueueAfterDelay(e,t,r){this.fu(),this.Ru.indexOf(e)>-1&&(t=0);const i=Lo.createAndSchedule(this,e,t,r,(s=>this.yu(s)));return this.Tu.push(i),i}fu(){this.Eu&&x()}verifyOperationInProgress(){}async wu(){let e;do e=this.mu,await e;while(e!==this.mu)}Su(e){for(const t of this.Tu)if(t.timerId===e)return!0;return!1}bu(e){return this.wu().then((()=>{this.Tu.sort(((t,r)=>t.targetTimeMs-r.targetTimeMs));for(const t of this.Tu)if(t.skipDelay(),e!=="all"&&t.timerId===e)break;return this.wu()}))}Du(e){this.Ru.push(e)}yu(e){const t=this.Tu.indexOf(e);this.Tu.splice(t,1)}}class pr extends Ni{constructor(e,t,r,i){super(e,t,r,i),this.type="firestore",this._queue=new cu,this._persistenceKey=(i==null?void 0:i.name)||"[DEFAULT]"}async _terminate(){if(this._firestoreClient){const e=this._firestoreClient.terminate();this._queue=new cu(e),this._firestoreClient=void 0,await e}}}function z_(n,e){const t=typeof n=="object"?n:wi(),r=typeof n=="string"?n:"(default)",i=Ut(t,"firestore").getImmediate({identifier:r});if(!i._initialized){const s=Xu("firestore");s&&j_(i,...s)}return i}function Bo(n){if(n._terminated)throw new D(R.FAILED_PRECONDITION,"The client has already been terminated.");return n._firestoreClient||H_(n),n._firestoreClient}function H_(n){var e,t,r;const i=n._freezeSettings(),s=(function(u,l,d,p){return new Eg(u,l,d,p.host,p.ssl,p.experimentalForceLongPolling,p.experimentalAutoDetectLongPolling,vh(p.experimentalLongPollingOptions),p.useFetchStreams)})(n._databaseId,((e=n._app)===null||e===void 0?void 0:e.options.appId)||"",n._persistenceKey,i);n._componentsProvider||!((t=i.localCache)===null||t===void 0)&&t._offlineComponentProvider&&(!((r=i.localCache)===null||r===void 0)&&r._onlineComponentProvider)&&(n._componentsProvider={_offline:i.localCache._offlineComponentProvider,_online:i.localCache._onlineComponentProvider}),n._firestoreClient=new x_(n._authCredentials,n._appCheckCredentials,n._queue,s,n._componentsProvider&&(function(u){const l=u==null?void 0:u._online.build();return{_offline:u==null?void 0:u._offline.build(l),_online:l}})(n._componentsProvider))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ln{constructor(e){this._byteString=e}static fromBase64String(e){try{return new ln(fe.fromBase64String(e))}catch(t){throw new D(R.INVALID_ARGUMENT,"Failed to construct data from Base64 string: "+t)}}static fromUint8Array(e){return new ln(fe.fromUint8Array(e))}toBase64(){return this._byteString.toBase64()}toUint8Array(){return this._byteString.toUint8Array()}toString(){return"Bytes(base64: "+this.toBase64()+")"}isEqual(e){return this._byteString.isEqual(e._byteString)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Vi{constructor(...e){for(let t=0;t<e.length;++t)if(e[t].length===0)throw new D(R.INVALID_ARGUMENT,"Invalid field name at argument $(i + 1). Field names must not be empty.");this._internalPath=new le(e)}isEqual(e){return this._internalPath.isEqual(e._internalPath)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Oi{constructor(e){this._methodName=e}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class qo{constructor(e,t){if(!isFinite(e)||e<-90||e>90)throw new D(R.INVALID_ARGUMENT,"Latitude must be a number between -90 and 90, but was: "+e);if(!isFinite(t)||t<-180||t>180)throw new D(R.INVALID_ARGUMENT,"Longitude must be a number between -180 and 180, but was: "+t);this._lat=e,this._long=t}get latitude(){return this._lat}get longitude(){return this._long}isEqual(e){return this._lat===e._lat&&this._long===e._long}toJSON(){return{latitude:this._lat,longitude:this._long}}_compareTo(e){return z(this._lat,e._lat)||z(this._long,e._long)}}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class $o{constructor(e){this._values=(e||[]).map((t=>t))}toArray(){return this._values.map((e=>e))}isEqual(e){return(function(r,i){if(r.length!==i.length)return!1;for(let s=0;s<r.length;++s)if(r[s]!==i[s])return!1;return!0})(this._values,e._values)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const K_=/^__.*__$/;class W_{constructor(e,t,r){this.data=e,this.fieldMask=t,this.fieldTransforms=r}toMutation(e,t){return this.fieldMask!==null?new wt(e,this.data,this.fieldMask,t,this.fieldTransforms):new lr(e,this.data,t,this.fieldTransforms)}}class Th{constructor(e,t,r){this.data=e,this.fieldMask=t,this.fieldTransforms=r}toMutation(e,t){return new wt(e,this.data,this.fieldMask,t,this.fieldTransforms)}}function Eh(n){switch(n){case 0:case 2:case 1:return!0;case 3:case 4:return!1;default:throw x()}}class jo{constructor(e,t,r,i,s,a){this.settings=e,this.databaseId=t,this.serializer=r,this.ignoreUndefinedProperties=i,s===void 0&&this.vu(),this.fieldTransforms=s||[],this.fieldMask=a||[]}get path(){return this.settings.path}get Cu(){return this.settings.Cu}Fu(e){return new jo(Object.assign(Object.assign({},this.settings),e),this.databaseId,this.serializer,this.ignoreUndefinedProperties,this.fieldTransforms,this.fieldMask)}Mu(e){var t;const r=(t=this.path)===null||t===void 0?void 0:t.child(e),i=this.Fu({path:r,xu:!1});return i.Ou(e),i}Nu(e){var t;const r=(t=this.path)===null||t===void 0?void 0:t.child(e),i=this.Fu({path:r,xu:!1});return i.vu(),i}Lu(e){return this.Fu({path:void 0,xu:!0})}Bu(e){return li(e,this.settings.methodName,this.settings.ku||!1,this.path,this.settings.qu)}contains(e){return this.fieldMask.find((t=>e.isPrefixOf(t)))!==void 0||this.fieldTransforms.find((t=>e.isPrefixOf(t.field)))!==void 0}vu(){if(this.path)for(let e=0;e<this.path.length;e++)this.Ou(this.path.get(e))}Ou(e){if(e.length===0)throw this.Bu("Document fields must not be empty");if(Eh(this.Cu)&&K_.test(e))throw this.Bu('Document fields cannot begin and end with "__"')}}class G_{constructor(e,t,r){this.databaseId=e,this.ignoreUndefinedProperties=t,this.serializer=r||Si(e)}Qu(e,t,r,i=!1){return new jo({Cu:e,methodName:t,qu:r,path:le.emptyPath(),xu:!1,ku:i},this.databaseId,this.serializer,this.ignoreUndefinedProperties)}}function zo(n){const e=n._freezeSettings(),t=Si(n._databaseId);return new G_(n._databaseId,!!e.ignoreUndefinedProperties,t)}function Q_(n,e,t,r,i,s={}){const a=n.Qu(s.merge||s.mergeFields?2:0,e,t,i);Ko("Data must be an object, but it was:",a,r);const u=Ih(r,a);let l,d;if(s.merge)l=new Ce(a.fieldMask),d=a.fieldTransforms;else if(s.mergeFields){const p=[];for(const v of s.mergeFields){const A=so(e,v,t);if(!a.contains(A))throw new D(R.INVALID_ARGUMENT,`Field '${A}' is specified in your field mask but missing from your input data.`);bh(p,A)||p.push(A)}l=new Ce(p),d=a.fieldTransforms.filter((v=>l.covers(v.field)))}else l=null,d=a.fieldTransforms;return new W_(new be(u),l,d)}class Li extends Oi{_toFieldTransform(e){if(e.Cu!==2)throw e.Cu===1?e.Bu(`${this._methodName}() can only appear at the top level of your update data`):e.Bu(`${this._methodName}() cannot be used with set() unless you pass {merge:true}`);return e.fieldMask.push(e.path),null}isEqual(e){return e instanceof Li}}class Ho extends Oi{_toFieldTransform(e){return new Wg(e.path,new tr)}isEqual(e){return e instanceof Ho}}function J_(n,e,t,r){const i=n.Qu(1,e,t);Ko("Data must be an object, but it was:",i,r);const s=[],a=be.empty();Bt(r,((l,d)=>{const p=Wo(e,l,t);d=re(d);const v=i.Nu(p);if(d instanceof Li)s.push(p);else{const A=gr(d,v);A!=null&&(s.push(p),a.set(p,A))}}));const u=new Ce(s);return new Th(a,u,i.fieldTransforms)}function Y_(n,e,t,r,i,s){const a=n.Qu(1,e,t),u=[so(e,r,t)],l=[i];if(s.length%2!=0)throw new D(R.INVALID_ARGUMENT,`Function ${e}() needs to be called with an even number of arguments that alternate between field names and values.`);for(let A=0;A<s.length;A+=2)u.push(so(e,s[A])),l.push(s[A+1]);const d=[],p=be.empty();for(let A=u.length-1;A>=0;--A)if(!bh(d,u[A])){const S=u[A];let k=l[A];k=re(k);const O=a.Nu(S);if(k instanceof Li)d.push(S);else{const N=gr(k,O);N!=null&&(d.push(S),p.set(S,N))}}const v=new Ce(d);return new Th(p,v,a.fieldTransforms)}function X_(n,e,t,r=!1){return gr(t,n.Qu(r?4:3,e))}function gr(n,e){if(Ah(n=re(n)))return Ko("Unsupported field value:",e,n),Ih(n,e);if(n instanceof Oi)return(function(r,i){if(!Eh(i.Cu))throw i.Bu(`${r._methodName}() can only be used with update() and set()`);if(!i.path)throw i.Bu(`${r._methodName}() is not currently supported inside arrays`);const s=r._toFieldTransform(i);s&&i.fieldTransforms.push(s)})(n,e),null;if(n===void 0&&e.ignoreUndefinedProperties)return null;if(e.path&&e.fieldMask.push(e.path),n instanceof Array){if(e.settings.xu&&e.Cu!==4)throw e.Bu("Nested arrays are not supported");return(function(r,i){const s=[];let a=0;for(const u of r){let l=gr(u,i.Lu(a));l==null&&(l={nullValue:"NULL_VALUE"}),s.push(l),a++}return{arrayValue:{values:s}}})(n,e)}return(function(r,i){if((r=re(r))===null)return{nullValue:"NULL_VALUE"};if(typeof r=="number")return zg(i.serializer,r);if(typeof r=="boolean")return{booleanValue:r};if(typeof r=="string")return{stringValue:r};if(r instanceof Date){const s=oe.fromDate(r);return{timestampValue:ai(i.serializer,s)}}if(r instanceof oe){const s=new oe(r.seconds,1e3*Math.floor(r.nanoseconds/1e3));return{timestampValue:ai(i.serializer,s)}}if(r instanceof qo)return{geoPointValue:{latitude:r.latitude,longitude:r.longitude}};if(r instanceof ln)return{bytesValue:$l(i.serializer,r._byteString)};if(r instanceof Se){const s=i.databaseId,a=r.firestore._databaseId;if(!a.isEqual(s))throw i.Bu(`Document reference is for database ${a.projectId}/${a.database} but should be for database ${s.projectId}/${s.database}`);return{referenceValue:So(r.firestore._databaseId||i.databaseId,r._key.path)}}if(r instanceof $o)return(function(a,u){return{mapValue:{fields:{__type__:{stringValue:"__vector__"},value:{arrayValue:{values:a.toArray().map((l=>{if(typeof l!="number")throw u.Bu("VectorValues must only contain numeric values.");return Ao(u.serializer,l)}))}}}}}})(r,i);throw i.Bu(`Unsupported field value: ${ki(r)}`)})(n,e)}function Ih(n,e){const t={};return ml(n)?e.path&&e.path.length>0&&e.fieldMask.push(e.path):Bt(n,((r,i)=>{const s=gr(i,e.Mu(r));s!=null&&(t[r]=s)})),{mapValue:{fields:t}}}function Ah(n){return!(typeof n!="object"||n===null||n instanceof Array||n instanceof Date||n instanceof oe||n instanceof qo||n instanceof ln||n instanceof Se||n instanceof Oi||n instanceof $o)}function Ko(n,e,t){if(!Ah(t)||!(function(i){return typeof i=="object"&&i!==null&&(Object.getPrototypeOf(i)===Object.prototype||Object.getPrototypeOf(i)===null)})(t)){const r=ki(t);throw r==="an object"?e.Bu(n+" a custom object"):e.Bu(n+" "+r)}}function so(n,e,t){if((e=re(e))instanceof Vi)return e._internalPath;if(typeof e=="string")return Wo(n,e);throw li("Field path arguments must be of type string or ",n,!1,void 0,t)}const Z_=new RegExp("[~\\*/\\[\\]]");function Wo(n,e,t){if(e.search(Z_)>=0)throw li(`Invalid field path (${e}). Paths must not contain '~', '*', '/', '[', or ']'`,n,!1,void 0,t);try{return new Vi(...e.split("."))._internalPath}catch{throw li(`Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`,n,!1,void 0,t)}}function li(n,e,t,r,i){const s=r&&!r.isEmpty(),a=i!==void 0;let u=`Function ${e}() called with invalid data`;t&&(u+=" (via `toFirestore()`)"),u+=". ";let l="";return(s||a)&&(l+=" (found",s&&(l+=` in field ${r}`),a&&(l+=` in document ${i}`),l+=")"),new D(R.INVALID_ARGUMENT,u+n+l)}function bh(n,e){return n.some((t=>t.isEqual(e)))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Rh{constructor(e,t,r,i,s){this._firestore=e,this._userDataWriter=t,this._key=r,this._document=i,this._converter=s}get id(){return this._key.path.lastSegment()}get ref(){return new Se(this._firestore,this._converter,this._key)}exists(){return this._document!==null}data(){if(this._document){if(this._converter){const e=new ey(this._firestore,this._userDataWriter,this._key,this._document,null);return this._converter.fromFirestore(e)}return this._userDataWriter.convertValue(this._document.data.value)}}get(e){if(this._document){const t=this._document.data.field(Mi("DocumentSnapshot.get",e));if(t!==null)return this._userDataWriter.convertValue(t)}}}class ey extends Rh{data(){return super.data()}}function Mi(n,e){return typeof e=="string"?Wo(n,e):e instanceof Vi?e._internalPath:e._delegate._internalPath}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ty(n){if(n.limitType==="L"&&n.explicitOrderBy.length===0)throw new D(R.UNIMPLEMENTED,"limitToLast() queries require specifying at least one orderBy() clause")}class Go{}class Sh extends Go{}function Ph(n,e,...t){let r=[];e instanceof Go&&r.push(e),r=r.concat(t),(function(s){const a=s.filter((l=>l instanceof Qo)).length,u=s.filter((l=>l instanceof xi)).length;if(a>1||a>0&&u>0)throw new D(R.INVALID_ARGUMENT,"InvalidQuery. When using composite filters, you cannot use more than one filter at the top level. Consider nesting the multiple filters within an `and(...)` statement. For example: change `query(query, where(...), or(...))` to `query(query, and(where(...), or(...)))`.")})(r);for(const i of r)n=i._apply(n);return n}class xi extends Sh{constructor(e,t,r){super(),this._field=e,this._op=t,this._value=r,this.type="where"}static _create(e,t,r){return new xi(e,t,r)}_apply(e){const t=this._parse(e);return kh(e._query,t),new $t(e.firestore,e.converter,Qs(e._query,t))}_parse(e){const t=zo(e.firestore);return(function(s,a,u,l,d,p,v){let A;if(d.isKeyField()){if(p==="array-contains"||p==="array-contains-any")throw new D(R.INVALID_ARGUMENT,`Invalid Query. You can't perform '${p}' queries on documentId().`);if(p==="in"||p==="not-in"){lu(v,p);const S=[];for(const k of v)S.push(uu(l,s,k));A={arrayValue:{values:S}}}else A=uu(l,s,v)}else p!=="in"&&p!=="not-in"&&p!=="array-contains-any"||lu(v,p),A=X_(u,a,v,p==="in"||p==="not-in");return se.create(d,p,A)})(e._query,"where",t,e.firestore._databaseId,this._field,this._op,this._value)}}function ny(n,e,t){const r=e,i=Mi("where",n);return xi._create(i,r,t)}class Qo extends Go{constructor(e,t){super(),this.type=e,this._queryConstraints=t}static _create(e,t){return new Qo(e,t)}_parse(e){const t=this._queryConstraints.map((r=>r._parse(e))).filter((r=>r.getFilters().length>0));return t.length===1?t[0]:Oe.create(t,this._getOperator())}_apply(e){const t=this._parse(e);return t.getFilters().length===0?e:((function(i,s){let a=i;const u=s.getFlattenedFilters();for(const l of u)kh(a,l),a=Qs(a,l)})(e._query,t),new $t(e.firestore,e.converter,Qs(e._query,t)))}_getQueryConstraints(){return this._queryConstraints}_getOperator(){return this.type==="and"?"and":"or"}}class Jo extends Sh{constructor(e,t){super(),this._field=e,this._direction=t,this.type="orderBy"}static _create(e,t){return new Jo(e,t)}_apply(e){const t=(function(i,s,a){if(i.startAt!==null)throw new D(R.INVALID_ARGUMENT,"Invalid query. You must not call startAt() or startAfter() before calling orderBy().");if(i.endAt!==null)throw new D(R.INVALID_ARGUMENT,"Invalid query. You must not call endAt() or endBefore() before calling orderBy().");return new er(s,a)})(e._query,this._field,this._direction);return new $t(e.firestore,e.converter,(function(i,s){const a=i.explicitOrderBy.concat([s]);return new pn(i.path,i.collectionGroup,a,i.filters.slice(),i.limit,i.limitType,i.startAt,i.endAt)})(e._query,t))}}function Ch(n,e="asc"){const t=e,r=Mi("orderBy",n);return Jo._create(r,t)}function uu(n,e,t){if(typeof(t=re(t))=="string"){if(t==="")throw new D(R.INVALID_ARGUMENT,"Invalid query. When querying with documentId(), you must provide a valid document ID, but it was an empty string.");if(!bl(e)&&t.indexOf("/")!==-1)throw new D(R.INVALID_ARGUMENT,`Invalid query. When querying a collection by documentId(), you must provide a plain document ID, but '${t}' contains a '/' character.`);const r=e.path.child(Y.fromString(t));if(!L.isDocumentKey(r))throw new D(R.INVALID_ARGUMENT,`Invalid query. When querying a collection group by documentId(), the value provided must result in a valid document path, but '${r}' is not because it has an odd number of segments (${r.length}).`);return Nc(n,new L(r))}if(t instanceof Se)return Nc(n,t._key);throw new D(R.INVALID_ARGUMENT,`Invalid query. When querying with documentId(), you must provide a valid string or a DocumentReference, but it was: ${ki(t)}.`)}function lu(n,e){if(!Array.isArray(n)||n.length===0)throw new D(R.INVALID_ARGUMENT,`Invalid Query. A non-empty array is required for '${e.toString()}' filters.`)}function kh(n,e){const t=(function(i,s){for(const a of i)for(const u of a.getFlattenedFilters())if(s.indexOf(u.op)>=0)return u.op;return null})(n.filters,(function(i){switch(i){case"!=":return["!=","not-in"];case"array-contains-any":case"in":return["not-in"];case"not-in":return["array-contains-any","in","not-in","!="];default:return[]}})(e.op));if(t!==null)throw t===e.op?new D(R.INVALID_ARGUMENT,`Invalid query. You cannot use more than one '${e.op.toString()}' filter.`):new D(R.INVALID_ARGUMENT,`Invalid query. You cannot use '${e.op.toString()}' filters with '${t.toString()}' filters.`)}class ry{convertValue(e,t="none"){switch(Ot(e)){case 0:return null;case 1:return e.booleanValue;case 2:return ne(e.integerValue||e.doubleValue);case 3:return this.convertTimestamp(e.timestampValue);case 4:return this.convertServerTimestamp(e,t);case 5:return e.stringValue;case 6:return this.convertBytes(Vt(e.bytesValue));case 7:return this.convertReference(e.referenceValue);case 8:return this.convertGeoPoint(e.geoPointValue);case 9:return this.convertArray(e.arrayValue,t);case 11:return this.convertObject(e.mapValue,t);case 10:return this.convertVectorValue(e.mapValue);default:throw x()}}convertObject(e,t){return this.convertObjectMap(e.fields,t)}convertObjectMap(e,t="none"){const r={};return Bt(e,((i,s)=>{r[i]=this.convertValue(s,t)})),r}convertVectorValue(e){var t,r,i;const s=(i=(r=(t=e.fields)===null||t===void 0?void 0:t.value.arrayValue)===null||r===void 0?void 0:r.values)===null||i===void 0?void 0:i.map((a=>ne(a.doubleValue)));return new $o(s)}convertGeoPoint(e){return new qo(ne(e.latitude),ne(e.longitude))}convertArray(e,t){return(e.values||[]).map((r=>this.convertValue(r,t)))}convertServerTimestamp(e,t){switch(t){case"previous":const r=vo(e);return r==null?null:this.convertValue(r,t);case"estimate":return this.convertTimestamp(Yn(e));default:return null}}convertTimestamp(e){const t=_t(e);return new oe(t.seconds,t.nanos)}convertDocumentKey(e,t){const r=Y.fromString(e);G(Gl(r));const i=new Xn(r.get(1),r.get(3)),s=new L(r.popFirst(5));return i.isEqual(t)||Ze(`Document ${s} contains a document reference within a different database (${i.projectId}/${i.database}) which is not supported. It will be treated as a reference in the current database (${t.projectId}/${t.database}) instead.`),s}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function iy(n,e,t){let r;return r=n?n.toFirestore(e):e,r}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Bn{constructor(e,t){this.hasPendingWrites=e,this.fromCache=t}isEqual(e){return this.hasPendingWrites===e.hasPendingWrites&&this.fromCache===e.fromCache}}class Nh extends Rh{constructor(e,t,r,i,s,a){super(e,t,r,i,a),this._firestore=e,this._firestoreImpl=e,this.metadata=s}exists(){return super.exists()}data(e={}){if(this._document){if(this._converter){const t=new Jr(this._firestore,this._userDataWriter,this._key,this._document,this.metadata,null);return this._converter.fromFirestore(t,e)}return this._userDataWriter.convertValue(this._document.data.value,e.serverTimestamps)}}get(e,t={}){if(this._document){const r=this._document.data.field(Mi("DocumentSnapshot.get",e));if(r!==null)return this._userDataWriter.convertValue(r,t.serverTimestamps)}}}class Jr extends Nh{data(e={}){return super.data(e)}}class sy{constructor(e,t,r,i){this._firestore=e,this._userDataWriter=t,this._snapshot=i,this.metadata=new Bn(i.hasPendingWrites,i.fromCache),this.query=r}get docs(){const e=[];return this.forEach((t=>e.push(t))),e}get size(){return this._snapshot.docs.size}get empty(){return this.size===0}forEach(e,t){this._snapshot.docs.forEach((r=>{e.call(t,new Jr(this._firestore,this._userDataWriter,r.key,r,new Bn(this._snapshot.mutatedKeys.has(r.key),this._snapshot.fromCache),this.query.converter))}))}docChanges(e={}){const t=!!e.includeMetadataChanges;if(t&&this._snapshot.excludesMetadataChanges)throw new D(R.INVALID_ARGUMENT,"To include metadata changes with your document changes, you must also pass { includeMetadataChanges:true } to onSnapshot().");return this._cachedChanges&&this._cachedChangesIncludeMetadataChanges===t||(this._cachedChanges=(function(i,s){if(i._snapshot.oldDocs.isEmpty()){let a=0;return i._snapshot.docChanges.map((u=>{const l=new Jr(i._firestore,i._userDataWriter,u.doc.key,u.doc,new Bn(i._snapshot.mutatedKeys.has(u.doc.key),i._snapshot.fromCache),i.query.converter);return u.doc,{type:"added",doc:l,oldIndex:-1,newIndex:a++}}))}{let a=i._snapshot.oldDocs;return i._snapshot.docChanges.filter((u=>s||u.type!==3)).map((u=>{const l=new Jr(i._firestore,i._userDataWriter,u.doc.key,u.doc,new Bn(i._snapshot.mutatedKeys.has(u.doc.key),i._snapshot.fromCache),i.query.converter);let d=-1,p=-1;return u.type!==0&&(d=a.indexOf(u.doc.key),a=a.delete(u.doc.key)),u.type!==1&&(a=a.add(u.doc),p=a.indexOf(u.doc.key)),{type:oy(u.type),doc:l,oldIndex:d,newIndex:p}}))}})(this,t),this._cachedChangesIncludeMetadataChanges=t),this._cachedChanges}}function oy(n){switch(n){case 0:return"added";case 2:case 3:return"modified";case 1:return"removed";default:return x()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Dh(n){n=vt(n,Se);const e=vt(n.firestore,pr);return B_(Bo(e),n._key).then((t=>uy(e,n,t)))}class Vh extends ry{constructor(e){super(),this.firestore=e}convertBytes(e){return new ln(e)}convertReference(e){const t=this.convertDocumentKey(e,this.firestore._databaseId);return new Se(this.firestore,null,t)}}function Oh(n){n=vt(n,$t);const e=vt(n.firestore,pr),t=Bo(e),r=new Vh(e);return ty(n._query),q_(t,n._query).then((i=>new sy(e,r,n,i)))}function ay(n,e,t,...r){n=vt(n,Se);const i=vt(n.firestore,pr),s=zo(i);let a;return a=typeof(e=re(e))=="string"||e instanceof Vi?Y_(s,"updateDoc",n._key,e,t,r):J_(s,"updateDoc",n._key,e),Lh(i,[a.toMutation(n._key,xe.exists(!0))])}function cy(n,e){const t=vt(n.firestore,pr),r=Di(n),i=iy(n.converter,e);return Lh(t,[Q_(zo(n.firestore),"addDoc",r._key,i,n.converter!==null,{}).toMutation(r._key,xe.exists(!1))]).then((()=>r))}function Lh(n,e){return(function(r,i){const s=new Ye;return r.asyncQueue.enqueueAndForget((async()=>C_(await U_(r),i,s))),s.promise})(Bo(n),e)}function uy(n,e,t){const r=t.docs.get(e._key),i=new Vh(n);return new Nh(n,i,e._key,r,new Bn(t.hasPendingWrites,t.fromCache),e.converter)}function oo(){return new Ho("serverTimestamp")}(function(e,t=!0){(function(i){fn=i})(dn),Ve(new Ne("firestore",((r,{instanceIdentifier:i,options:s})=>{const a=r.getProvider("app").getImmediate(),u=new pr(new ag(r.getProvider("auth-internal")),new hg(r.getProvider("app-check-internal")),(function(d,p){if(!Object.prototype.hasOwnProperty.apply(d.options,["projectId"]))throw new D(R.INVALID_ARGUMENT,'"projectId" not provided in firebase.initializeApp.');return new Xn(d.options.projectId,p)})(a,i),a);return s=Object.assign({useFetchStreams:t},s),u._setSettings(s),u}),"PUBLIC").setMultipleInstances(!0)),Re(Rc,"4.7.3",e),Re(Rc,"4.7.3","esm2017")})();var ly="firebase",hy="10.14.1";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */Re(ly,hy,"app");/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const dy="type.googleapis.com/google.protobuf.Int64Value",fy="type.googleapis.com/google.protobuf.UInt64Value";function Mh(n,e){const t={};for(const r in n)n.hasOwnProperty(r)&&(t[r]=e(n[r]));return t}function ao(n){if(n==null)return null;if(n instanceof Number&&(n=n.valueOf()),typeof n=="number"&&isFinite(n)||n===!0||n===!1||Object.prototype.toString.call(n)==="[object String]")return n;if(n instanceof Date)return n.toISOString();if(Array.isArray(n))return n.map(e=>ao(e));if(typeof n=="function"||typeof n=="object")return Mh(n,e=>ao(e));throw new Error("Data cannot be encoded in JSON: "+n)}function hi(n){if(n==null)return n;if(n["@type"])switch(n["@type"]){case dy:case fy:{const e=Number(n.value);if(isNaN(e))throw new Error("Data cannot be decoded from JSON: "+n);return e}default:throw new Error("Data cannot be decoded from JSON: "+n)}return Array.isArray(n)?n.map(e=>hi(e)):typeof n=="function"||typeof n=="object"?Mh(n,e=>hi(e)):n}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Yo="functions";/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const hu={OK:"ok",CANCELLED:"cancelled",UNKNOWN:"unknown",INVALID_ARGUMENT:"invalid-argument",DEADLINE_EXCEEDED:"deadline-exceeded",NOT_FOUND:"not-found",ALREADY_EXISTS:"already-exists",PERMISSION_DENIED:"permission-denied",UNAUTHENTICATED:"unauthenticated",RESOURCE_EXHAUSTED:"resource-exhausted",FAILED_PRECONDITION:"failed-precondition",ABORTED:"aborted",OUT_OF_RANGE:"out-of-range",UNIMPLEMENTED:"unimplemented",INTERNAL:"internal",UNAVAILABLE:"unavailable",DATA_LOSS:"data-loss"};class Zt extends Le{constructor(e,t,r){super(`${Yo}/${e}`,t||""),this.details=r}}function py(n){if(n>=200&&n<300)return"ok";switch(n){case 0:return"internal";case 400:return"invalid-argument";case 401:return"unauthenticated";case 403:return"permission-denied";case 404:return"not-found";case 409:return"aborted";case 429:return"resource-exhausted";case 499:return"cancelled";case 500:return"internal";case 501:return"unimplemented";case 503:return"unavailable";case 504:return"deadline-exceeded"}return"unknown"}function gy(n,e){let t=py(n),r=t,i;try{const s=e&&e.error;if(s){const a=s.status;if(typeof a=="string"){if(!hu[a])return new Zt("internal","internal");t=hu[a],r=a}const u=s.message;typeof u=="string"&&(r=u),i=s.details,i!==void 0&&(i=hi(i))}}catch{}return t==="ok"?null:new Zt(t,r,i)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class my{constructor(e,t,r){this.auth=null,this.messaging=null,this.appCheck=null,this.auth=e.getImmediate({optional:!0}),this.messaging=t.getImmediate({optional:!0}),this.auth||e.get().then(i=>this.auth=i,()=>{}),this.messaging||t.get().then(i=>this.messaging=i,()=>{}),this.appCheck||r.get().then(i=>this.appCheck=i,()=>{})}async getAuthToken(){if(this.auth)try{const e=await this.auth.getToken();return e==null?void 0:e.accessToken}catch{return}}async getMessagingToken(){if(!(!this.messaging||!("Notification"in self)||Notification.permission!=="granted"))try{return await this.messaging.getToken()}catch{return}}async getAppCheckToken(e){if(this.appCheck){const t=e?await this.appCheck.getLimitedUseToken():await this.appCheck.getToken();return t.error?null:t.token}return null}async getContext(e){const t=await this.getAuthToken(),r=await this.getMessagingToken(),i=await this.getAppCheckToken(e);return{authToken:t,messagingToken:r,appCheckToken:i}}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const co="us-central1";function _y(n){let e=null;return{promise:new Promise((t,r)=>{e=setTimeout(()=>{r(new Zt("deadline-exceeded","deadline-exceeded"))},n)}),cancel:()=>{e&&clearTimeout(e)}}}class yy{constructor(e,t,r,i,s=co,a){this.app=e,this.fetchImpl=a,this.emulatorOrigin=null,this.contextProvider=new my(t,r,i),this.cancelAllRequests=new Promise(u=>{this.deleteService=()=>Promise.resolve(u())});try{const u=new URL(s);this.customDomain=u.origin+(u.pathname==="/"?"":u.pathname),this.region=co}catch{this.customDomain=null,this.region=s}}_delete(){return this.deleteService()}_url(e){const t=this.app.options.projectId;return this.emulatorOrigin!==null?`${this.emulatorOrigin}/${t}/${this.region}/${e}`:this.customDomain!==null?`${this.customDomain}/${e}`:`https://${this.region}-${t}.cloudfunctions.net/${e}`}}function vy(n,e,t){n.emulatorOrigin=`http://${e}:${t}`}function wy(n,e,t){return(r=>Ey(n,e,r,{}))}async function Ty(n,e,t,r){t["Content-Type"]="application/json";let i;try{i=await r(n,{method:"POST",body:JSON.stringify(e),headers:t})}catch{return{status:0,json:null}}let s=null;try{s=await i.json()}catch{}return{status:i.status,json:s}}function Ey(n,e,t,r){const i=n._url(e);return Iy(n,i,t,r)}async function Iy(n,e,t,r){t=ao(t);const i={data:t},s={},a=await n.contextProvider.getContext(r.limitedUseAppCheckTokens);a.authToken&&(s.Authorization="Bearer "+a.authToken),a.messagingToken&&(s["Firebase-Instance-ID-Token"]=a.messagingToken),a.appCheckToken!==null&&(s["X-Firebase-AppCheck"]=a.appCheckToken);const u=r.timeout||7e4,l=_y(u),d=await Promise.race([Ty(e,i,s,n.fetchImpl),l.promise,n.cancelAllRequests]);if(l.cancel(),!d)throw new Zt("cancelled","Firebase Functions instance was deleted.");const p=gy(d.status,d.json);if(p)throw p;if(!d.json)throw new Zt("internal","Response is not valid JSON object.");let v=d.json.data;if(typeof v>"u"&&(v=d.json.result),typeof v>"u")throw new Zt("internal","Response is missing data field.");return{data:hi(v)}}const du="@firebase/functions",fu="0.11.8";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ay="auth-internal",by="app-check-internal",Ry="messaging-internal";function Sy(n,e){const t=(r,{instanceIdentifier:i})=>{const s=r.getProvider("app").getImmediate(),a=r.getProvider(Ay),u=r.getProvider(Ry),l=r.getProvider(by);return new yy(s,a,u,l,i,n)};Ve(new Ne(Yo,t,"PUBLIC").setMultipleInstances(!0)),Re(du,fu,e),Re(du,fu,"esm2017")}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Py(n=wi(),e=co){const r=Ut(re(n),Yo).getImmediate({identifier:e}),i=Xu("functions");return i&&Cy(r,...i),r}function Cy(n,e,t){vy(re(n),e,t)}function xh(n,e,t){return wy(re(n),e)}Sy(fetch.bind(self));const Fh="@firebase/installations",Xo="0.6.9";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Uh=1e4,Bh=`w:${Xo}`,qh="FIS_v2",ky="https://firebaseinstallations.googleapis.com/v1",Ny=3600*1e3,Dy="installations",Vy="Installations";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Oy={"missing-app-config-values":'Missing App configuration value: "{$valueName}"',"not-registered":"Firebase Installation is not registered.","installation-not-found":"Firebase Installation not found.","request-failed":'{$requestName} request failed with error "{$serverCode} {$serverStatus}: {$serverMessage}"',"app-offline":"Could not process request. Application offline.","delete-pending-registration":"Can't delete installation while there is a pending registration request."},Lt=new Ft(Dy,Vy,Oy);function $h(n){return n instanceof Le&&n.code.includes("request-failed")}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function jh({projectId:n}){return`${ky}/projects/${n}/installations`}function zh(n){return{token:n.token,requestStatus:2,expiresIn:My(n.expiresIn),creationTime:Date.now()}}async function Hh(n,e){const r=(await e.json()).error;return Lt.create("request-failed",{requestName:n,serverCode:r.code,serverMessage:r.message,serverStatus:r.status})}function Kh({apiKey:n}){return new Headers({"Content-Type":"application/json",Accept:"application/json","x-goog-api-key":n})}function Ly(n,{refreshToken:e}){const t=Kh(n);return t.append("Authorization",xy(e)),t}async function Wh(n){const e=await n();return e.status>=500&&e.status<600?n():e}function My(n){return Number(n.replace("s","000"))}function xy(n){return`${qh} ${n}`}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Fy({appConfig:n,heartbeatServiceProvider:e},{fid:t}){const r=jh(n),i=Kh(n),s=e.getImmediate({optional:!0});if(s){const d=await s.getHeartbeatsHeader();d&&i.append("x-firebase-client",d)}const a={fid:t,authVersion:qh,appId:n.appId,sdkVersion:Bh},u={method:"POST",headers:i,body:JSON.stringify(a)},l=await Wh(()=>fetch(r,u));if(l.ok){const d=await l.json();return{fid:d.fid||t,registrationStatus:2,refreshToken:d.refreshToken,authToken:zh(d.authToken)}}else throw await Hh("Create Installation",l)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Gh(n){return new Promise(e=>{setTimeout(e,n)})}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Uy(n){return btoa(String.fromCharCode(...n)).replace(/\+/g,"-").replace(/\//g,"_")}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const By=/^[cdef][\w-]{21}$/,uo="";function qy(){try{const n=new Uint8Array(17);(self.crypto||self.msCrypto).getRandomValues(n),n[0]=112+n[0]%16;const t=$y(n);return By.test(t)?t:uo}catch{return uo}}function $y(n){return Uy(n).substr(0,22)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Fi(n){return`${n.appName}!${n.appId}`}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Qh=new Map;function Jh(n,e){const t=Fi(n);Yh(t,e),jy(t,e)}function Yh(n,e){const t=Qh.get(n);if(t)for(const r of t)r(e)}function jy(n,e){const t=zy();t&&t.postMessage({key:n,fid:e}),Hy()}let Ct=null;function zy(){return!Ct&&"BroadcastChannel"in self&&(Ct=new BroadcastChannel("[Firebase] FID Change"),Ct.onmessage=n=>{Yh(n.data.key,n.data.fid)}),Ct}function Hy(){Qh.size===0&&Ct&&(Ct.close(),Ct=null)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ky="firebase-installations-database",Wy=1,Mt="firebase-installations-store";let Rs=null;function Zo(){return Rs||(Rs=vi(Ky,Wy,{upgrade:(n,e)=>{switch(e){case 0:n.createObjectStore(Mt)}}})),Rs}async function di(n,e){const t=Fi(n),i=(await Zo()).transaction(Mt,"readwrite"),s=i.objectStore(Mt),a=await s.get(t);return await s.put(e,t),await i.done,(!a||a.fid!==e.fid)&&Jh(n,e.fid),e}async function Xh(n){const e=Fi(n),r=(await Zo()).transaction(Mt,"readwrite");await r.objectStore(Mt).delete(e),await r.done}async function Ui(n,e){const t=Fi(n),i=(await Zo()).transaction(Mt,"readwrite"),s=i.objectStore(Mt),a=await s.get(t),u=e(a);return u===void 0?await s.delete(t):await s.put(u,t),await i.done,u&&(!a||a.fid!==u.fid)&&Jh(n,u.fid),u}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function ea(n){let e;const t=await Ui(n.appConfig,r=>{const i=Gy(r),s=Qy(n,i);return e=s.registrationPromise,s.installationEntry});return t.fid===uo?{installationEntry:await e}:{installationEntry:t,registrationPromise:e}}function Gy(n){const e=n||{fid:qy(),registrationStatus:0};return Zh(e)}function Qy(n,e){if(e.registrationStatus===0){if(!navigator.onLine){const i=Promise.reject(Lt.create("app-offline"));return{installationEntry:e,registrationPromise:i}}const t={fid:e.fid,registrationStatus:1,registrationTime:Date.now()},r=Jy(n,t);return{installationEntry:t,registrationPromise:r}}else return e.registrationStatus===1?{installationEntry:e,registrationPromise:Yy(n)}:{installationEntry:e}}async function Jy(n,e){try{const t=await Fy(n,e);return di(n.appConfig,t)}catch(t){throw $h(t)&&t.customData.serverCode===409?await Xh(n.appConfig):await di(n.appConfig,{fid:e.fid,registrationStatus:0}),t}}async function Yy(n){let e=await pu(n.appConfig);for(;e.registrationStatus===1;)await Gh(100),e=await pu(n.appConfig);if(e.registrationStatus===0){const{installationEntry:t,registrationPromise:r}=await ea(n);return r||t}return e}function pu(n){return Ui(n,e=>{if(!e)throw Lt.create("installation-not-found");return Zh(e)})}function Zh(n){return Xy(n)?{fid:n.fid,registrationStatus:0}:n}function Xy(n){return n.registrationStatus===1&&n.registrationTime+Uh<Date.now()}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Zy({appConfig:n,heartbeatServiceProvider:e},t){const r=ev(n,t),i=Ly(n,t),s=e.getImmediate({optional:!0});if(s){const d=await s.getHeartbeatsHeader();d&&i.append("x-firebase-client",d)}const a={installation:{sdkVersion:Bh,appId:n.appId}},u={method:"POST",headers:i,body:JSON.stringify(a)},l=await Wh(()=>fetch(r,u));if(l.ok){const d=await l.json();return zh(d)}else throw await Hh("Generate Auth Token",l)}function ev(n,{fid:e}){return`${jh(n)}/${e}/authTokens:generate`}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function ta(n,e=!1){let t;const r=await Ui(n.appConfig,s=>{if(!ed(s))throw Lt.create("not-registered");const a=s.authToken;if(!e&&rv(a))return s;if(a.requestStatus===1)return t=tv(n,e),s;{if(!navigator.onLine)throw Lt.create("app-offline");const u=sv(s);return t=nv(n,u),u}});return t?await t:r.authToken}async function tv(n,e){let t=await gu(n.appConfig);for(;t.authToken.requestStatus===1;)await Gh(100),t=await gu(n.appConfig);const r=t.authToken;return r.requestStatus===0?ta(n,e):r}function gu(n){return Ui(n,e=>{if(!ed(e))throw Lt.create("not-registered");const t=e.authToken;return ov(t)?Object.assign(Object.assign({},e),{authToken:{requestStatus:0}}):e})}async function nv(n,e){try{const t=await Zy(n,e),r=Object.assign(Object.assign({},e),{authToken:t});return await di(n.appConfig,r),t}catch(t){if($h(t)&&(t.customData.serverCode===401||t.customData.serverCode===404))await Xh(n.appConfig);else{const r=Object.assign(Object.assign({},e),{authToken:{requestStatus:0}});await di(n.appConfig,r)}throw t}}function ed(n){return n!==void 0&&n.registrationStatus===2}function rv(n){return n.requestStatus===2&&!iv(n)}function iv(n){const e=Date.now();return e<n.creationTime||n.creationTime+n.expiresIn<e+Ny}function sv(n){const e={requestStatus:1,requestTime:Date.now()};return Object.assign(Object.assign({},n),{authToken:e})}function ov(n){return n.requestStatus===1&&n.requestTime+Uh<Date.now()}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function av(n){const e=n,{installationEntry:t,registrationPromise:r}=await ea(e);return r?r.catch(console.error):ta(e).catch(console.error),t.fid}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function cv(n,e=!1){const t=n;return await uv(t),(await ta(t,e)).token}async function uv(n){const{registrationPromise:e}=await ea(n);e&&await e}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function lv(n){if(!n||!n.options)throw Ss("App Configuration");if(!n.name)throw Ss("App Name");const e=["projectId","apiKey","appId"];for(const t of e)if(!n.options[t])throw Ss(t);return{appName:n.name,projectId:n.options.projectId,apiKey:n.options.apiKey,appId:n.options.appId}}function Ss(n){return Lt.create("missing-app-config-values",{valueName:n})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const td="installations",hv="installations-internal",dv=n=>{const e=n.getProvider("app").getImmediate(),t=lv(e),r=Ut(e,"heartbeat");return{app:e,appConfig:t,heartbeatServiceProvider:r,_delete:()=>Promise.resolve()}},fv=n=>{const e=n.getProvider("app").getImmediate(),t=Ut(e,td).getImmediate();return{getId:()=>av(t),getToken:i=>cv(t,i)}};function pv(){Ve(new Ne(td,dv,"PUBLIC")),Ve(new Ne(hv,fv,"PRIVATE"))}pv();Re(Fh,Xo);Re(Fh,Xo,"esm2017");/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const gv="/firebase-messaging-sw.js",mv="/firebase-cloud-messaging-push-scope",nd="BDOU99-h67HcA6JeFXHbSNMu7e2yNNu3RzoMj8TM4W88jITfq7ZmPvIM1Iv-4_l2LxQcYwhqby2xGpWwzjfAnG4",_v="https://fcmregistrations.googleapis.com/v1",rd="google.c.a.c_id",yv="google.c.a.c_l",vv="google.c.a.ts",wv="google.c.a.e";var mu;(function(n){n[n.DATA_MESSAGE=1]="DATA_MESSAGE",n[n.DISPLAY_NOTIFICATION=3]="DISPLAY_NOTIFICATION"})(mu||(mu={}));/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License. You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the License
 * is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the License for the specific language governing permissions and limitations under
 * the License.
 */var ir;(function(n){n.PUSH_RECEIVED="push-received",n.NOTIFICATION_CLICKED="notification-clicked"})(ir||(ir={}));/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function He(n){const e=new Uint8Array(n);return btoa(String.fromCharCode(...e)).replace(/=/g,"").replace(/\+/g,"-").replace(/\//g,"_")}function Tv(n){const e="=".repeat((4-n.length%4)%4),t=(n+e).replace(/\-/g,"+").replace(/_/g,"/"),r=atob(t),i=new Uint8Array(r.length);for(let s=0;s<r.length;++s)i[s]=r.charCodeAt(s);return i}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ps="fcm_token_details_db",Ev=5,_u="fcm_token_object_Store";async function Iv(n){if("databases"in indexedDB&&!(await indexedDB.databases()).map(s=>s.name).includes(Ps))return null;let e=null;return(await vi(Ps,Ev,{upgrade:async(r,i,s,a)=>{var u;if(i<2||!r.objectStoreNames.contains(_u))return;const l=a.objectStore(_u),d=await l.index("fcmSenderId").get(n);if(await l.clear(),!!d){if(i===2){const p=d;if(!p.auth||!p.p256dh||!p.endpoint)return;e={token:p.fcmToken,createTime:(u=p.createTime)!==null&&u!==void 0?u:Date.now(),subscriptionOptions:{auth:p.auth,p256dh:p.p256dh,endpoint:p.endpoint,swScope:p.swScope,vapidKey:typeof p.vapidKey=="string"?p.vapidKey:He(p.vapidKey)}}}else if(i===3){const p=d;e={token:p.fcmToken,createTime:p.createTime,subscriptionOptions:{auth:He(p.auth),p256dh:He(p.p256dh),endpoint:p.endpoint,swScope:p.swScope,vapidKey:He(p.vapidKey)}}}else if(i===4){const p=d;e={token:p.fcmToken,createTime:p.createTime,subscriptionOptions:{auth:He(p.auth),p256dh:He(p.p256dh),endpoint:p.endpoint,swScope:p.swScope,vapidKey:He(p.vapidKey)}}}}}})).close(),await vs(Ps),await vs("fcm_vapid_details_db"),await vs("undefined"),Av(e)?e:null}function Av(n){if(!n||!n.subscriptionOptions)return!1;const{subscriptionOptions:e}=n;return typeof n.createTime=="number"&&n.createTime>0&&typeof n.token=="string"&&n.token.length>0&&typeof e.auth=="string"&&e.auth.length>0&&typeof e.p256dh=="string"&&e.p256dh.length>0&&typeof e.endpoint=="string"&&e.endpoint.length>0&&typeof e.swScope=="string"&&e.swScope.length>0&&typeof e.vapidKey=="string"&&e.vapidKey.length>0}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const bv="firebase-messaging-database",Rv=1,sr="firebase-messaging-store";let Cs=null;function id(){return Cs||(Cs=vi(bv,Rv,{upgrade:(n,e)=>{switch(e){case 0:n.createObjectStore(sr)}}})),Cs}async function Sv(n){const e=sd(n),r=await(await id()).transaction(sr).objectStore(sr).get(e);if(r)return r;{const i=await Iv(n.appConfig.senderId);if(i)return await na(n,i),i}}async function na(n,e){const t=sd(n),i=(await id()).transaction(sr,"readwrite");return await i.objectStore(sr).put(e,t),await i.done,e}function sd({appConfig:n}){return n.appId}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Pv={"missing-app-config-values":'Missing App configuration value: "{$valueName}"',"only-available-in-window":"This method is available in a Window context.","only-available-in-sw":"This method is available in a service worker context.","permission-default":"The notification permission was not granted and dismissed instead.","permission-blocked":"The notification permission was not granted and blocked instead.","unsupported-browser":"This browser doesn't support the API's required to use the Firebase SDK.","indexed-db-unsupported":"This browser doesn't support indexedDb.open() (ex. Safari iFrame, Firefox Private Browsing, etc)","failed-service-worker-registration":"We are unable to register the default service worker. {$browserErrorMessage}","token-subscribe-failed":"A problem occurred while subscribing the user to FCM: {$errorInfo}","token-subscribe-no-token":"FCM returned no token when subscribing the user to push.","token-unsubscribe-failed":"A problem occurred while unsubscribing the user from FCM: {$errorInfo}","token-update-failed":"A problem occurred while updating the user from FCM: {$errorInfo}","token-update-no-token":"FCM returned no token when updating the user to push.","use-sw-after-get-token":"The useServiceWorker() method may only be called once and must be called before calling getToken() to ensure your service worker is used.","invalid-sw-registration":"The input to useServiceWorker() must be a ServiceWorkerRegistration.","invalid-bg-handler":"The input to setBackgroundMessageHandler() must be a function.","invalid-vapid-key":"The public VAPID key must be a string.","use-vapid-key-after-get-token":"The usePublicVapidKey() method may only be called once and must be called before calling getToken() to ensure your VAPID key is used."},Ae=new Ft("messaging","Messaging",Pv);/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Cv(n,e){const t=await ia(n),r=od(e),i={method:"POST",headers:t,body:JSON.stringify(r)};let s;try{s=await(await fetch(ra(n.appConfig),i)).json()}catch(a){throw Ae.create("token-subscribe-failed",{errorInfo:a==null?void 0:a.toString()})}if(s.error){const a=s.error.message;throw Ae.create("token-subscribe-failed",{errorInfo:a})}if(!s.token)throw Ae.create("token-subscribe-no-token");return s.token}async function kv(n,e){const t=await ia(n),r=od(e.subscriptionOptions),i={method:"PATCH",headers:t,body:JSON.stringify(r)};let s;try{s=await(await fetch(`${ra(n.appConfig)}/${e.token}`,i)).json()}catch(a){throw Ae.create("token-update-failed",{errorInfo:a==null?void 0:a.toString()})}if(s.error){const a=s.error.message;throw Ae.create("token-update-failed",{errorInfo:a})}if(!s.token)throw Ae.create("token-update-no-token");return s.token}async function Nv(n,e){const r={method:"DELETE",headers:await ia(n)};try{const s=await(await fetch(`${ra(n.appConfig)}/${e}`,r)).json();if(s.error){const a=s.error.message;throw Ae.create("token-unsubscribe-failed",{errorInfo:a})}}catch(i){throw Ae.create("token-unsubscribe-failed",{errorInfo:i==null?void 0:i.toString()})}}function ra({projectId:n}){return`${_v}/projects/${n}/registrations`}async function ia({appConfig:n,installations:e}){const t=await e.getToken();return new Headers({"Content-Type":"application/json",Accept:"application/json","x-goog-api-key":n.apiKey,"x-goog-firebase-installations-auth":`FIS ${t}`})}function od({p256dh:n,auth:e,endpoint:t,vapidKey:r}){const i={web:{endpoint:t,auth:e,p256dh:n}};return r!==nd&&(i.web.applicationPubKey=r),i}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Dv=10080*60*1e3;async function Vv(n){const e=await Lv(n.swRegistration,n.vapidKey),t={vapidKey:n.vapidKey,swScope:n.swRegistration.scope,endpoint:e.endpoint,auth:He(e.getKey("auth")),p256dh:He(e.getKey("p256dh"))},r=await Sv(n.firebaseDependencies);if(r){if(Mv(r.subscriptionOptions,t))return Date.now()>=r.createTime+Dv?Ov(n,{token:r.token,createTime:Date.now(),subscriptionOptions:t}):r.token;try{await Nv(n.firebaseDependencies,r.token)}catch(i){console.warn(i)}return yu(n.firebaseDependencies,t)}else return yu(n.firebaseDependencies,t)}async function Ov(n,e){try{const t=await kv(n.firebaseDependencies,e),r=Object.assign(Object.assign({},e),{token:t,createTime:Date.now()});return await na(n.firebaseDependencies,r),t}catch(t){throw t}}async function yu(n,e){const r={token:await Cv(n,e),createTime:Date.now(),subscriptionOptions:e};return await na(n,r),r.token}async function Lv(n,e){const t=await n.pushManager.getSubscription();return t||n.pushManager.subscribe({userVisibleOnly:!0,applicationServerKey:Tv(e)})}function Mv(n,e){const t=e.vapidKey===n.vapidKey,r=e.endpoint===n.endpoint,i=e.auth===n.auth,s=e.p256dh===n.p256dh;return t&&r&&i&&s}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function vu(n){const e={from:n.from,collapseKey:n.collapse_key,messageId:n.fcmMessageId};return xv(e,n),Fv(e,n),Uv(e,n),e}function xv(n,e){if(!e.notification)return;n.notification={};const t=e.notification.title;t&&(n.notification.title=t);const r=e.notification.body;r&&(n.notification.body=r);const i=e.notification.image;i&&(n.notification.image=i);const s=e.notification.icon;s&&(n.notification.icon=s)}function Fv(n,e){e.data&&(n.data=e.data)}function Uv(n,e){var t,r,i,s,a;if(!e.fcmOptions&&!(!((t=e.notification)===null||t===void 0)&&t.click_action))return;n.fcmOptions={};const u=(i=(r=e.fcmOptions)===null||r===void 0?void 0:r.link)!==null&&i!==void 0?i:(s=e.notification)===null||s===void 0?void 0:s.click_action;u&&(n.fcmOptions.link=u);const l=(a=e.fcmOptions)===null||a===void 0?void 0:a.analytics_label;l&&(n.fcmOptions.analyticsLabel=l)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Bv(n){return typeof n=="object"&&!!n&&rd in n}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function qv(n){if(!n||!n.options)throw ks("App Configuration Object");if(!n.name)throw ks("App Name");const e=["projectId","apiKey","appId","messagingSenderId"],{options:t}=n;for(const r of e)if(!t[r])throw ks(r);return{appName:n.name,projectId:t.projectId,apiKey:t.apiKey,appId:t.appId,senderId:t.messagingSenderId}}function ks(n){return Ae.create("missing-app-config-values",{valueName:n})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class $v{constructor(e,t,r){this.deliveryMetricsExportedToBigQueryEnabled=!1,this.onBackgroundMessageHandler=null,this.onMessageHandler=null,this.logEvents=[],this.isLogServiceStarted=!1;const i=qv(e);this.firebaseDependencies={app:e,appConfig:i,installations:t,analyticsProvider:r}}_delete(){return Promise.resolve()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function jv(n){try{n.swRegistration=await navigator.serviceWorker.register(gv,{scope:mv}),n.swRegistration.update().catch(()=>{})}catch(e){throw Ae.create("failed-service-worker-registration",{browserErrorMessage:e==null?void 0:e.message})}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function zv(n,e){if(!e&&!n.swRegistration&&await jv(n),!(!e&&n.swRegistration)){if(!(e instanceof ServiceWorkerRegistration))throw Ae.create("invalid-sw-registration");n.swRegistration=e}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Hv(n,e){e?n.vapidKey=e:n.vapidKey||(n.vapidKey=nd)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Kv(n,e){if(!navigator)throw Ae.create("only-available-in-window");if(Notification.permission==="default"&&await Notification.requestPermission(),Notification.permission!=="granted")throw Ae.create("permission-blocked");return await Hv(n,e==null?void 0:e.vapidKey),await zv(n,e==null?void 0:e.serviceWorkerRegistration),Vv(n)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Wv(n,e,t){const r=Gv(e);(await n.firebaseDependencies.analyticsProvider.get()).logEvent(r,{message_id:t[rd],message_name:t[yv],message_time:t[vv],message_device_time:Math.floor(Date.now()/1e3)})}function Gv(n){switch(n){case ir.NOTIFICATION_CLICKED:return"notification_open";case ir.PUSH_RECEIVED:return"notification_foreground";default:throw new Error}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Qv(n,e){const t=e.data;if(!t.isFirebaseMessaging)return;n.onMessageHandler&&t.messageType===ir.PUSH_RECEIVED&&(typeof n.onMessageHandler=="function"?n.onMessageHandler(vu(t)):n.onMessageHandler.next(vu(t)));const r=t.data;Bv(r)&&r[wv]==="1"&&await Wv(n,t.messageType,r)}const wu="@firebase/messaging",Tu="0.12.12";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Jv=n=>{const e=new $v(n.getProvider("app").getImmediate(),n.getProvider("installations-internal").getImmediate(),n.getProvider("analytics-internal"));return navigator.serviceWorker.addEventListener("message",t=>Qv(e,t)),e},Yv=n=>{const e=n.getProvider("messaging").getImmediate();return{getToken:r=>Kv(e,r)}};function Xv(){Ve(new Ne("messaging",Jv,"PUBLIC")),Ve(new Ne("messaging-internal",Yv,"PRIVATE")),Re(wu,Tu),Re(wu,Tu,"esm2017")}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Zv(){try{await nl()}catch{return!1}return typeof window<"u"&&tl()&&Hf()&&"serviceWorker"in navigator&&"PushManager"in window&&"Notification"in window&&"fetch"in window&&ServiceWorkerRegistration.prototype.hasOwnProperty("showNotification")&&PushSubscription.prototype.hasOwnProperty("getKey")}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ew(n=wi()){return Zv().then(e=>{if(!e)throw Ae.create("unsupported-browser")},e=>{throw Ae.create("indexed-db-unsupported")}),Ut(re(n),"messaging").getImmediate()}Xv();function sa(n,e){var t={};for(var r in n)Object.prototype.hasOwnProperty.call(n,r)&&e.indexOf(r)<0&&(t[r]=n[r]);if(n!=null&&typeof Object.getOwnPropertySymbols=="function")for(var i=0,r=Object.getOwnPropertySymbols(n);i<r.length;i++)e.indexOf(r[i])<0&&Object.prototype.propertyIsEnumerable.call(n,r[i])&&(t[r[i]]=n[r[i]]);return t}function ad(){return{"dependent-sdk-initialized-before-auth":"Another Firebase SDK was initialized and is trying to use Auth before Auth is initialized. Please be sure to call `initializeAuth` or `getAuth` before starting any other Firebase SDK."}}const tw=ad,cd=new Ft("auth","Firebase",ad());/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const fi=new po("@firebase/auth");function nw(n,...e){fi.logLevel<=q.WARN&&fi.warn(`Auth (${dn}): ${n}`,...e)}function Yr(n,...e){fi.logLevel<=q.ERROR&&fi.error(`Auth (${dn}): ${n}`,...e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function tt(n,...e){throw oa(n,...e)}function Ue(n,...e){return oa(n,...e)}function ud(n,e,t){const r=Object.assign(Object.assign({},tw()),{[e]:t});return new Ft("auth","Firebase",r).create(e,{appName:n.name})}function Nt(n){return ud(n,"operation-not-supported-in-this-environment","Operations that alter the current user are not supported in conjunction with FirebaseServerApp")}function oa(n,...e){if(typeof n!="string"){const t=e[0],r=[...e.slice(1)];return r[0]&&(r[0].appName=n.name),n._errorFactory.create(t,...r)}return cd.create(n,...e)}function M(n,e,...t){if(!n)throw oa(e,...t)}function We(n){const e="INTERNAL ASSERTION FAILED: "+n;throw Yr(e),new Error(e)}function nt(n,e){n||We(e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function lo(){var n;return typeof self<"u"&&((n=self.location)===null||n===void 0?void 0:n.href)||""}function rw(){return Eu()==="http:"||Eu()==="https:"}function Eu(){var n;return typeof self<"u"&&((n=self.location)===null||n===void 0?void 0:n.protocol)||null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function iw(){return typeof navigator<"u"&&navigator&&"onLine"in navigator&&typeof navigator.onLine=="boolean"&&(rw()||qf()||"connection"in navigator)?navigator.onLine:!0}function sw(){if(typeof navigator>"u")return null;const n=navigator;return n.languages&&n.languages[0]||n.language||null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class mr{constructor(e,t){this.shortDelay=e,this.longDelay=t,nt(t>e,"Short delay should be less than long delay!"),this.isMobile=Ff()||$f()}get(){return iw()?this.isMobile?this.longDelay:this.shortDelay:Math.min(5e3,this.shortDelay)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function aa(n,e){nt(n.emulator,"Emulator should always be set here");const{url:t}=n.emulator;return e?`${t}${e.startsWith("/")?e.slice(1):e}`:t}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ld{static initialize(e,t,r){this.fetchImpl=e,t&&(this.headersImpl=t),r&&(this.responseImpl=r)}static fetch(){if(this.fetchImpl)return this.fetchImpl;if(typeof self<"u"&&"fetch"in self)return self.fetch;if(typeof globalThis<"u"&&globalThis.fetch)return globalThis.fetch;if(typeof fetch<"u")return fetch;We("Could not find fetch implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static headers(){if(this.headersImpl)return this.headersImpl;if(typeof self<"u"&&"Headers"in self)return self.Headers;if(typeof globalThis<"u"&&globalThis.Headers)return globalThis.Headers;if(typeof Headers<"u")return Headers;We("Could not find Headers implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static response(){if(this.responseImpl)return this.responseImpl;if(typeof self<"u"&&"Response"in self)return self.Response;if(typeof globalThis<"u"&&globalThis.Response)return globalThis.Response;if(typeof Response<"u")return Response;We("Could not find Response implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ow={CREDENTIAL_MISMATCH:"custom-token-mismatch",MISSING_CUSTOM_TOKEN:"internal-error",INVALID_IDENTIFIER:"invalid-email",MISSING_CONTINUE_URI:"internal-error",INVALID_PASSWORD:"wrong-password",MISSING_PASSWORD:"missing-password",INVALID_LOGIN_CREDENTIALS:"invalid-credential",EMAIL_EXISTS:"email-already-in-use",PASSWORD_LOGIN_DISABLED:"operation-not-allowed",INVALID_IDP_RESPONSE:"invalid-credential",INVALID_PENDING_TOKEN:"invalid-credential",FEDERATED_USER_ID_ALREADY_LINKED:"credential-already-in-use",MISSING_REQ_TYPE:"internal-error",EMAIL_NOT_FOUND:"user-not-found",RESET_PASSWORD_EXCEED_LIMIT:"too-many-requests",EXPIRED_OOB_CODE:"expired-action-code",INVALID_OOB_CODE:"invalid-action-code",MISSING_OOB_CODE:"internal-error",CREDENTIAL_TOO_OLD_LOGIN_AGAIN:"requires-recent-login",INVALID_ID_TOKEN:"invalid-user-token",TOKEN_EXPIRED:"user-token-expired",USER_NOT_FOUND:"user-token-expired",TOO_MANY_ATTEMPTS_TRY_LATER:"too-many-requests",PASSWORD_DOES_NOT_MEET_REQUIREMENTS:"password-does-not-meet-requirements",INVALID_CODE:"invalid-verification-code",INVALID_SESSION_INFO:"invalid-verification-id",INVALID_TEMPORARY_PROOF:"invalid-credential",MISSING_SESSION_INFO:"missing-verification-id",SESSION_EXPIRED:"code-expired",MISSING_ANDROID_PACKAGE_NAME:"missing-android-pkg-name",UNAUTHORIZED_DOMAIN:"unauthorized-continue-uri",INVALID_OAUTH_CLIENT_ID:"invalid-oauth-client-id",ADMIN_ONLY_OPERATION:"admin-restricted-operation",INVALID_MFA_PENDING_CREDENTIAL:"invalid-multi-factor-session",MFA_ENROLLMENT_NOT_FOUND:"multi-factor-info-not-found",MISSING_MFA_ENROLLMENT_ID:"missing-multi-factor-info",MISSING_MFA_PENDING_CREDENTIAL:"missing-multi-factor-session",SECOND_FACTOR_EXISTS:"second-factor-already-in-use",SECOND_FACTOR_LIMIT_EXCEEDED:"maximum-second-factor-count-exceeded",BLOCKING_FUNCTION_ERROR_RESPONSE:"internal-error",RECAPTCHA_NOT_ENABLED:"recaptcha-not-enabled",MISSING_RECAPTCHA_TOKEN:"missing-recaptcha-token",INVALID_RECAPTCHA_TOKEN:"invalid-recaptcha-token",INVALID_RECAPTCHA_ACTION:"invalid-recaptcha-action",MISSING_CLIENT_TYPE:"missing-client-type",MISSING_RECAPTCHA_VERSION:"missing-recaptcha-version",INVALID_RECAPTCHA_VERSION:"invalid-recaptcha-version",INVALID_REQ_TYPE:"invalid-req-type"};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const aw=new mr(3e4,6e4);function ca(n,e){return n.tenantId&&!e.tenantId?Object.assign(Object.assign({},e),{tenantId:n.tenantId}):e}async function _n(n,e,t,r,i={}){return hd(n,i,async()=>{let s={},a={};r&&(e==="GET"?a=r:s={body:JSON.stringify(r)});const u=ar(Object.assign({key:n.config.apiKey},a)).slice(1),l=await n._getAdditionalHeaders();l["Content-Type"]="application/json",n.languageCode&&(l["X-Firebase-Locale"]=n.languageCode);const d=Object.assign({method:e,headers:l},s);return Bf()||(d.referrerPolicy="no-referrer"),ld.fetch()(dd(n,n.config.apiHost,t,u),d)})}async function hd(n,e,t){n._canInitEmulator=!1;const r=Object.assign(Object.assign({},ow),e);try{const i=new uw(n),s=await Promise.race([t(),i.promise]);i.clearNetworkTimeout();const a=await s.json();if("needConfirmation"in a)throw $r(n,"account-exists-with-different-credential",a);if(s.ok&&!("errorMessage"in a))return a;{const u=s.ok?a.errorMessage:a.error.message,[l,d]=u.split(" : ");if(l==="FEDERATED_USER_ID_ALREADY_LINKED")throw $r(n,"credential-already-in-use",a);if(l==="EMAIL_EXISTS")throw $r(n,"email-already-in-use",a);if(l==="USER_DISABLED")throw $r(n,"user-disabled",a);const p=r[l]||l.toLowerCase().replace(/[_\s]+/g,"-");if(d)throw ud(n,p,d);tt(n,p)}}catch(i){if(i instanceof Le)throw i;tt(n,"network-request-failed",{message:String(i)})}}async function cw(n,e,t,r,i={}){const s=await _n(n,e,t,r,i);return"mfaPendingCredential"in s&&tt(n,"multi-factor-auth-required",{_serverResponse:s}),s}function dd(n,e,t,r){const i=`${e}${t}?${r}`;return n.config.emulator?aa(n.config,i):`${n.config.apiScheme}://${i}`}class uw{constructor(e){this.auth=e,this.timer=null,this.promise=new Promise((t,r)=>{this.timer=setTimeout(()=>r(Ue(this.auth,"network-request-failed")),aw.get())})}clearNetworkTimeout(){clearTimeout(this.timer)}}function $r(n,e,t){const r={appName:n.name};t.email&&(r.email=t.email),t.phoneNumber&&(r.phoneNumber=t.phoneNumber);const i=Ue(n,e,r);return i.customData._tokenResponse=t,i}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function lw(n,e){return _n(n,"POST","/v1/accounts:delete",e)}async function fd(n,e){return _n(n,"POST","/v1/accounts:lookup",e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Hn(n){if(n)try{const e=new Date(Number(n));if(!isNaN(e.getTime()))return e.toUTCString()}catch{}}async function hw(n,e=!1){const t=re(n),r=await t.getIdToken(e),i=ua(r);M(i&&i.exp&&i.auth_time&&i.iat,t.auth,"internal-error");const s=typeof i.firebase=="object"?i.firebase:void 0,a=s==null?void 0:s.sign_in_provider;return{claims:i,token:r,authTime:Hn(Ns(i.auth_time)),issuedAtTime:Hn(Ns(i.iat)),expirationTime:Hn(Ns(i.exp)),signInProvider:a||null,signInSecondFactor:(s==null?void 0:s.sign_in_second_factor)||null}}function Ns(n){return Number(n)*1e3}function ua(n){const[e,t,r]=n.split(".");if(e===void 0||t===void 0||r===void 0)return Yr("JWT malformed, contained fewer than 3 sections"),null;try{const i=Ju(t);return i?JSON.parse(i):(Yr("Failed to decode base64 JWT payload"),null)}catch(i){return Yr("Caught error parsing JWT payload as JSON",i==null?void 0:i.toString()),null}}function Iu(n){const e=ua(n);return M(e,"internal-error"),M(typeof e.exp<"u","internal-error"),M(typeof e.iat<"u","internal-error"),Number(e.exp)-Number(e.iat)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function or(n,e,t=!1){if(t)return e;try{return await e}catch(r){throw r instanceof Le&&dw(r)&&n.auth.currentUser===n&&await n.auth.signOut(),r}}function dw({code:n}){return n==="auth/user-disabled"||n==="auth/user-token-expired"}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class fw{constructor(e){this.user=e,this.isRunning=!1,this.timerId=null,this.errorBackoff=3e4}_start(){this.isRunning||(this.isRunning=!0,this.schedule())}_stop(){this.isRunning&&(this.isRunning=!1,this.timerId!==null&&clearTimeout(this.timerId))}getInterval(e){var t;if(e){const r=this.errorBackoff;return this.errorBackoff=Math.min(this.errorBackoff*2,96e4),r}else{this.errorBackoff=3e4;const i=((t=this.user.stsTokenManager.expirationTime)!==null&&t!==void 0?t:0)-Date.now()-3e5;return Math.max(0,i)}}schedule(e=!1){if(!this.isRunning)return;const t=this.getInterval(e);this.timerId=setTimeout(async()=>{await this.iteration()},t)}async iteration(){try{await this.user.getIdToken(!0)}catch(e){(e==null?void 0:e.code)==="auth/network-request-failed"&&this.schedule(!0);return}this.schedule()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ho{constructor(e,t){this.createdAt=e,this.lastLoginAt=t,this._initializeTime()}_initializeTime(){this.lastSignInTime=Hn(this.lastLoginAt),this.creationTime=Hn(this.createdAt)}_copy(e){this.createdAt=e.createdAt,this.lastLoginAt=e.lastLoginAt,this._initializeTime()}toJSON(){return{createdAt:this.createdAt,lastLoginAt:this.lastLoginAt}}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function pi(n){var e;const t=n.auth,r=await n.getIdToken(),i=await or(n,fd(t,{idToken:r}));M(i==null?void 0:i.users.length,t,"internal-error");const s=i.users[0];n._notifyReloadListener(s);const a=!((e=s.providerUserInfo)===null||e===void 0)&&e.length?pd(s.providerUserInfo):[],u=gw(n.providerData,a),l=n.isAnonymous,d=!(n.email&&s.passwordHash)&&!(u!=null&&u.length),p=l?d:!1,v={uid:s.localId,displayName:s.displayName||null,photoURL:s.photoUrl||null,email:s.email||null,emailVerified:s.emailVerified||!1,phoneNumber:s.phoneNumber||null,tenantId:s.tenantId||null,providerData:u,metadata:new ho(s.createdAt,s.lastLoginAt),isAnonymous:p};Object.assign(n,v)}async function pw(n){const e=re(n);await pi(e),await e.auth._persistUserIfCurrent(e),e.auth._notifyListenersIfCurrent(e)}function gw(n,e){return[...n.filter(r=>!e.some(i=>i.providerId===r.providerId)),...e]}function pd(n){return n.map(e=>{var{providerId:t}=e,r=sa(e,["providerId"]);return{providerId:t,uid:r.rawId||"",displayName:r.displayName||null,email:r.email||null,phoneNumber:r.phoneNumber||null,photoURL:r.photoUrl||null}})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function mw(n,e){const t=await hd(n,{},async()=>{const r=ar({grant_type:"refresh_token",refresh_token:e}).slice(1),{tokenApiHost:i,apiKey:s}=n.config,a=dd(n,i,"/v1/token",`key=${s}`),u=await n._getAdditionalHeaders();return u["Content-Type"]="application/x-www-form-urlencoded",ld.fetch()(a,{method:"POST",headers:u,body:r})});return{accessToken:t.access_token,expiresIn:t.expires_in,refreshToken:t.refresh_token}}async function _w(n,e){return _n(n,"POST","/v2/accounts:revokeToken",ca(n,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class en{constructor(){this.refreshToken=null,this.accessToken=null,this.expirationTime=null}get isExpired(){return!this.expirationTime||Date.now()>this.expirationTime-3e4}updateFromServerResponse(e){M(e.idToken,"internal-error"),M(typeof e.idToken<"u","internal-error"),M(typeof e.refreshToken<"u","internal-error");const t="expiresIn"in e&&typeof e.expiresIn<"u"?Number(e.expiresIn):Iu(e.idToken);this.updateTokensAndExpiration(e.idToken,e.refreshToken,t)}updateFromIdToken(e){M(e.length!==0,"internal-error");const t=Iu(e);this.updateTokensAndExpiration(e,null,t)}async getToken(e,t=!1){return!t&&this.accessToken&&!this.isExpired?this.accessToken:(M(this.refreshToken,e,"user-token-expired"),this.refreshToken?(await this.refresh(e,this.refreshToken),this.accessToken):null)}clearRefreshToken(){this.refreshToken=null}async refresh(e,t){const{accessToken:r,refreshToken:i,expiresIn:s}=await mw(e,t);this.updateTokensAndExpiration(r,i,Number(s))}updateTokensAndExpiration(e,t,r){this.refreshToken=t||null,this.accessToken=e||null,this.expirationTime=Date.now()+r*1e3}static fromJSON(e,t){const{refreshToken:r,accessToken:i,expirationTime:s}=t,a=new en;return r&&(M(typeof r=="string","internal-error",{appName:e}),a.refreshToken=r),i&&(M(typeof i=="string","internal-error",{appName:e}),a.accessToken=i),s&&(M(typeof s=="number","internal-error",{appName:e}),a.expirationTime=s),a}toJSON(){return{refreshToken:this.refreshToken,accessToken:this.accessToken,expirationTime:this.expirationTime}}_assign(e){this.accessToken=e.accessToken,this.refreshToken=e.refreshToken,this.expirationTime=e.expirationTime}_clone(){return Object.assign(new en,this.toJSON())}_performRefresh(){return We("not implemented")}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function at(n,e){M(typeof n=="string"||typeof n>"u","internal-error",{appName:e})}class Ge{constructor(e){var{uid:t,auth:r,stsTokenManager:i}=e,s=sa(e,["uid","auth","stsTokenManager"]);this.providerId="firebase",this.proactiveRefresh=new fw(this),this.reloadUserInfo=null,this.reloadListener=null,this.uid=t,this.auth=r,this.stsTokenManager=i,this.accessToken=i.accessToken,this.displayName=s.displayName||null,this.email=s.email||null,this.emailVerified=s.emailVerified||!1,this.phoneNumber=s.phoneNumber||null,this.photoURL=s.photoURL||null,this.isAnonymous=s.isAnonymous||!1,this.tenantId=s.tenantId||null,this.providerData=s.providerData?[...s.providerData]:[],this.metadata=new ho(s.createdAt||void 0,s.lastLoginAt||void 0)}async getIdToken(e){const t=await or(this,this.stsTokenManager.getToken(this.auth,e));return M(t,this.auth,"internal-error"),this.accessToken!==t&&(this.accessToken=t,await this.auth._persistUserIfCurrent(this),this.auth._notifyListenersIfCurrent(this)),t}getIdTokenResult(e){return hw(this,e)}reload(){return pw(this)}_assign(e){this!==e&&(M(this.uid===e.uid,this.auth,"internal-error"),this.displayName=e.displayName,this.photoURL=e.photoURL,this.email=e.email,this.emailVerified=e.emailVerified,this.phoneNumber=e.phoneNumber,this.isAnonymous=e.isAnonymous,this.tenantId=e.tenantId,this.providerData=e.providerData.map(t=>Object.assign({},t)),this.metadata._copy(e.metadata),this.stsTokenManager._assign(e.stsTokenManager))}_clone(e){const t=new Ge(Object.assign(Object.assign({},this),{auth:e,stsTokenManager:this.stsTokenManager._clone()}));return t.metadata._copy(this.metadata),t}_onReload(e){M(!this.reloadListener,this.auth,"internal-error"),this.reloadListener=e,this.reloadUserInfo&&(this._notifyReloadListener(this.reloadUserInfo),this.reloadUserInfo=null)}_notifyReloadListener(e){this.reloadListener?this.reloadListener(e):this.reloadUserInfo=e}_startProactiveRefresh(){this.proactiveRefresh._start()}_stopProactiveRefresh(){this.proactiveRefresh._stop()}async _updateTokensIfNecessary(e,t=!1){let r=!1;e.idToken&&e.idToken!==this.stsTokenManager.accessToken&&(this.stsTokenManager.updateFromServerResponse(e),r=!0),t&&await pi(this),await this.auth._persistUserIfCurrent(this),r&&this.auth._notifyListenersIfCurrent(this)}async delete(){if(ht(this.auth.app))return Promise.reject(Nt(this.auth));const e=await this.getIdToken();return await or(this,lw(this.auth,{idToken:e})),this.stsTokenManager.clearRefreshToken(),this.auth.signOut()}toJSON(){return Object.assign(Object.assign({uid:this.uid,email:this.email||void 0,emailVerified:this.emailVerified,displayName:this.displayName||void 0,isAnonymous:this.isAnonymous,photoURL:this.photoURL||void 0,phoneNumber:this.phoneNumber||void 0,tenantId:this.tenantId||void 0,providerData:this.providerData.map(e=>Object.assign({},e)),stsTokenManager:this.stsTokenManager.toJSON(),_redirectEventId:this._redirectEventId},this.metadata.toJSON()),{apiKey:this.auth.config.apiKey,appName:this.auth.name})}get refreshToken(){return this.stsTokenManager.refreshToken||""}static _fromJSON(e,t){var r,i,s,a,u,l,d,p;const v=(r=t.displayName)!==null&&r!==void 0?r:void 0,A=(i=t.email)!==null&&i!==void 0?i:void 0,S=(s=t.phoneNumber)!==null&&s!==void 0?s:void 0,k=(a=t.photoURL)!==null&&a!==void 0?a:void 0,O=(u=t.tenantId)!==null&&u!==void 0?u:void 0,N=(l=t._redirectEventId)!==null&&l!==void 0?l:void 0,H=(d=t.createdAt)!==null&&d!==void 0?d:void 0,K=(p=t.lastLoginAt)!==null&&p!==void 0?p:void 0,{uid:W,emailVerified:ee,isAnonymous:ke,providerData:te,stsTokenManager:w}=t;M(W&&w,e,"internal-error");const g=en.fromJSON(this.name,w);M(typeof W=="string",e,"internal-error"),at(v,e.name),at(A,e.name),M(typeof ee=="boolean",e,"internal-error"),M(typeof ke=="boolean",e,"internal-error"),at(S,e.name),at(k,e.name),at(O,e.name),at(N,e.name),at(H,e.name),at(K,e.name);const _=new Ge({uid:W,auth:e,email:A,emailVerified:ee,displayName:v,isAnonymous:ke,photoURL:k,phoneNumber:S,tenantId:O,stsTokenManager:g,createdAt:H,lastLoginAt:K});return te&&Array.isArray(te)&&(_.providerData=te.map(y=>Object.assign({},y))),N&&(_._redirectEventId=N),_}static async _fromIdTokenResponse(e,t,r=!1){const i=new en;i.updateFromServerResponse(t);const s=new Ge({uid:t.localId,auth:e,stsTokenManager:i,isAnonymous:r});return await pi(s),s}static async _fromGetAccountInfoResponse(e,t,r){const i=t.users[0];M(i.localId!==void 0,"internal-error");const s=i.providerUserInfo!==void 0?pd(i.providerUserInfo):[],a=!(i.email&&i.passwordHash)&&!(s!=null&&s.length),u=new en;u.updateFromIdToken(r);const l=new Ge({uid:i.localId,auth:e,stsTokenManager:u,isAnonymous:a}),d={uid:i.localId,displayName:i.displayName||null,photoURL:i.photoUrl||null,email:i.email||null,emailVerified:i.emailVerified||!1,phoneNumber:i.phoneNumber||null,tenantId:i.tenantId||null,providerData:s,metadata:new ho(i.createdAt,i.lastLoginAt),isAnonymous:!(i.email&&i.passwordHash)&&!(s!=null&&s.length)};return Object.assign(l,d),l}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Au=new Map;function Qe(n){nt(n instanceof Function,"Expected a class definition");let e=Au.get(n);return e?(nt(e instanceof n,"Instance stored in cache mismatched with class"),e):(e=new n,Au.set(n,e),e)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class gd{constructor(){this.type="NONE",this.storage={}}async _isAvailable(){return!0}async _set(e,t){this.storage[e]=t}async _get(e){const t=this.storage[e];return t===void 0?null:t}async _remove(e){delete this.storage[e]}_addListener(e,t){}_removeListener(e,t){}}gd.type="NONE";const bu=gd;/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Xr(n,e,t){return`firebase:${n}:${e}:${t}`}class tn{constructor(e,t,r){this.persistence=e,this.auth=t,this.userKey=r;const{config:i,name:s}=this.auth;this.fullUserKey=Xr(this.userKey,i.apiKey,s),this.fullPersistenceKey=Xr("persistence",i.apiKey,s),this.boundEventHandler=t._onStorageEvent.bind(t),this.persistence._addListener(this.fullUserKey,this.boundEventHandler)}setCurrentUser(e){return this.persistence._set(this.fullUserKey,e.toJSON())}async getCurrentUser(){const e=await this.persistence._get(this.fullUserKey);return e?Ge._fromJSON(this.auth,e):null}removeCurrentUser(){return this.persistence._remove(this.fullUserKey)}savePersistenceForRedirect(){return this.persistence._set(this.fullPersistenceKey,this.persistence.type)}async setPersistence(e){if(this.persistence===e)return;const t=await this.getCurrentUser();if(await this.removeCurrentUser(),this.persistence=e,t)return this.setCurrentUser(t)}delete(){this.persistence._removeListener(this.fullUserKey,this.boundEventHandler)}static async create(e,t,r="authUser"){if(!t.length)return new tn(Qe(bu),e,r);const i=(await Promise.all(t.map(async d=>{if(await d._isAvailable())return d}))).filter(d=>d);let s=i[0]||Qe(bu);const a=Xr(r,e.config.apiKey,e.name);let u=null;for(const d of t)try{const p=await d._get(a);if(p){const v=Ge._fromJSON(e,p);d!==s&&(u=v),s=d;break}}catch{}const l=i.filter(d=>d._shouldAllowMigration);return!s._shouldAllowMigration||!l.length?new tn(s,e,r):(s=l[0],u&&await s._set(a,u.toJSON()),await Promise.all(t.map(async d=>{if(d!==s)try{await d._remove(a)}catch{}})),new tn(s,e,r))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ru(n){const e=n.toLowerCase();if(e.includes("opera/")||e.includes("opr/")||e.includes("opios/"))return"Opera";if(vd(e))return"IEMobile";if(e.includes("msie")||e.includes("trident/"))return"IE";if(e.includes("edge/"))return"Edge";if(md(e))return"Firefox";if(e.includes("silk/"))return"Silk";if(Td(e))return"Blackberry";if(Ed(e))return"Webos";if(_d(e))return"Safari";if((e.includes("chrome/")||yd(e))&&!e.includes("edge/"))return"Chrome";if(wd(e))return"Android";{const t=/([a-zA-Z\d\.]+)\/[a-zA-Z\d\.]*$/,r=n.match(t);if((r==null?void 0:r.length)===2)return r[1]}return"Other"}function md(n=Te()){return/firefox\//i.test(n)}function _d(n=Te()){const e=n.toLowerCase();return e.includes("safari/")&&!e.includes("chrome/")&&!e.includes("crios/")&&!e.includes("android")}function yd(n=Te()){return/crios\//i.test(n)}function vd(n=Te()){return/iemobile/i.test(n)}function wd(n=Te()){return/android/i.test(n)}function Td(n=Te()){return/blackberry/i.test(n)}function Ed(n=Te()){return/webos/i.test(n)}function la(n=Te()){return/iphone|ipad|ipod/i.test(n)||/macintosh/i.test(n)&&/mobile/i.test(n)}function yw(n=Te()){var e;return la(n)&&!!(!((e=window.navigator)===null||e===void 0)&&e.standalone)}function vw(){return jf()&&document.documentMode===10}function Id(n=Te()){return la(n)||wd(n)||Ed(n)||Td(n)||/windows phone/i.test(n)||vd(n)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ad(n,e=[]){let t;switch(n){case"Browser":t=Ru(Te());break;case"Worker":t=`${Ru(Te())}-${n}`;break;default:t=n}const r=e.length?e.join(","):"FirebaseCore-web";return`${t}/JsCore/${dn}/${r}`}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ww{constructor(e){this.auth=e,this.queue=[]}pushCallback(e,t){const r=s=>new Promise((a,u)=>{try{const l=e(s);a(l)}catch(l){u(l)}});r.onAbort=t,this.queue.push(r);const i=this.queue.length-1;return()=>{this.queue[i]=()=>Promise.resolve()}}async runMiddleware(e){if(this.auth.currentUser===e)return;const t=[];try{for(const r of this.queue)await r(e),r.onAbort&&t.push(r.onAbort)}catch(r){t.reverse();for(const i of t)try{i()}catch{}throw this.auth._errorFactory.create("login-blocked",{originalMessage:r==null?void 0:r.message})}}}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Tw(n,e={}){return _n(n,"GET","/v2/passwordPolicy",ca(n,e))}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ew=6;class Iw{constructor(e){var t,r,i,s;const a=e.customStrengthOptions;this.customStrengthOptions={},this.customStrengthOptions.minPasswordLength=(t=a.minPasswordLength)!==null&&t!==void 0?t:Ew,a.maxPasswordLength&&(this.customStrengthOptions.maxPasswordLength=a.maxPasswordLength),a.containsLowercaseCharacter!==void 0&&(this.customStrengthOptions.containsLowercaseLetter=a.containsLowercaseCharacter),a.containsUppercaseCharacter!==void 0&&(this.customStrengthOptions.containsUppercaseLetter=a.containsUppercaseCharacter),a.containsNumericCharacter!==void 0&&(this.customStrengthOptions.containsNumericCharacter=a.containsNumericCharacter),a.containsNonAlphanumericCharacter!==void 0&&(this.customStrengthOptions.containsNonAlphanumericCharacter=a.containsNonAlphanumericCharacter),this.enforcementState=e.enforcementState,this.enforcementState==="ENFORCEMENT_STATE_UNSPECIFIED"&&(this.enforcementState="OFF"),this.allowedNonAlphanumericCharacters=(i=(r=e.allowedNonAlphanumericCharacters)===null||r===void 0?void 0:r.join(""))!==null&&i!==void 0?i:"",this.forceUpgradeOnSignin=(s=e.forceUpgradeOnSignin)!==null&&s!==void 0?s:!1,this.schemaVersion=e.schemaVersion}validatePassword(e){var t,r,i,s,a,u;const l={isValid:!0,passwordPolicy:this};return this.validatePasswordLengthOptions(e,l),this.validatePasswordCharacterOptions(e,l),l.isValid&&(l.isValid=(t=l.meetsMinPasswordLength)!==null&&t!==void 0?t:!0),l.isValid&&(l.isValid=(r=l.meetsMaxPasswordLength)!==null&&r!==void 0?r:!0),l.isValid&&(l.isValid=(i=l.containsLowercaseLetter)!==null&&i!==void 0?i:!0),l.isValid&&(l.isValid=(s=l.containsUppercaseLetter)!==null&&s!==void 0?s:!0),l.isValid&&(l.isValid=(a=l.containsNumericCharacter)!==null&&a!==void 0?a:!0),l.isValid&&(l.isValid=(u=l.containsNonAlphanumericCharacter)!==null&&u!==void 0?u:!0),l}validatePasswordLengthOptions(e,t){const r=this.customStrengthOptions.minPasswordLength,i=this.customStrengthOptions.maxPasswordLength;r&&(t.meetsMinPasswordLength=e.length>=r),i&&(t.meetsMaxPasswordLength=e.length<=i)}validatePasswordCharacterOptions(e,t){this.updatePasswordCharacterOptionsStatuses(t,!1,!1,!1,!1);let r;for(let i=0;i<e.length;i++)r=e.charAt(i),this.updatePasswordCharacterOptionsStatuses(t,r>="a"&&r<="z",r>="A"&&r<="Z",r>="0"&&r<="9",this.allowedNonAlphanumericCharacters.includes(r))}updatePasswordCharacterOptionsStatuses(e,t,r,i,s){this.customStrengthOptions.containsLowercaseLetter&&(e.containsLowercaseLetter||(e.containsLowercaseLetter=t)),this.customStrengthOptions.containsUppercaseLetter&&(e.containsUppercaseLetter||(e.containsUppercaseLetter=r)),this.customStrengthOptions.containsNumericCharacter&&(e.containsNumericCharacter||(e.containsNumericCharacter=i)),this.customStrengthOptions.containsNonAlphanumericCharacter&&(e.containsNonAlphanumericCharacter||(e.containsNonAlphanumericCharacter=s))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Aw{constructor(e,t,r,i){this.app=e,this.heartbeatServiceProvider=t,this.appCheckServiceProvider=r,this.config=i,this.currentUser=null,this.emulatorConfig=null,this.operations=Promise.resolve(),this.authStateSubscription=new Su(this),this.idTokenSubscription=new Su(this),this.beforeStateQueue=new ww(this),this.redirectUser=null,this.isProactiveRefreshEnabled=!1,this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION=1,this._canInitEmulator=!0,this._isInitialized=!1,this._deleted=!1,this._initializationPromise=null,this._popupRedirectResolver=null,this._errorFactory=cd,this._agentRecaptchaConfig=null,this._tenantRecaptchaConfigs={},this._projectPasswordPolicy=null,this._tenantPasswordPolicies={},this.lastNotifiedUid=void 0,this.languageCode=null,this.tenantId=null,this.settings={appVerificationDisabledForTesting:!1},this.frameworks=[],this.name=e.name,this.clientVersion=i.sdkClientVersion}_initializeWithPersistence(e,t){return t&&(this._popupRedirectResolver=Qe(t)),this._initializationPromise=this.queue(async()=>{var r,i;if(!this._deleted&&(this.persistenceManager=await tn.create(this,e),!this._deleted)){if(!((r=this._popupRedirectResolver)===null||r===void 0)&&r._shouldInitProactively)try{await this._popupRedirectResolver._initialize(this)}catch{}await this.initializeCurrentUser(t),this.lastNotifiedUid=((i=this.currentUser)===null||i===void 0?void 0:i.uid)||null,!this._deleted&&(this._isInitialized=!0)}}),this._initializationPromise}async _onStorageEvent(){if(this._deleted)return;const e=await this.assertedPersistence.getCurrentUser();if(!(!this.currentUser&&!e)){if(this.currentUser&&e&&this.currentUser.uid===e.uid){this._currentUser._assign(e),await this.currentUser.getIdToken();return}await this._updateCurrentUser(e,!0)}}async initializeCurrentUserFromIdToken(e){try{const t=await fd(this,{idToken:e}),r=await Ge._fromGetAccountInfoResponse(this,t,e);await this.directlySetCurrentUser(r)}catch(t){console.warn("FirebaseServerApp could not login user with provided authIdToken: ",t),await this.directlySetCurrentUser(null)}}async initializeCurrentUser(e){var t;if(ht(this.app)){const a=this.app.settings.authIdToken;return a?new Promise(u=>{setTimeout(()=>this.initializeCurrentUserFromIdToken(a).then(u,u))}):this.directlySetCurrentUser(null)}const r=await this.assertedPersistence.getCurrentUser();let i=r,s=!1;if(e&&this.config.authDomain){await this.getOrInitRedirectPersistenceManager();const a=(t=this.redirectUser)===null||t===void 0?void 0:t._redirectEventId,u=i==null?void 0:i._redirectEventId,l=await this.tryRedirectSignIn(e);(!a||a===u)&&(l!=null&&l.user)&&(i=l.user,s=!0)}if(!i)return this.directlySetCurrentUser(null);if(!i._redirectEventId){if(s)try{await this.beforeStateQueue.runMiddleware(i)}catch(a){i=r,this._popupRedirectResolver._overrideRedirectResult(this,()=>Promise.reject(a))}return i?this.reloadAndSetCurrentUserOrClear(i):this.directlySetCurrentUser(null)}return M(this._popupRedirectResolver,this,"argument-error"),await this.getOrInitRedirectPersistenceManager(),this.redirectUser&&this.redirectUser._redirectEventId===i._redirectEventId?this.directlySetCurrentUser(i):this.reloadAndSetCurrentUserOrClear(i)}async tryRedirectSignIn(e){let t=null;try{t=await this._popupRedirectResolver._completeRedirectFn(this,e,!0)}catch{await this._setRedirectUser(null)}return t}async reloadAndSetCurrentUserOrClear(e){try{await pi(e)}catch(t){if((t==null?void 0:t.code)!=="auth/network-request-failed")return this.directlySetCurrentUser(null)}return this.directlySetCurrentUser(e)}useDeviceLanguage(){this.languageCode=sw()}async _delete(){this._deleted=!0}async updateCurrentUser(e){if(ht(this.app))return Promise.reject(Nt(this));const t=e?re(e):null;return t&&M(t.auth.config.apiKey===this.config.apiKey,this,"invalid-user-token"),this._updateCurrentUser(t&&t._clone(this))}async _updateCurrentUser(e,t=!1){if(!this._deleted)return e&&M(this.tenantId===e.tenantId,this,"tenant-id-mismatch"),t||await this.beforeStateQueue.runMiddleware(e),this.queue(async()=>{await this.directlySetCurrentUser(e),this.notifyAuthListeners()})}async signOut(){return ht(this.app)?Promise.reject(Nt(this)):(await this.beforeStateQueue.runMiddleware(null),(this.redirectPersistenceManager||this._popupRedirectResolver)&&await this._setRedirectUser(null),this._updateCurrentUser(null,!0))}setPersistence(e){return ht(this.app)?Promise.reject(Nt(this)):this.queue(async()=>{await this.assertedPersistence.setPersistence(Qe(e))})}_getRecaptchaConfig(){return this.tenantId==null?this._agentRecaptchaConfig:this._tenantRecaptchaConfigs[this.tenantId]}async validatePassword(e){this._getPasswordPolicyInternal()||await this._updatePasswordPolicy();const t=this._getPasswordPolicyInternal();return t.schemaVersion!==this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION?Promise.reject(this._errorFactory.create("unsupported-password-policy-schema-version",{})):t.validatePassword(e)}_getPasswordPolicyInternal(){return this.tenantId===null?this._projectPasswordPolicy:this._tenantPasswordPolicies[this.tenantId]}async _updatePasswordPolicy(){const e=await Tw(this),t=new Iw(e);this.tenantId===null?this._projectPasswordPolicy=t:this._tenantPasswordPolicies[this.tenantId]=t}_getPersistence(){return this.assertedPersistence.persistence.type}_updateErrorMap(e){this._errorFactory=new Ft("auth","Firebase",e())}onAuthStateChanged(e,t,r){return this.registerStateListener(this.authStateSubscription,e,t,r)}beforeAuthStateChanged(e,t){return this.beforeStateQueue.pushCallback(e,t)}onIdTokenChanged(e,t,r){return this.registerStateListener(this.idTokenSubscription,e,t,r)}authStateReady(){return new Promise((e,t)=>{if(this.currentUser)e();else{const r=this.onAuthStateChanged(()=>{r(),e()},t)}})}async revokeAccessToken(e){if(this.currentUser){const t=await this.currentUser.getIdToken(),r={providerId:"apple.com",tokenType:"ACCESS_TOKEN",token:e,idToken:t};this.tenantId!=null&&(r.tenantId=this.tenantId),await _w(this,r)}}toJSON(){var e;return{apiKey:this.config.apiKey,authDomain:this.config.authDomain,appName:this.name,currentUser:(e=this._currentUser)===null||e===void 0?void 0:e.toJSON()}}async _setRedirectUser(e,t){const r=await this.getOrInitRedirectPersistenceManager(t);return e===null?r.removeCurrentUser():r.setCurrentUser(e)}async getOrInitRedirectPersistenceManager(e){if(!this.redirectPersistenceManager){const t=e&&Qe(e)||this._popupRedirectResolver;M(t,this,"argument-error"),this.redirectPersistenceManager=await tn.create(this,[Qe(t._redirectPersistence)],"redirectUser"),this.redirectUser=await this.redirectPersistenceManager.getCurrentUser()}return this.redirectPersistenceManager}async _redirectUserForId(e){var t,r;return this._isInitialized&&await this.queue(async()=>{}),((t=this._currentUser)===null||t===void 0?void 0:t._redirectEventId)===e?this._currentUser:((r=this.redirectUser)===null||r===void 0?void 0:r._redirectEventId)===e?this.redirectUser:null}async _persistUserIfCurrent(e){if(e===this.currentUser)return this.queue(async()=>this.directlySetCurrentUser(e))}_notifyListenersIfCurrent(e){e===this.currentUser&&this.notifyAuthListeners()}_key(){return`${this.config.authDomain}:${this.config.apiKey}:${this.name}`}_startProactiveRefresh(){this.isProactiveRefreshEnabled=!0,this.currentUser&&this._currentUser._startProactiveRefresh()}_stopProactiveRefresh(){this.isProactiveRefreshEnabled=!1,this.currentUser&&this._currentUser._stopProactiveRefresh()}get _currentUser(){return this.currentUser}notifyAuthListeners(){var e,t;if(!this._isInitialized)return;this.idTokenSubscription.next(this.currentUser);const r=(t=(e=this.currentUser)===null||e===void 0?void 0:e.uid)!==null&&t!==void 0?t:null;this.lastNotifiedUid!==r&&(this.lastNotifiedUid=r,this.authStateSubscription.next(this.currentUser))}registerStateListener(e,t,r,i){if(this._deleted)return()=>{};const s=typeof t=="function"?t:t.next.bind(t);let a=!1;const u=this._isInitialized?Promise.resolve():this._initializationPromise;if(M(u,this,"internal-error"),u.then(()=>{a||s(this.currentUser)}),typeof t=="function"){const l=e.addObserver(t,r,i);return()=>{a=!0,l()}}else{const l=e.addObserver(t);return()=>{a=!0,l()}}}async directlySetCurrentUser(e){this.currentUser&&this.currentUser!==e&&this._currentUser._stopProactiveRefresh(),e&&this.isProactiveRefreshEnabled&&e._startProactiveRefresh(),this.currentUser=e,e?await this.assertedPersistence.setCurrentUser(e):await this.assertedPersistence.removeCurrentUser()}queue(e){return this.operations=this.operations.then(e,e),this.operations}get assertedPersistence(){return M(this.persistenceManager,this,"internal-error"),this.persistenceManager}_logFramework(e){!e||this.frameworks.includes(e)||(this.frameworks.push(e),this.frameworks.sort(),this.clientVersion=Ad(this.config.clientPlatform,this._getFrameworks()))}_getFrameworks(){return this.frameworks}async _getAdditionalHeaders(){var e;const t={"X-Client-Version":this.clientVersion};this.app.options.appId&&(t["X-Firebase-gmpid"]=this.app.options.appId);const r=await((e=this.heartbeatServiceProvider.getImmediate({optional:!0}))===null||e===void 0?void 0:e.getHeartbeatsHeader());r&&(t["X-Firebase-Client"]=r);const i=await this._getAppCheckToken();return i&&(t["X-Firebase-AppCheck"]=i),t}async _getAppCheckToken(){var e;const t=await((e=this.appCheckServiceProvider.getImmediate({optional:!0}))===null||e===void 0?void 0:e.getToken());return t!=null&&t.error&&nw(`Error while retrieving App Check token: ${t.error}`),t==null?void 0:t.token}}function ha(n){return re(n)}class Su{constructor(e){this.auth=e,this.observer=null,this.addObserver=Jf(t=>this.observer=t)}get next(){return M(this.observer,this.auth,"internal-error"),this.observer.next.bind(this.observer)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let da={async loadJS(){throw new Error("Unable to load external scripts")},recaptchaV2Script:"",recaptchaEnterpriseScript:"",gapiScript:""};function bw(n){da=n}function Rw(n){return da.loadJS(n)}function Sw(){return da.gapiScript}function Pw(n){return`__${n}${Math.floor(Math.random()*1e6)}`}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Cw(n,e){const t=Ut(n,"auth");if(t.isInitialized()){const i=t.getImmediate(),s=t.getOptions();if(ni(s,e??{}))return i;tt(i,"already-initialized")}return t.initialize({options:e})}function kw(n,e){const t=(e==null?void 0:e.persistence)||[],r=(Array.isArray(t)?t:[t]).map(Qe);e!=null&&e.errorMap&&n._updateErrorMap(e.errorMap),n._initializeWithPersistence(r,e==null?void 0:e.popupRedirectResolver)}function Nw(n,e,t){const r=ha(n);M(r._canInitEmulator,r,"emulator-config-failed"),M(/^https?:\/\//.test(e),r,"invalid-emulator-scheme");const i=!1,s=bd(e),{host:a,port:u}=Dw(e),l=u===null?"":`:${u}`;r.config.emulator={url:`${s}//${a}${l}/`},r.settings.appVerificationDisabledForTesting=!0,r.emulatorConfig=Object.freeze({host:a,port:u,protocol:s.replace(":",""),options:Object.freeze({disableWarnings:i})}),Vw()}function bd(n){const e=n.indexOf(":");return e<0?"":n.substr(0,e+1)}function Dw(n){const e=bd(n),t=/(\/\/)?([^?#/]+)/.exec(n.substr(e.length));if(!t)return{host:"",port:null};const r=t[2].split("@").pop()||"",i=/^(\[[^\]]+\])(:|$)/.exec(r);if(i){const s=i[1];return{host:s,port:Pu(r.substr(s.length+1))}}else{const[s,a]=r.split(":");return{host:s,port:Pu(a)}}}function Pu(n){if(!n)return null;const e=Number(n);return isNaN(e)?null:e}function Vw(){function n(){const e=document.createElement("p"),t=e.style;e.innerText="Running in emulator mode. Do not use with production credentials.",t.position="fixed",t.width="100%",t.backgroundColor="#ffffff",t.border=".1em solid #000000",t.color="#b50000",t.bottom="0px",t.left="0px",t.margin="0px",t.zIndex="10000",t.textAlign="center",e.classList.add("firebase-emulator-warning"),document.body.appendChild(e)}typeof console<"u"&&typeof console.info=="function"&&console.info("WARNING: You are using the Auth Emulator, which is intended for local testing only.  Do not use with production credentials."),typeof window<"u"&&typeof document<"u"&&(document.readyState==="loading"?window.addEventListener("DOMContentLoaded",n):n())}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Rd{constructor(e,t){this.providerId=e,this.signInMethod=t}toJSON(){return We("not implemented")}_getIdTokenResponse(e){return We("not implemented")}_linkToIdToken(e,t){return We("not implemented")}_getReauthenticationResolver(e){return We("not implemented")}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function nn(n,e){return cw(n,"POST","/v1/accounts:signInWithIdp",ca(n,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ow="http://localhost";class xt extends Rd{constructor(){super(...arguments),this.pendingToken=null}static _fromParams(e){const t=new xt(e.providerId,e.signInMethod);return e.idToken||e.accessToken?(e.idToken&&(t.idToken=e.idToken),e.accessToken&&(t.accessToken=e.accessToken),e.nonce&&!e.pendingToken&&(t.nonce=e.nonce),e.pendingToken&&(t.pendingToken=e.pendingToken)):e.oauthToken&&e.oauthTokenSecret?(t.accessToken=e.oauthToken,t.secret=e.oauthTokenSecret):tt("argument-error"),t}toJSON(){return{idToken:this.idToken,accessToken:this.accessToken,secret:this.secret,nonce:this.nonce,pendingToken:this.pendingToken,providerId:this.providerId,signInMethod:this.signInMethod}}static fromJSON(e){const t=typeof e=="string"?JSON.parse(e):e,{providerId:r,signInMethod:i}=t,s=sa(t,["providerId","signInMethod"]);if(!r||!i)return null;const a=new xt(r,i);return a.idToken=s.idToken||void 0,a.accessToken=s.accessToken||void 0,a.secret=s.secret,a.nonce=s.nonce,a.pendingToken=s.pendingToken||null,a}_getIdTokenResponse(e){const t=this.buildRequest();return nn(e,t)}_linkToIdToken(e,t){const r=this.buildRequest();return r.idToken=t,nn(e,r)}_getReauthenticationResolver(e){const t=this.buildRequest();return t.autoCreate=!1,nn(e,t)}buildRequest(){const e={requestUri:Ow,returnSecureToken:!0};if(this.pendingToken)e.pendingToken=this.pendingToken;else{const t={};this.idToken&&(t.id_token=this.idToken),this.accessToken&&(t.access_token=this.accessToken),this.secret&&(t.oauth_token_secret=this.secret),t.providerId=this.providerId,this.nonce&&!this.pendingToken&&(t.nonce=this.nonce),e.postBody=ar(t)}return e}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Sd{constructor(e){this.providerId=e,this.defaultLanguageCode=null,this.customParameters={}}setDefaultLanguage(e){this.defaultLanguageCode=e}setCustomParameters(e){return this.customParameters=e,this}getCustomParameters(){return this.customParameters}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class _r extends Sd{constructor(){super(...arguments),this.scopes=[]}addScope(e){return this.scopes.includes(e)||this.scopes.push(e),this}getScopes(){return[...this.scopes]}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ct extends _r{constructor(){super("facebook.com")}static credential(e){return xt._fromParams({providerId:ct.PROVIDER_ID,signInMethod:ct.FACEBOOK_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return ct.credentialFromTaggedObject(e)}static credentialFromError(e){return ct.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return ct.credential(e.oauthAccessToken)}catch{return null}}}ct.FACEBOOK_SIGN_IN_METHOD="facebook.com";ct.PROVIDER_ID="facebook.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ke extends _r{constructor(){super("google.com"),this.addScope("profile")}static credential(e,t){return xt._fromParams({providerId:Ke.PROVIDER_ID,signInMethod:Ke.GOOGLE_SIGN_IN_METHOD,idToken:e,accessToken:t})}static credentialFromResult(e){return Ke.credentialFromTaggedObject(e)}static credentialFromError(e){return Ke.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{oauthIdToken:t,oauthAccessToken:r}=e;if(!t&&!r)return null;try{return Ke.credential(t,r)}catch{return null}}}Ke.GOOGLE_SIGN_IN_METHOD="google.com";Ke.PROVIDER_ID="google.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ut extends _r{constructor(){super("github.com")}static credential(e){return xt._fromParams({providerId:ut.PROVIDER_ID,signInMethod:ut.GITHUB_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return ut.credentialFromTaggedObject(e)}static credentialFromError(e){return ut.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return ut.credential(e.oauthAccessToken)}catch{return null}}}ut.GITHUB_SIGN_IN_METHOD="github.com";ut.PROVIDER_ID="github.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class lt extends _r{constructor(){super("twitter.com")}static credential(e,t){return xt._fromParams({providerId:lt.PROVIDER_ID,signInMethod:lt.TWITTER_SIGN_IN_METHOD,oauthToken:e,oauthTokenSecret:t})}static credentialFromResult(e){return lt.credentialFromTaggedObject(e)}static credentialFromError(e){return lt.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{oauthAccessToken:t,oauthTokenSecret:r}=e;if(!t||!r)return null;try{return lt.credential(t,r)}catch{return null}}}lt.TWITTER_SIGN_IN_METHOD="twitter.com";lt.PROVIDER_ID="twitter.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class hn{constructor(e){this.user=e.user,this.providerId=e.providerId,this._tokenResponse=e._tokenResponse,this.operationType=e.operationType}static async _fromIdTokenResponse(e,t,r,i=!1){const s=await Ge._fromIdTokenResponse(e,r,i),a=Cu(r);return new hn({user:s,providerId:a,_tokenResponse:r,operationType:t})}static async _forOperation(e,t,r){await e._updateTokensIfNecessary(r,!0);const i=Cu(r);return new hn({user:e,providerId:i,_tokenResponse:r,operationType:t})}}function Cu(n){return n.providerId?n.providerId:"phoneNumber"in n?"phone":null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class gi extends Le{constructor(e,t,r,i){var s;super(t.code,t.message),this.operationType=r,this.user=i,Object.setPrototypeOf(this,gi.prototype),this.customData={appName:e.name,tenantId:(s=e.tenantId)!==null&&s!==void 0?s:void 0,_serverResponse:t.customData._serverResponse,operationType:r}}static _fromErrorAndOperation(e,t,r,i){return new gi(e,t,r,i)}}function Pd(n,e,t,r){return(e==="reauthenticate"?t._getReauthenticationResolver(n):t._getIdTokenResponse(n)).catch(s=>{throw s.code==="auth/multi-factor-auth-required"?gi._fromErrorAndOperation(n,s,e,r):s})}async function Lw(n,e,t=!1){const r=await or(n,e._linkToIdToken(n.auth,await n.getIdToken()),t);return hn._forOperation(n,"link",r)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Mw(n,e,t=!1){const{auth:r}=n;if(ht(r.app))return Promise.reject(Nt(r));const i="reauthenticate";try{const s=await or(n,Pd(r,i,e,n),t);M(s.idToken,r,"internal-error");const a=ua(s.idToken);M(a,r,"internal-error");const{sub:u}=a;return M(n.uid===u,r,"user-mismatch"),hn._forOperation(n,i,s)}catch(s){throw(s==null?void 0:s.code)==="auth/user-not-found"&&tt(r,"user-mismatch"),s}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function xw(n,e,t=!1){if(ht(n.app))return Promise.reject(Nt(n));const r="signIn",i=await Pd(n,r,e),s=await hn._fromIdTokenResponse(n,r,i);return t||await n._updateCurrentUser(s.user),s}function Fw(n,e,t,r){return re(n).onIdTokenChanged(e,t,r)}function Uw(n,e,t){return re(n).beforeAuthStateChanged(e,t)}function Bw(n,e,t,r){return re(n).onAuthStateChanged(e,t,r)}function qw(n){return re(n).signOut()}const mi="__sak";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Cd{constructor(e,t){this.storageRetriever=e,this.type=t}_isAvailable(){try{return this.storage?(this.storage.setItem(mi,"1"),this.storage.removeItem(mi),Promise.resolve(!0)):Promise.resolve(!1)}catch{return Promise.resolve(!1)}}_set(e,t){return this.storage.setItem(e,JSON.stringify(t)),Promise.resolve()}_get(e){const t=this.storage.getItem(e);return Promise.resolve(t?JSON.parse(t):null)}_remove(e){return this.storage.removeItem(e),Promise.resolve()}get storage(){return this.storageRetriever()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const $w=1e3,jw=10;class kd extends Cd{constructor(){super(()=>window.localStorage,"LOCAL"),this.boundEventHandler=(e,t)=>this.onStorageEvent(e,t),this.listeners={},this.localCache={},this.pollTimer=null,this.fallbackToPolling=Id(),this._shouldAllowMigration=!0}forAllChangedKeys(e){for(const t of Object.keys(this.listeners)){const r=this.storage.getItem(t),i=this.localCache[t];r!==i&&e(t,i,r)}}onStorageEvent(e,t=!1){if(!e.key){this.forAllChangedKeys((a,u,l)=>{this.notifyListeners(a,l)});return}const r=e.key;t?this.detachListener():this.stopPolling();const i=()=>{const a=this.storage.getItem(r);!t&&this.localCache[r]===a||this.notifyListeners(r,a)},s=this.storage.getItem(r);vw()&&s!==e.newValue&&e.newValue!==e.oldValue?setTimeout(i,jw):i()}notifyListeners(e,t){this.localCache[e]=t;const r=this.listeners[e];if(r)for(const i of Array.from(r))i(t&&JSON.parse(t))}startPolling(){this.stopPolling(),this.pollTimer=setInterval(()=>{this.forAllChangedKeys((e,t,r)=>{this.onStorageEvent(new StorageEvent("storage",{key:e,oldValue:t,newValue:r}),!0)})},$w)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}attachListener(){window.addEventListener("storage",this.boundEventHandler)}detachListener(){window.removeEventListener("storage",this.boundEventHandler)}_addListener(e,t){Object.keys(this.listeners).length===0&&(this.fallbackToPolling?this.startPolling():this.attachListener()),this.listeners[e]||(this.listeners[e]=new Set,this.localCache[e]=this.storage.getItem(e)),this.listeners[e].add(t)}_removeListener(e,t){this.listeners[e]&&(this.listeners[e].delete(t),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&(this.detachListener(),this.stopPolling())}async _set(e,t){await super._set(e,t),this.localCache[e]=JSON.stringify(t)}async _get(e){const t=await super._get(e);return this.localCache[e]=JSON.stringify(t),t}async _remove(e){await super._remove(e),delete this.localCache[e]}}kd.type="LOCAL";const zw=kd;/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Nd extends Cd{constructor(){super(()=>window.sessionStorage,"SESSION")}_addListener(e,t){}_removeListener(e,t){}}Nd.type="SESSION";const Dd=Nd;/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Hw(n){return Promise.all(n.map(async e=>{try{return{fulfilled:!0,value:await e}}catch(t){return{fulfilled:!1,reason:t}}}))}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Bi{constructor(e){this.eventTarget=e,this.handlersMap={},this.boundEventHandler=this.handleEvent.bind(this)}static _getInstance(e){const t=this.receivers.find(i=>i.isListeningto(e));if(t)return t;const r=new Bi(e);return this.receivers.push(r),r}isListeningto(e){return this.eventTarget===e}async handleEvent(e){const t=e,{eventId:r,eventType:i,data:s}=t.data,a=this.handlersMap[i];if(!(a!=null&&a.size))return;t.ports[0].postMessage({status:"ack",eventId:r,eventType:i});const u=Array.from(a).map(async d=>d(t.origin,s)),l=await Hw(u);t.ports[0].postMessage({status:"done",eventId:r,eventType:i,response:l})}_subscribe(e,t){Object.keys(this.handlersMap).length===0&&this.eventTarget.addEventListener("message",this.boundEventHandler),this.handlersMap[e]||(this.handlersMap[e]=new Set),this.handlersMap[e].add(t)}_unsubscribe(e,t){this.handlersMap[e]&&t&&this.handlersMap[e].delete(t),(!t||this.handlersMap[e].size===0)&&delete this.handlersMap[e],Object.keys(this.handlersMap).length===0&&this.eventTarget.removeEventListener("message",this.boundEventHandler)}}Bi.receivers=[];/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function fa(n="",e=10){let t="";for(let r=0;r<e;r++)t+=Math.floor(Math.random()*10);return n+t}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Kw{constructor(e){this.target=e,this.handlers=new Set}removeMessageHandler(e){e.messageChannel&&(e.messageChannel.port1.removeEventListener("message",e.onMessage),e.messageChannel.port1.close()),this.handlers.delete(e)}async _send(e,t,r=50){const i=typeof MessageChannel<"u"?new MessageChannel:null;if(!i)throw new Error("connection_unavailable");let s,a;return new Promise((u,l)=>{const d=fa("",20);i.port1.start();const p=setTimeout(()=>{l(new Error("unsupported_event"))},r);a={messageChannel:i,onMessage(v){const A=v;if(A.data.eventId===d)switch(A.data.status){case"ack":clearTimeout(p),s=setTimeout(()=>{l(new Error("timeout"))},3e3);break;case"done":clearTimeout(s),u(A.data.response);break;default:clearTimeout(p),clearTimeout(s),l(new Error("invalid_response"));break}}},this.handlers.add(a),i.port1.addEventListener("message",a.onMessage),this.target.postMessage({eventType:e,eventId:d,data:t},[i.port2])}).finally(()=>{a&&this.removeMessageHandler(a)})}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Be(){return window}function Ww(n){Be().location.href=n}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Vd(){return typeof Be().WorkerGlobalScope<"u"&&typeof Be().importScripts=="function"}async function Gw(){if(!(navigator!=null&&navigator.serviceWorker))return null;try{return(await navigator.serviceWorker.ready).active}catch{return null}}function Qw(){var n;return((n=navigator==null?void 0:navigator.serviceWorker)===null||n===void 0?void 0:n.controller)||null}function Jw(){return Vd()?self:null}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Od="firebaseLocalStorageDb",Yw=1,_i="firebaseLocalStorage",Ld="fbase_key";class yr{constructor(e){this.request=e}toPromise(){return new Promise((e,t)=>{this.request.addEventListener("success",()=>{e(this.request.result)}),this.request.addEventListener("error",()=>{t(this.request.error)})})}}function qi(n,e){return n.transaction([_i],e?"readwrite":"readonly").objectStore(_i)}function Xw(){const n=indexedDB.deleteDatabase(Od);return new yr(n).toPromise()}function fo(){const n=indexedDB.open(Od,Yw);return new Promise((e,t)=>{n.addEventListener("error",()=>{t(n.error)}),n.addEventListener("upgradeneeded",()=>{const r=n.result;try{r.createObjectStore(_i,{keyPath:Ld})}catch(i){t(i)}}),n.addEventListener("success",async()=>{const r=n.result;r.objectStoreNames.contains(_i)?e(r):(r.close(),await Xw(),e(await fo()))})})}async function ku(n,e,t){const r=qi(n,!0).put({[Ld]:e,value:t});return new yr(r).toPromise()}async function Zw(n,e){const t=qi(n,!1).get(e),r=await new yr(t).toPromise();return r===void 0?null:r.value}function Nu(n,e){const t=qi(n,!0).delete(e);return new yr(t).toPromise()}const eT=800,tT=3;class Md{constructor(){this.type="LOCAL",this._shouldAllowMigration=!0,this.listeners={},this.localCache={},this.pollTimer=null,this.pendingWrites=0,this.receiver=null,this.sender=null,this.serviceWorkerReceiverAvailable=!1,this.activeServiceWorker=null,this._workerInitializationPromise=this.initializeServiceWorkerMessaging().then(()=>{},()=>{})}async _openDb(){return this.db?this.db:(this.db=await fo(),this.db)}async _withRetries(e){let t=0;for(;;)try{const r=await this._openDb();return await e(r)}catch(r){if(t++>tT)throw r;this.db&&(this.db.close(),this.db=void 0)}}async initializeServiceWorkerMessaging(){return Vd()?this.initializeReceiver():this.initializeSender()}async initializeReceiver(){this.receiver=Bi._getInstance(Jw()),this.receiver._subscribe("keyChanged",async(e,t)=>({keyProcessed:(await this._poll()).includes(t.key)})),this.receiver._subscribe("ping",async(e,t)=>["keyChanged"])}async initializeSender(){var e,t;if(this.activeServiceWorker=await Gw(),!this.activeServiceWorker)return;this.sender=new Kw(this.activeServiceWorker);const r=await this.sender._send("ping",{},800);r&&!((e=r[0])===null||e===void 0)&&e.fulfilled&&!((t=r[0])===null||t===void 0)&&t.value.includes("keyChanged")&&(this.serviceWorkerReceiverAvailable=!0)}async notifyServiceWorker(e){if(!(!this.sender||!this.activeServiceWorker||Qw()!==this.activeServiceWorker))try{await this.sender._send("keyChanged",{key:e},this.serviceWorkerReceiverAvailable?800:50)}catch{}}async _isAvailable(){try{if(!indexedDB)return!1;const e=await fo();return await ku(e,mi,"1"),await Nu(e,mi),!0}catch{}return!1}async _withPendingWrite(e){this.pendingWrites++;try{await e()}finally{this.pendingWrites--}}async _set(e,t){return this._withPendingWrite(async()=>(await this._withRetries(r=>ku(r,e,t)),this.localCache[e]=t,this.notifyServiceWorker(e)))}async _get(e){const t=await this._withRetries(r=>Zw(r,e));return this.localCache[e]=t,t}async _remove(e){return this._withPendingWrite(async()=>(await this._withRetries(t=>Nu(t,e)),delete this.localCache[e],this.notifyServiceWorker(e)))}async _poll(){const e=await this._withRetries(i=>{const s=qi(i,!1).getAll();return new yr(s).toPromise()});if(!e)return[];if(this.pendingWrites!==0)return[];const t=[],r=new Set;if(e.length!==0)for(const{fbase_key:i,value:s}of e)r.add(i),JSON.stringify(this.localCache[i])!==JSON.stringify(s)&&(this.notifyListeners(i,s),t.push(i));for(const i of Object.keys(this.localCache))this.localCache[i]&&!r.has(i)&&(this.notifyListeners(i,null),t.push(i));return t}notifyListeners(e,t){this.localCache[e]=t;const r=this.listeners[e];if(r)for(const i of Array.from(r))i(t)}startPolling(){this.stopPolling(),this.pollTimer=setInterval(async()=>this._poll(),eT)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}_addListener(e,t){Object.keys(this.listeners).length===0&&this.startPolling(),this.listeners[e]||(this.listeners[e]=new Set,this._get(e)),this.listeners[e].add(t)}_removeListener(e,t){this.listeners[e]&&(this.listeners[e].delete(t),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&this.stopPolling()}}Md.type="LOCAL";const nT=Md;new mr(3e4,6e4);/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function rT(n,e){return e?Qe(e):(M(n._popupRedirectResolver,n,"argument-error"),n._popupRedirectResolver)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class pa extends Rd{constructor(e){super("custom","custom"),this.params=e}_getIdTokenResponse(e){return nn(e,this._buildIdpRequest())}_linkToIdToken(e,t){return nn(e,this._buildIdpRequest(t))}_getReauthenticationResolver(e){return nn(e,this._buildIdpRequest())}_buildIdpRequest(e){const t={requestUri:this.params.requestUri,sessionId:this.params.sessionId,postBody:this.params.postBody,tenantId:this.params.tenantId,pendingToken:this.params.pendingToken,returnSecureToken:!0,returnIdpCredential:!0};return e&&(t.idToken=e),t}}function iT(n){return xw(n.auth,new pa(n),n.bypassAuthState)}function sT(n){const{auth:e,user:t}=n;return M(t,e,"internal-error"),Mw(t,new pa(n),n.bypassAuthState)}async function oT(n){const{auth:e,user:t}=n;return M(t,e,"internal-error"),Lw(t,new pa(n),n.bypassAuthState)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class xd{constructor(e,t,r,i,s=!1){this.auth=e,this.resolver=r,this.user=i,this.bypassAuthState=s,this.pendingPromise=null,this.eventManager=null,this.filter=Array.isArray(t)?t:[t]}execute(){return new Promise(async(e,t)=>{this.pendingPromise={resolve:e,reject:t};try{this.eventManager=await this.resolver._initialize(this.auth),await this.onExecution(),this.eventManager.registerConsumer(this)}catch(r){this.reject(r)}})}async onAuthEvent(e){const{urlResponse:t,sessionId:r,postBody:i,tenantId:s,error:a,type:u}=e;if(a){this.reject(a);return}const l={auth:this.auth,requestUri:t,sessionId:r,tenantId:s||void 0,postBody:i||void 0,user:this.user,bypassAuthState:this.bypassAuthState};try{this.resolve(await this.getIdpTask(u)(l))}catch(d){this.reject(d)}}onError(e){this.reject(e)}getIdpTask(e){switch(e){case"signInViaPopup":case"signInViaRedirect":return iT;case"linkViaPopup":case"linkViaRedirect":return oT;case"reauthViaPopup":case"reauthViaRedirect":return sT;default:tt(this.auth,"internal-error")}}resolve(e){nt(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.resolve(e),this.unregisterAndCleanUp()}reject(e){nt(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.reject(e),this.unregisterAndCleanUp()}unregisterAndCleanUp(){this.eventManager&&this.eventManager.unregisterConsumer(this),this.pendingPromise=null,this.cleanUp()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const aT=new mr(2e3,1e4);class Yt extends xd{constructor(e,t,r,i,s){super(e,t,i,s),this.provider=r,this.authWindow=null,this.pollId=null,Yt.currentPopupAction&&Yt.currentPopupAction.cancel(),Yt.currentPopupAction=this}async executeNotNull(){const e=await this.execute();return M(e,this.auth,"internal-error"),e}async onExecution(){nt(this.filter.length===1,"Popup operations only handle one event");const e=fa();this.authWindow=await this.resolver._openPopup(this.auth,this.provider,this.filter[0],e),this.authWindow.associatedEvent=e,this.resolver._originValidation(this.auth).catch(t=>{this.reject(t)}),this.resolver._isIframeWebStorageSupported(this.auth,t=>{t||this.reject(Ue(this.auth,"web-storage-unsupported"))}),this.pollUserCancellation()}get eventId(){var e;return((e=this.authWindow)===null||e===void 0?void 0:e.associatedEvent)||null}cancel(){this.reject(Ue(this.auth,"cancelled-popup-request"))}cleanUp(){this.authWindow&&this.authWindow.close(),this.pollId&&window.clearTimeout(this.pollId),this.authWindow=null,this.pollId=null,Yt.currentPopupAction=null}pollUserCancellation(){const e=()=>{var t,r;if(!((r=(t=this.authWindow)===null||t===void 0?void 0:t.window)===null||r===void 0)&&r.closed){this.pollId=window.setTimeout(()=>{this.pollId=null,this.reject(Ue(this.auth,"popup-closed-by-user"))},8e3);return}this.pollId=window.setTimeout(e,aT.get())};e()}}Yt.currentPopupAction=null;/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const cT="pendingRedirect",Zr=new Map;class uT extends xd{constructor(e,t,r=!1){super(e,["signInViaRedirect","linkViaRedirect","reauthViaRedirect","unknown"],t,void 0,r),this.eventId=null}async execute(){let e=Zr.get(this.auth._key());if(!e){try{const r=await lT(this.resolver,this.auth)?await super.execute():null;e=()=>Promise.resolve(r)}catch(t){e=()=>Promise.reject(t)}Zr.set(this.auth._key(),e)}return this.bypassAuthState||Zr.set(this.auth._key(),()=>Promise.resolve(null)),e()}async onAuthEvent(e){if(e.type==="signInViaRedirect")return super.onAuthEvent(e);if(e.type==="unknown"){this.resolve(null);return}if(e.eventId){const t=await this.auth._redirectUserForId(e.eventId);if(t)return this.user=t,super.onAuthEvent(e);this.resolve(null)}}async onExecution(){}cleanUp(){}}async function lT(n,e){const t=fT(e),r=dT(n);if(!await r._isAvailable())return!1;const i=await r._get(t)==="true";return await r._remove(t),i}function hT(n,e){Zr.set(n._key(),e)}function dT(n){return Qe(n._redirectPersistence)}function fT(n){return Xr(cT,n.config.apiKey,n.name)}async function pT(n,e,t=!1){if(ht(n.app))return Promise.reject(Nt(n));const r=ha(n),i=rT(r,e),a=await new uT(r,i,t).execute();return a&&!t&&(delete a.user._redirectEventId,await r._persistUserIfCurrent(a.user),await r._setRedirectUser(null,e)),a}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const gT=600*1e3;class mT{constructor(e){this.auth=e,this.cachedEventUids=new Set,this.consumers=new Set,this.queuedRedirectEvent=null,this.hasHandledPotentialRedirect=!1,this.lastProcessedEventTime=Date.now()}registerConsumer(e){this.consumers.add(e),this.queuedRedirectEvent&&this.isEventForConsumer(this.queuedRedirectEvent,e)&&(this.sendToConsumer(this.queuedRedirectEvent,e),this.saveEventToCache(this.queuedRedirectEvent),this.queuedRedirectEvent=null)}unregisterConsumer(e){this.consumers.delete(e)}onEvent(e){if(this.hasEventBeenHandled(e))return!1;let t=!1;return this.consumers.forEach(r=>{this.isEventForConsumer(e,r)&&(t=!0,this.sendToConsumer(e,r),this.saveEventToCache(e))}),this.hasHandledPotentialRedirect||!_T(e)||(this.hasHandledPotentialRedirect=!0,t||(this.queuedRedirectEvent=e,t=!0)),t}sendToConsumer(e,t){var r;if(e.error&&!Fd(e)){const i=((r=e.error.code)===null||r===void 0?void 0:r.split("auth/")[1])||"internal-error";t.onError(Ue(this.auth,i))}else t.onAuthEvent(e)}isEventForConsumer(e,t){const r=t.eventId===null||!!e.eventId&&e.eventId===t.eventId;return t.filter.includes(e.type)&&r}hasEventBeenHandled(e){return Date.now()-this.lastProcessedEventTime>=gT&&this.cachedEventUids.clear(),this.cachedEventUids.has(Du(e))}saveEventToCache(e){this.cachedEventUids.add(Du(e)),this.lastProcessedEventTime=Date.now()}}function Du(n){return[n.type,n.eventId,n.sessionId,n.tenantId].filter(e=>e).join("-")}function Fd({type:n,error:e}){return n==="unknown"&&(e==null?void 0:e.code)==="auth/no-auth-event"}function _T(n){switch(n.type){case"signInViaRedirect":case"linkViaRedirect":case"reauthViaRedirect":return!0;case"unknown":return Fd(n);default:return!1}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function yT(n,e={}){return _n(n,"GET","/v1/projects",e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const vT=/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,wT=/^https?/;async function TT(n){if(n.config.emulator)return;const{authorizedDomains:e}=await yT(n);for(const t of e)try{if(ET(t))return}catch{}tt(n,"unauthorized-domain")}function ET(n){const e=lo(),{protocol:t,hostname:r}=new URL(e);if(n.startsWith("chrome-extension://")){const a=new URL(n);return a.hostname===""&&r===""?t==="chrome-extension:"&&n.replace("chrome-extension://","")===e.replace("chrome-extension://",""):t==="chrome-extension:"&&a.hostname===r}if(!wT.test(t))return!1;if(vT.test(n))return r===n;const i=n.replace(/\./g,"\\.");return new RegExp("^(.+\\."+i+"|"+i+")$","i").test(r)}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const IT=new mr(3e4,6e4);function Vu(){const n=Be().___jsl;if(n!=null&&n.H){for(const e of Object.keys(n.H))if(n.H[e].r=n.H[e].r||[],n.H[e].L=n.H[e].L||[],n.H[e].r=[...n.H[e].L],n.CP)for(let t=0;t<n.CP.length;t++)n.CP[t]=null}}function AT(n){return new Promise((e,t)=>{var r,i,s;function a(){Vu(),gapi.load("gapi.iframes",{callback:()=>{e(gapi.iframes.getContext())},ontimeout:()=>{Vu(),t(Ue(n,"network-request-failed"))},timeout:IT.get()})}if(!((i=(r=Be().gapi)===null||r===void 0?void 0:r.iframes)===null||i===void 0)&&i.Iframe)e(gapi.iframes.getContext());else if(!((s=Be().gapi)===null||s===void 0)&&s.load)a();else{const u=Pw("iframefcb");return Be()[u]=()=>{gapi.load?a():t(Ue(n,"network-request-failed"))},Rw(`${Sw()}?onload=${u}`).catch(l=>t(l))}}).catch(e=>{throw ei=null,e})}let ei=null;function bT(n){return ei=ei||AT(n),ei}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const RT=new mr(5e3,15e3),ST="__/auth/iframe",PT="emulator/auth/iframe",CT={style:{position:"absolute",top:"-100px",width:"1px",height:"1px"},"aria-hidden":"true",tabindex:"-1"},kT=new Map([["identitytoolkit.googleapis.com","p"],["staging-identitytoolkit.sandbox.googleapis.com","s"],["test-identitytoolkit.sandbox.googleapis.com","t"]]);function NT(n){const e=n.config;M(e.authDomain,n,"auth-domain-config-required");const t=e.emulator?aa(e,PT):`https://${n.config.authDomain}/${ST}`,r={apiKey:e.apiKey,appName:n.name,v:dn},i=kT.get(n.config.apiHost);i&&(r.eid=i);const s=n._getFrameworks();return s.length&&(r.fw=s.join(",")),`${t}?${ar(r).slice(1)}`}async function DT(n){const e=await bT(n),t=Be().gapi;return M(t,n,"internal-error"),e.open({where:document.body,url:NT(n),messageHandlersFilter:t.iframes.CROSS_ORIGIN_IFRAMES_FILTER,attributes:CT,dontclear:!0},r=>new Promise(async(i,s)=>{await r.restyle({setHideOnLeave:!1});const a=Ue(n,"network-request-failed"),u=Be().setTimeout(()=>{s(a)},RT.get());function l(){Be().clearTimeout(u),i(r)}r.ping(l).then(l,()=>{s(a)})}))}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const VT={location:"yes",resizable:"yes",statusbar:"yes",toolbar:"no"},OT=500,LT=600,MT="_blank",xT="http://localhost";class Ou{constructor(e){this.window=e,this.associatedEvent=null}close(){if(this.window)try{this.window.close()}catch{}}}function FT(n,e,t,r=OT,i=LT){const s=Math.max((window.screen.availHeight-i)/2,0).toString(),a=Math.max((window.screen.availWidth-r)/2,0).toString();let u="";const l=Object.assign(Object.assign({},VT),{width:r.toString(),height:i.toString(),top:s,left:a}),d=Te().toLowerCase();t&&(u=yd(d)?MT:t),md(d)&&(e=e||xT,l.scrollbars="yes");const p=Object.entries(l).reduce((A,[S,k])=>`${A}${S}=${k},`,"");if(yw(d)&&u!=="_self")return UT(e||"",u),new Ou(null);const v=window.open(e||"",u,p);M(v,n,"popup-blocked");try{v.focus()}catch{}return new Ou(v)}function UT(n,e){const t=document.createElement("a");t.href=n,t.target=e;const r=document.createEvent("MouseEvent");r.initMouseEvent("click",!0,!0,window,1,0,0,0,0,!1,!1,!1,!1,1,null),t.dispatchEvent(r)}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const BT="__/auth/handler",qT="emulator/auth/handler",$T=encodeURIComponent("fac");async function Lu(n,e,t,r,i,s){M(n.config.authDomain,n,"auth-domain-config-required"),M(n.config.apiKey,n,"invalid-api-key");const a={apiKey:n.config.apiKey,appName:n.name,authType:t,redirectUrl:r,v:dn,eventId:i};if(e instanceof Sd){e.setDefaultLanguage(n.languageCode),a.providerId=e.providerId||"",Qf(e.getCustomParameters())||(a.customParameters=JSON.stringify(e.getCustomParameters()));for(const[p,v]of Object.entries({}))a[p]=v}if(e instanceof _r){const p=e.getScopes().filter(v=>v!=="");p.length>0&&(a.scopes=p.join(","))}n.tenantId&&(a.tid=n.tenantId);const u=a;for(const p of Object.keys(u))u[p]===void 0&&delete u[p];const l=await n._getAppCheckToken(),d=l?`#${$T}=${encodeURIComponent(l)}`:"";return`${jT(n)}?${ar(u).slice(1)}${d}`}function jT({config:n}){return n.emulator?aa(n,qT):`https://${n.authDomain}/${BT}`}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ds="webStorageSupport";class zT{constructor(){this.eventManagers={},this.iframes={},this.originValidationPromises={},this._redirectPersistence=Dd,this._completeRedirectFn=pT,this._overrideRedirectResult=hT}async _openPopup(e,t,r,i){var s;nt((s=this.eventManagers[e._key()])===null||s===void 0?void 0:s.manager,"_initialize() not called before _openPopup()");const a=await Lu(e,t,r,lo(),i);return FT(e,a,fa())}async _openRedirect(e,t,r,i){await this._originValidation(e);const s=await Lu(e,t,r,lo(),i);return Ww(s),new Promise(()=>{})}_initialize(e){const t=e._key();if(this.eventManagers[t]){const{manager:i,promise:s}=this.eventManagers[t];return i?Promise.resolve(i):(nt(s,"If manager is not set, promise should be"),s)}const r=this.initAndGetManager(e);return this.eventManagers[t]={promise:r},r.catch(()=>{delete this.eventManagers[t]}),r}async initAndGetManager(e){const t=await DT(e),r=new mT(e);return t.register("authEvent",i=>(M(i==null?void 0:i.authEvent,e,"invalid-auth-event"),{status:r.onEvent(i.authEvent)?"ACK":"ERROR"}),gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER),this.eventManagers[e._key()]={manager:r},this.iframes[e._key()]=t,r}_isIframeWebStorageSupported(e,t){this.iframes[e._key()].send(Ds,{type:Ds},i=>{var s;const a=(s=i==null?void 0:i[0])===null||s===void 0?void 0:s[Ds];a!==void 0&&t(!!a),tt(e,"internal-error")},gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER)}_originValidation(e){const t=e._key();return this.originValidationPromises[t]||(this.originValidationPromises[t]=TT(e)),this.originValidationPromises[t]}get _shouldInitProactively(){return Id()||_d()||la()}}const HT=zT;var Mu="@firebase/auth",xu="1.7.9";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class KT{constructor(e){this.auth=e,this.internalListeners=new Map}getUid(){var e;return this.assertAuthConfigured(),((e=this.auth.currentUser)===null||e===void 0?void 0:e.uid)||null}async getToken(e){return this.assertAuthConfigured(),await this.auth._initializationPromise,this.auth.currentUser?{accessToken:await this.auth.currentUser.getIdToken(e)}:null}addAuthTokenListener(e){if(this.assertAuthConfigured(),this.internalListeners.has(e))return;const t=this.auth.onIdTokenChanged(r=>{e((r==null?void 0:r.stsTokenManager.accessToken)||null)});this.internalListeners.set(e,t),this.updateProactiveRefresh()}removeAuthTokenListener(e){this.assertAuthConfigured();const t=this.internalListeners.get(e);t&&(this.internalListeners.delete(e),t(),this.updateProactiveRefresh())}assertAuthConfigured(){M(this.auth._initializationPromise,"dependent-sdk-initialized-before-auth")}updateProactiveRefresh(){this.internalListeners.size>0?this.auth._startProactiveRefresh():this.auth._stopProactiveRefresh()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function WT(n){switch(n){case"Node":return"node";case"ReactNative":return"rn";case"Worker":return"webworker";case"Cordova":return"cordova";case"WebExtension":return"web-extension";default:return}}function GT(n){Ve(new Ne("auth",(e,{options:t})=>{const r=e.getProvider("app").getImmediate(),i=e.getProvider("heartbeat"),s=e.getProvider("app-check-internal"),{apiKey:a,authDomain:u}=r.options;M(a&&!a.includes(":"),"invalid-api-key",{appName:r.name});const l={apiKey:a,authDomain:u,clientPlatform:n,apiHost:"identitytoolkit.googleapis.com",tokenApiHost:"securetoken.googleapis.com",apiScheme:"https",sdkClientVersion:Ad(n)},d=new Aw(r,i,s,l);return kw(d,t),d},"PUBLIC").setInstantiationMode("EXPLICIT").setInstanceCreatedCallback((e,t,r)=>{e.getProvider("auth-internal").initialize()})),Ve(new Ne("auth-internal",e=>{const t=ha(e.getProvider("auth").getImmediate());return(r=>new KT(r))(t)},"PRIVATE").setInstantiationMode("EXPLICIT")),Re(Mu,xu,WT(n)),Re(Mu,xu,"esm2017")}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const QT=300,JT=el("authIdTokenMaxAge")||QT;let Fu=null;const YT=n=>async e=>{const t=e&&await e.getIdTokenResult(),r=t&&(new Date().getTime()-Date.parse(t.issuedAtTime))/1e3;if(r&&r>JT)return;const i=t==null?void 0:t.token;Fu!==i&&(Fu=i,await fetch(n,{method:i?"POST":"DELETE",headers:i?{Authorization:`Bearer ${i}`}:{}}))};function XT(n=wi()){const e=Ut(n,"auth");if(e.isInitialized())return e.getImmediate();const t=Cw(n,{popupRedirectResolver:HT,persistence:[nT,zw,Dd]}),r=el("authTokenSyncURL");if(r&&typeof isSecureContext=="boolean"&&isSecureContext){const s=new URL(r,location.origin);if(location.origin===s.origin){const a=YT(s.toString());Uw(t,a,()=>a(t.currentUser)),Fw(t,u=>a(u))}}const i=Yu("auth");return i&&Nw(t,`http://${i}`),t}function ZT(){var n,e;return(e=(n=document.getElementsByTagName("head"))===null||n===void 0?void 0:n[0])!==null&&e!==void 0?e:document}bw({loadJS(n){return new Promise((e,t)=>{const r=document.createElement("script");r.setAttribute("src",n),r.onload=e,r.onerror=i=>{const s=Ue("internal-error");s.customData=i,t(s)},r.type="text/javascript",r.charset="UTF-8",ZT().appendChild(r)})},gapiScript:"https://apis.google.com/js/api.js",recaptchaV2Script:"https://www.google.com/recaptcha/api.js",recaptchaEnterpriseScript:"https://www.google.com/recaptcha/enterprise.js?render="});GT("Browser");const eE={apiKey:"AIzaSyDEgXj63A1Ut0ldXLJmM9QRmtGeh66KAmw",authDomain:"littiwale-90990.firebaseapp.com",projectId:"littiwale-90990",storageBucket:"littiwale-90990.firebasestorage.app",messagingSenderId:"937555170322",appId:"1:937555170322:web:c31008dac8833c308eb4cb",measurementId:"G-CRSQF7SR49"},$i=sl(eE),yn=z_($i),Ud=Py($i);ew($i);const Bd=XT($i);console.log("🔥 Firebase Connected");const tE=async()=>{try{const n=Uo(yn,"menu"),e=Ph(n,Ch("category"));return(await Oh(e)).docs.map(r=>({id:r.id,...r.data()}))}catch(n){throw console.error("Error fetching menu items:",n),n}};let he=[];const nE=()=>{const n=localStorage.getItem("littiwale_cart");if(n)try{he=JSON.parse(n)}catch(e){console.error("Failed to parse cart from localStorage",e),he=[]}},ji=()=>{localStorage.setItem("littiwale_cart",JSON.stringify(he)),window.dispatchEvent(new CustomEvent("cart-updated",{detail:{cart:he}}))},zi=()=>[...he],qd=(n,e="single",t)=>{const r=`${n.id}_${e}`,i=he.findIndex(s=>s.cartKey===r);i>-1?he[i].quantity+=1:he.push({cartKey:r,id:n.id,name:n.name,category:n.category,variant:e,price:t,image:n.image,veg:n.veg,quantity:1}),ji()},rE=n=>{const e=he.findIndex(t=>t.cartKey===n);e>-1&&(he[e].quantity>1?he[e].quantity-=1:he.splice(e,1),ji())},iE=n=>{he=he.filter(e=>e.cartKey!==n),ji()},$d=()=>{he=[],ji()},Hi=()=>he.reduce((n,e)=>n+e.price*e.quantity,0),sE=()=>he.reduce((n,e)=>n+e.quantity,0);nE();const oE=(n,e)=>{if(!n)return;const t=e.reduce((i,s)=>(s.available===!1||(i[s.category]||(i[s.category]=[]),i[s.category].push(s)),i),{}),r=Object.keys(t).sort();aE(r,n,t,e),jd(n,t,e),uE(n,e)},aE=(n,e,t,r)=>{const i=document.querySelector("#category-tabs");i&&(i.innerHTML=`
        <button class="category-tab active" data-category="all">All Items</button>
        ${n.map(s=>`<button class="category-tab" data-category="${s}">${s}</button>`).join("")}
    `,i.querySelectorAll(".category-tab").forEach(s=>{s.addEventListener("click",()=>{i.querySelectorAll(".category-tab").forEach(u=>u.classList.remove("active")),s.classList.add("active");const a=s.getAttribute("data-category");a==="all"?jd(e,t,r):zd(e,a,t[a])})}))},jd=(n,e,t)=>{n.innerHTML="",Object.keys(e).sort().forEach(i=>{zd(n,i,e[i],t,!0)})},zd=(n,e,t,r,i=!1)=>{i||(n.innerHTML="");const s=document.createElement("div");s.className="col-span-full mt-12 mb-6 animate-fade-in",s.innerHTML=`
        <h2 class="text-3xl font-black mb-8 flex items-center">
            <span class="h-8 w-1.5 bg-accent rounded-full mr-4"></span>
            ${e}
        </h2>
        <div class="grid grid-products">
            ${t.map(a=>cE(a)).join("")}
        </div>
    `,n.appendChild(s)},cE=n=>{const e=n.hasVariants&&n.variants.length>0,t=e?n.variants[0]:null,r=t?t.price:n.price,i=n.image||"/images/logo.png";return`
        <div class="menu-card rounded-3xl overflow-hidden flex flex-col h-full group" data-id="${n.id}">
            <div class="relative h-64 md:h-72 overflow-hidden">
                <img 
                    src="${i}" 
                    alt="${n.name}" 
                    loading="lazy"
                    class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    onerror="this.src='/images/menu-litti.jpg'"
                />
                <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                ${n.bestseller?`
                    <span class="absolute top-4 left-4 bg-accent text-black text-[10px] font-black px-3 py-1.5 rounded-full shadow-xl uppercase tracking-widest">
                        Bestseller
                    </span>
                `:""}
                
                <div class="absolute top-4 right-4 h-4 w-4 rounded-full border-2 border-white/20 shadow-lg ${n.veg?"bg-success":"bg-error"}" title="${n.veg?"Veg":"Non-Veg"}"></div>
                
                <div class="absolute bottom-4 left-4 right-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                    <p class="text-[10px] text-gray-300 font-medium line-clamp-2">${n.description||"Authentic flavors prepared with fresh ingredients."}</p>
                </div>
            </div>
            
            <div class="p-6 flex flex-col flex-grow bg-secondary">
                <div class="mb-4">
                    <h3 class="text-xl font-bold mb-1 group-hover:text-accent transition-colors">${n.name}</h3>
                    <span class="text-accent font-black text-2xl item-price">₹${r}</span>
                </div>

                ${e?`
                    <div class="flex space-x-2 mb-6">
                        ${n.variants.map((s,a)=>`
                            <button 
                                class="variant-btn flex-1 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl border-2 transition-all ${a===0?"bg-accent text-black border-accent active-variant":"border-gray-800 text-gray-500 hover:border-accent/40 hover:text-gray-300"}"
                                data-price="${s.price}"
                                data-type="${s.type.toLowerCase()}"
                            >
                                ${s.type}
                            </button>
                        `).join("")}
                    </div>
                `:""}

                <button class="add-to-cart-btn btn-primary w-full py-4 rounded-2xl flex items-center justify-center space-x-3 mt-auto">
                    <span class="uppercase tracking-widest text-xs font-black">Add to Cart</span>
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 100-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                    </svg>
                </button>
            </div>
        </div>
    `},uE=(n,e)=>{n.addEventListener("click",t=>{const r=t.target;if(r.classList.contains("variant-btn")){const s=r.closest(".menu-card"),a=s.querySelector(".item-price");s.querySelectorAll(".variant-btn").forEach(d=>{d.classList.remove("bg-accent","text-black","border-accent","active-variant"),d.classList.add("border-gray-800","text-gray-500")}),r.classList.add("bg-accent","text-black","border-accent","active-variant"),r.classList.remove("border-gray-800","text-gray-500");const l=r.getAttribute("data-price");a.textContent=`₹${l}`}const i=lE(t.target,".add-to-cart-btn");if(i){const s=i.closest(".menu-card"),a=s.getAttribute("data-id"),u=e.find(l=>l.id===a);if(u){const l=s.querySelector(".variant-btn.active-variant"),d=l?l.getAttribute("data-type"):"single",p=l?parseInt(l.getAttribute("data-price")):u.price;qd(u,d,p);const v=i.innerHTML;i.innerHTML='<span class="uppercase tracking-widest text-xs font-black">Success! ✅</span>',i.style.background="var(--success)",setTimeout(()=>{i.innerHTML=v,i.style.background=""},1e3)}}})},lE=(n,e)=>n.matches(e)?n:n.closest(e),Vs=document.querySelector("#cart-items"),Uu=document.querySelector("#cart-total"),jr=document.querySelector("#cart-tally"),Hd=()=>{hE(),dE()},hE=()=>{if(!Vs)return;const n=zi();if(n.length===0){Vs.innerHTML=`
            <div class="text-center py-12 text-gray-500">
                <p class="text-lg">Your cart is empty.</p>
                <p class="text-sm mt-2">Add some delicious litti to get started!</p>
            </div>
        `,Uu.textContent="₹0";return}Vs.innerHTML=n.map(e=>`
        <div class="flex items-center space-x-4 bg-secondary p-5 rounded-[24px] border border-white/5 group animate-fade-in">
            <div class="h-20 w-20 rounded-2xl overflow-hidden flex-shrink-0 shadow-lg">
                <img src="${e.image||"/images/logo.png"}" alt="${e.name}" class="h-full w-full object-cover transition-transform group-hover:scale-110"/>
            </div>
            
            <div class="flex-grow">
                <div class="flex justify-between items-start mb-1">
                    <div>
                        <h4 class="font-bold text-base leading-tight">${e.name}</h4>
                        <p class="text-[10px] text-accent uppercase font-black tracking-widest mt-1">${e.variant}</p>
                    </div>
                    <button class="delete-item text-gray-600 hover:text-error transition-colors text-xl font-light" data-key="${e.cartKey}">
                        &times;
                    </button>
                </div>
                
                <div class="flex justify-between items-center mt-4">
                    <div class="flex items-center bg-primary rounded-xl p-1 border border-gray-800">
                        <button class="qty-btn minus w-8 h-8 flex items-center justify-center hover:text-accent font-bold" data-key="${e.cartKey}">-</button>
                        <span class="px-2 text-sm font-black min-w-[1.5rem] text-center">${e.quantity}</span>
                        <button class="qty-btn plus w-8 h-8 flex items-center justify-center hover:text-accent font-bold" data-key="${e.cartKey}">+</button>
                    </div>
                    <span class="font-black text-lg">₹${e.price*e.quantity}</span>
                </div>
            </div>
        </div>
    `).join(""),Uu.textContent=`₹${Hi()}`},dE=()=>{if(!jr)return;const n=sE();jr.textContent=`Cart (${n})`,jr.classList.add("scale-110","bg-white"),setTimeout(()=>{jr.classList.remove("scale-110","bg-white")},200)};document.addEventListener("click",n=>{const e=n.target;if(e.classList.contains("plus")){const t=e.getAttribute("data-key"),i=zi().find(s=>s.cartKey===t);i&&qd(i,i.variant,i.price)}if(e.classList.contains("minus")){const t=e.getAttribute("data-key");rE(t)}if(e.classList.contains("delete-item")){const t=e.getAttribute("data-key");iE(t)}});window.addEventListener("cart-updated",Hd);const fE=()=>{const e=new Date().toISOString().split("T")[0].replace(/-/g,""),t=Math.random().toString(36).substring(2,6).toUpperCase();return`LW-${e}-${t}`},pE=async n=>{try{for(const e of n){const t=Di(yn,"menu",e.id),r=await Dh(t);if(!r.exists())return{isValid:!1,error:`Item "${e.name}" no longer exists in our menu.`};const i=r.data();if(i.available===!1)return{isValid:!1,error:`Sorry, "${e.name}" is currently out of stock.`};let s;if(e.variant==="single")s=i.price;else{const a=i.variants.find(u=>u.type===e.variant);if(!a)return{isValid:!1,error:`Invalid variant "${e.variant}" for ${e.name}.`};s=a.price}if(s!==e.price)return{isValid:!1,error:`Price mismatch for "${e.name}". Please refresh your cart.`}}return{isValid:!0}}catch(e){return console.error("Validation error:",e),{isValid:!1,error:"Internal validation failed. Please try again."}}},gE=async n=>{try{const e=fE(),t=n.paymentMethod==="COD"?"PLACED":"AWAITING_PAYMENT",r={...n,orderId:e,status:t,paymentStatus:"pending",createdAt:oo(),updatedAt:oo()},i=Uo(yn,"orders"),s=await cy(i,r);return{success:!0,orderId:e,docId:s.id}}catch(e){throw console.error("Error placing order:",e),e}},mE=async(n,e)=>{try{const t=Di(yn,"orders",n);return await ay(t,{...e,updatedAt:oo()}),{success:!0}}catch(t){throw console.error("Error updating order:",t),t}};new Ke;const Bu=async()=>{try{await qw(Bd)}catch(n){throw console.error("Logout failed:",n),n}},_E=async n=>{const e=Di(yn,"users",n),t=await Dh(e);return t.exists()?t.data():null},yE=n=>Bw(Bd,async e=>{if(e){const t=await _E(e.uid);n({...e,profile:t})}else n(null)}),Os=document.querySelector("#checkout-modal"),Kd=document.querySelector("#checkout-form"),vE=document.querySelector("#checkout-amount"),qu=document.querySelector("#close-checkout"),$u=document.querySelector("#checkout-btn"),wE=document.querySelector("#cart-modal"),Kn=document.querySelector("#checkout-error"),gt=document.querySelector("#place-order-btn"),TE=()=>{!$u||!Os||!qu||($u.addEventListener("click",()=>{if(zi().length===0){alert("Your cart is empty!");return}wE.classList.add("hidden"),Os.classList.remove("hidden"),vE.textContent=Hi()}),qu.addEventListener("click",()=>{Os.classList.add("hidden")}),Kd.addEventListener("submit",EE))},EE=async n=>{n.preventDefault(),gt.disabled=!0;const e=gt.innerHTML;gt.textContent="Processing...",SE();try{const r=new FormData(Kd).get("payment-method"),i={name:document.querySelector("#cust-name").value.trim(),phone:RE(document.querySelector("#cust-phone").value),address:document.querySelector("#cust-address").value.trim(),paymentMethod:r};if(i.phone.length!==10){Gn("Please enter a valid 10-digit phone number."),Wn(e);return}const s=zi(),a=Hi(),u=await pE(s);if(!u.isValid){Gn(u.error),Wn(e);return}const l={customer:i,items:s,total:a,paymentMethod:r},{success:d,orderId:p,docId:v}=await gE(l);if(!d)throw new Error("Failed to create order entry");r==="COD"?await IE(p):await AE(p,v,a,i)}catch(t){console.error("Checkout failed:",t),Gn(t.message||"An unexpected error occurred. Please try again."),Wn(e)}},IE=async n=>{$d(),window.location.href=`/track.html?id=${n}`},AE=async(n,e,t,r)=>{try{const s=await xh(Ud,"createRazorpayOrder")({amount:t,receipt:n});if(!s.data.success)throw new Error("Razorpay order creation failed");const a=s.data.orderId,u={key:"rzp_test_placeholder",amount:t*100,currency:"INR",name:"Littiwale",description:`Order ${n}`,image:"/images/logo.png",order_id:a,handler:async d=>{await bE(d,n,e)},prefill:{name:r.name,contact:r.phone},notes:{internal_order_id:n},theme:{color:"#FACC15"},modal:{ondismiss:async()=>{await Ls(e),gt.disabled=!1,gt.innerHTML=`Place Order (₹${Hi()})`}}},l=new window.Razorpay(u);l.on("payment.failed",async d=>{console.error("Payment Failed Event:",d.error),await Ls(e),Gn(`Payment Failed: ${d.error.description}`),Wn(`Place Order (₹${t})`)}),l.open()}catch(i){throw console.error("Online payment initialization failed:",i),await Ls(e),i}},bE=async(n,e,t)=>{try{if(gt.textContent="Verifying Payment...",(await xh(Ud,"verifyRazorpayPayment")({razorpay_order_id:n.razorpay_order_id,razorpay_payment_id:n.razorpay_payment_id,razorpay_signature:n.razorpay_signature,internal_order_id:t})).data.success)$d(),window.location.href=`/track.html?id=${e}`;else throw new Error("Verification failed")}catch(r){console.error("Verification error:",r),Gn("Payment verification failed. Please contact support if amount was deducted."),Wn("Retry Payment")}},Ls=async n=>{await mE(n,{status:"PAYMENT_FAILED",paymentStatus:"failed"})},RE=n=>n.replace(/[^0-9]/g,"").slice(-10),Wn=n=>{gt.disabled=!1,gt.innerHTML=n},Gn=n=>{if(!Kn){alert(n);return}Kn.textContent=n,Kn.classList.remove("hidden")},SE=()=>{Kn&&Kn.classList.add("hidden")},PE=async()=>{try{const n=Uo(yn,"announcements"),e=Ph(n,ny("active","==",!0),Ch("createdAt","desc"));return(await Oh(e)).docs.map(r=>({id:r.id,...r.data()}))}catch(n){return console.error("Error fetching announcements:",n),[]}},CE=(n,e)=>{if(!e||e.length===0)return;if(e.some(r=>r.image)){n.innerHTML=`
            <div class="announcement-carousel-wrapper">
                <div class="carousel-track" id="announcement-track">
                    ${e.map(a=>`
                        <div class="announcement-slide" style="background-image: url('${a.image||""}')">
                            <div class="announcement-content">
                                <h4 class="text-xs md:text-sm font-black text-white uppercase tracking-widest">${a.title}</h4>
                                <p class="text-[10px] md:text-xs text-gray-300">${a.description}</p>
                            </div>
                        </div>
                    `).join("")}
                </div>
            </div>
        `;const r=document.getElementById("announcement-track");let i=0;const s=e.length;s>1&&setInterval(()=>{i=(i+1)%s,r.style.transform=`translateX(-${i*100}%)`},5e3)}else{const r=e[0];n.innerHTML=`
            <div class="announcement-banner">
                <span class="text-lg">📢</span>
                <div>
                    <span class="text-accent uppercase tracking-widest text-[10px] md:text-xs font-black mr-2">${r.title}:</span>
                    <span class="text-gray-300 text-[10px] md:text-xs">${r.description}</span>
                </div>
            </div>
        `}};console.log("🚀 Littiwale Premium Redesign Active");const Ms=document.querySelector("#app"),xs=document.querySelector("#menu-container"),bt=document.querySelector("#login-btn"),Fs=document.querySelector("#logout-btn"),zr=document.querySelector("#user-info"),Hr=document.querySelector("#welcome-msg"),ju=document.querySelector("#profile-trigger"),Rt=document.querySelector("#profile-dropdown"),zu=document.querySelector("#announcement-root"),Hu=document.querySelector("#main-header"),kE=async()=>{yE(e=>{var i,s,a,u,l;const t=localStorage.getItem("littiwale_guest")==="true",r=window.location.pathname;if(e){if((!((i=e.profile)!=null&&i.username)||!((s=e.profile)!=null&&s.phone))&&r!=="/login.html"){window.location.href="/login.html";return}}else if(t){if(r.includes("track.html")){window.location.href="/login.html?redirect="+r+window.location.search;return}}else if(r!=="/login.html"){window.location.href="/login.html";return}if(Ms&&Ms.classList.remove("hidden"),e||t){if(bt&&bt.classList.add("hidden"),zr&&zr.classList.remove("hidden"),Rt)if(e){const d=((a=e.profile)==null?void 0:a.name)||e.displayName||"User";Hr&&(Hr.textContent=`Hi, ${d.split(" ")[0]}`),Rt.innerHTML=`
                        <button class="dropdown-item" onclick="window.location.href='/#contact-section'">My Profile</button>
                        <button class="dropdown-item" onclick="window.location.href='/track.html'">Order History</button>
                        <button class="dropdown-item logout" id="dropdown-logout-btn">Logout</button>
                    `,(u=document.querySelector("#dropdown-logout-btn"))==null||u.addEventListener("click",async()=>{await Bu(),localStorage.removeItem("littiwale_guest"),window.location.href="/login.html"});const p=document.querySelector("#cust-name");p&&!p.value&&(p.value=d);const v=document.querySelector("#cust-phone");v&&!v.value&&((l=e.profile)!=null&&l.phone)&&(v.value=e.profile.phone),localStorage.removeItem("littiwale_guest")}else t&&(Hr&&(Hr.textContent="Hi, Guest"),Rt.innerHTML=`
                        <button class="dropdown-item" onclick="window.location.href='/login.html'">Login</button>
                    `)}else bt&&bt.classList.remove("hidden"),zr&&zr.classList.add("hidden")}),ju&&Rt&&(ju.addEventListener("click",e=>{e.stopPropagation(),Rt.classList.toggle("show")}),document.addEventListener("click",e=>{Rt.contains(e.target)||Rt.classList.remove("show")})),zu&&PE().then(e=>{e&&e.length>0&&(CE(zu,e),Hu&&(Hu.classList.add("mt-[60px]"),Ms.classList.add("pt-[60px]")))}).catch(e=>console.error("Failed to load announcements:",e));const n=document.querySelector("header");if(window.addEventListener("scroll",()=>{window.scrollY>50?n==null||n.classList.add("scrolled","glass","shadow-xl"):n==null||n.classList.remove("scrolled","glass","shadow-xl")}),Hd(),TE(),bt==null||bt.addEventListener("click",()=>{window.location.href="/login.html"}),Fs==null||Fs.addEventListener("click",async()=>{await Bu(),localStorage.removeItem("littiwale_guest"),window.location.href="/login.html"}),"serviceWorker"in navigator&&window.addEventListener("load",()=>{navigator.serviceWorker.register("/sw.js").then(e=>console.log("🚀 PWA: Service Worker Registered")).catch(e=>console.log("❌ PWA: Service Worker Failed",e))}),!!xs)try{const e=await tE();console.log(`📡 Fetched ${e.length} items from Firestore`),oE(xs,e)}catch(e){console.error("Failed to initialize app:",e),xs.innerHTML=`
            <div class="col-span-full text-center py-20 bg-error/10 rounded-[30px] border border-error/20">
                <h3 class="text-2xl font-black text-error mb-2">Error Loading Menu</h3>
                <p class="text-gray-400">Please check your connection or try again later.</p>
            </div>
        `}};kE();const Ku=document.querySelector("#cart-tally"),Wt=document.querySelector("#cart-modal"),Wu=document.querySelector("#close-cart");Ku&&Wt&&Wu&&(Ku.addEventListener("click",()=>{Wt.classList.remove("hidden")}),Wu.addEventListener("click",()=>{Wt.classList.add("hidden")}),Wt.addEventListener("click",n=>{n.target===Wt&&Wt.classList.add("hidden")}));
