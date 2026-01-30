import{useState as E,useEffect as L,useMemo as I}from"react";import{__ as e}from"@wordpress/i18n";import{useSelect as _}from"@wordpress/data";import{h as M,i as H,A as U,a as w,S as u,R as y,s as S,C as D,q as V,E as z,p as T}from"./TypographyPopup-BXz72zyZ.js";import{ToggleControl as B,SelectControl as g,Button as h}from"@wordpress/components";function P(t,a){return a==="desktop"?t:`${t}_${a}`}function R({label:t,help:a,attributes:d,setAttributes:m,attributeBaseName:p,showResponsiveButton:v=!0}){const c=_(s=>M(s),[]),r=v?P(p,c):p,f=d[p]??!1;let i;return v?c==="desktop"?i=f:c==="tablet"?i=d[`${p}_tablet`]??f:i=d[`${p}_mobile`]??d[`${p}_tablet`]??f:i=f,v?React.createElement("div",{className:"voxel-fse-responsive-toggle",style:{marginBottom:"20px"}},React.createElement("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between"}},React.createElement("div",{style:{display:"flex",alignItems:"center",gap:"8px"}},React.createElement("span",{className:"components-base-control__label",style:{marginBottom:0}},t),React.createElement(H,null)),React.createElement("div",null,React.createElement(B,{__nextHasNoMarginBottom:!0,checked:i,onChange:s=>m({[r]:s})}))),a&&React.createElement("p",{className:"components-base-control__help",style:{marginTop:"4px",marginBottom:0}},a)):React.createElement(B,{__nextHasNoMarginBottom:!0,label:t,help:a,checked:i,onChange:s=>m({[r]:s})})}function $(t){return t?Array.isArray(t)?t:typeof t=="object"?Object.values(t).filter(a=>a!=null&&typeof a=="object"&&typeof a.id=="string"):[]:[]}function j({attributes:t,setAttributes:a,showWidgetOptions:d=!0,showContainerOptions:m=!1,showVisibility:p=!0,showLoopElement:v=!0}){const[c,r]=E(!1),[f,i]=E(!1),[s,x]=E(null),b=$(t.visibilityRules),k=b.length>0;L(()=>{if(!f)return;const l="voxel-backend-css-dynamic";if(document.getElementById(l))return;const o=document.createElement("link");o.id=l,o.rel="stylesheet",o.href="/wp-content/themes/voxel/assets/dist/backend.css",document.head.appendChild(o)},[f]);const C=(l,o)=>l?`@${l}(${o||"role"})`:e("No loop","voxel-fse");return React.createElement(React.Fragment,null,React.createElement(U,{defaultPanel:m?"voxel-container-options":"voxel-widget-options"},d&&React.createElement(w,{id:m?"voxel-container-options":"voxel-widget-options",title:m?e("Container options","voxel-fse"):e("Widget options","voxel-fse")},React.createElement(u,{label:e("Sticky position","voxel-fse")}),React.createElement(B,{label:e("Enable?","voxel-fse"),checked:t.stickyEnabled??!1,onChange:l=>a({stickyEnabled:l})}),t.stickyEnabled&&React.createElement(React.Fragment,null,React.createElement(g,{label:e("Enable on desktop","voxel-fse"),value:t.stickyDesktop??"sticky",options:[{label:e("Enable","voxel-fse"),value:"sticky"},{label:e("Disable","voxel-fse"),value:"initial"}],onChange:l=>a({stickyDesktop:l})}),React.createElement(g,{label:e("Enable on tablet","voxel-fse"),value:t.stickyTablet??"sticky",options:[{label:e("Enable","voxel-fse"),value:"sticky"},{label:e("Disable","voxel-fse"),value:"initial"}],onChange:l=>a({stickyTablet:l})}),React.createElement(g,{label:e("Enable on mobile","voxel-fse"),value:t.stickyMobile??"sticky",options:[{label:e("Enable","voxel-fse"),value:"sticky"},{label:e("Disable","voxel-fse"),value:"initial"}],onChange:l=>a({stickyMobile:l})}),React.createElement(y,{label:e("Top","voxel-fse"),attributes:t,setAttributes:a,attributeBaseName:"stickyTop",min:0,max:500,step:1,availableUnits:["px","%","vh"],unitAttributeName:"stickyTopUnit"}),React.createElement(y,{label:e("Left","voxel-fse"),attributes:t,setAttributes:a,attributeBaseName:"stickyLeft",min:0,max:500,step:1,availableUnits:["px","%","vh"],unitAttributeName:"stickyLeftUnit"}),React.createElement(y,{label:e("Right","voxel-fse"),attributes:t,setAttributes:a,attributeBaseName:"stickyRight",min:0,max:500,step:1,availableUnits:["px","%","vh"],unitAttributeName:"stickyRightUnit"}),React.createElement(y,{label:e("Bottom","voxel-fse"),attributes:t,setAttributes:a,attributeBaseName:"stickyBottom",min:0,max:500,step:1,availableUnits:["px","%","vh"],unitAttributeName:"stickyBottomUnit"})),m&&React.createElement(React.Fragment,null,React.createElement(u,{label:e("Inline Flex","voxel-fse")}),React.createElement(R,{label:e("Enable?","voxel-fse"),help:e("Changes container display to inline flex and applies auto width","voxel-fse"),attributes:t,setAttributes:a,attributeBaseName:"enableInlineFlex"}),React.createElement(u,{label:e("Other","voxel-fse")}),React.createElement(R,{label:e("Calculate min height?","voxel-fse"),attributes:t,setAttributes:a,attributeBaseName:"enableCalcMinHeight",showResponsiveButton:!1}),t.enableCalcMinHeight&&React.createElement("div",{style:{marginBottom:"16px"}},React.createElement(S,{label:e("Calculation","voxel-fse"),help:e("Use CSS calc() to calculate min-height e.g. calc(100vh - 215px).","voxel-fse"),placeholder:"calc()",attributes:t,setAttributes:a,attributeBaseName:"calcMinHeight",enableDynamicTags:!0})),React.createElement(R,{label:e("Calculate max height?","voxel-fse"),attributes:t,setAttributes:a,attributeBaseName:"enableCalcMaxHeight",showResponsiveButton:!1}),t.enableCalcMaxHeight&&React.createElement(React.Fragment,null,React.createElement("div",{style:{marginBottom:"16px"}},React.createElement(S,{label:e("Calculation","voxel-fse"),help:e("Use CSS calc() to calculate max-height e.g. calc(100vh - 215px).","voxel-fse"),placeholder:"calc()",attributes:t,setAttributes:a,attributeBaseName:"calcMaxHeight",enableDynamicTags:!0})),React.createElement(u,{label:e("Scrollbar color","voxel-fse")}),React.createElement(D,{label:e("Color","voxel-fse"),value:t.scrollbarColor,onChange:l=>a({scrollbarColor:l})})),React.createElement(R,{label:e("Backdrop blur?","voxel-fse"),attributes:t,setAttributes:a,attributeBaseName:"enableBackdropBlur",showResponsiveButton:!1}),t.enableBackdropBlur&&React.createElement(y,{label:e("Strength","voxel-fse"),attributes:t,setAttributes:a,attributeBaseName:"backdropBlurStrength",min:0,max:100,step:1,showUnit:!1}))),p&&React.createElement(w,{id:"voxel-visibility",title:e("Visibility","voxel-fse")},React.createElement(u,{label:e("Element visibility","voxel-fse")}),React.createElement(g,{value:t.visibilityBehavior??"show",options:[{label:e("Show this element if","voxel-fse"),value:"show"},{label:e("Hide this element if","voxel-fse"),value:"hide"}],onChange:l=>a({visibilityBehavior:l})}),React.createElement("div",{className:"voxel-fse-visibility-rules-list"},k?b.filter(l=>l!=null&&typeof l=="object"&&!!l.id).map(l=>React.createElement("div",{key:l.id,className:"voxel-fse-visibility-rule-label"},V(l))):React.createElement("p",{className:"voxel-fse-control-note",style:{margin:0}},e("No visibility rules added.","voxel-fse"))),React.createElement("div",{className:"voxel-fse-filter-actions-row"},React.createElement(h,{variant:"primary",onClick:()=>r(!0)},e("Edit rules","voxel-fse")),React.createElement(h,{variant:"secondary",onClick:()=>a({visibilityRules:[]})},e("Remove","voxel-fse"))),React.createElement(z,{isOpen:c,onClose:()=>r(!1),rules:b,onSave:l=>a({visibilityRules:l})})),v&&React.createElement(w,{id:"voxel-loop-element",title:e("Loop element","voxel-fse")},React.createElement("div",{className:"voxel-fse-loop-info"},React.createElement("p",{className:"voxel-fse-loop-description"},e("Loop this element based on","voxel-fse")),React.createElement("p",{className:"voxel-fse-loop-status"},C(t.loopSource,t.loopProperty))),React.createElement("div",{className:"voxel-fse-filter-actions-row"},React.createElement(h,{variant:"primary",onClick:()=>{x(null),i(!0)}},e("Edit loop","voxel-fse")),React.createElement(h,{variant:"secondary",onClick:()=>a({loopSource:"",loopProperty:"",loopLimit:"",loopOffset:""})},e("Remove","voxel-fse"))),React.createElement("div",{className:"voxel-fse-loop-fields"},React.createElement("div",{className:"voxel-fse-loop-field-inline"},React.createElement("label",{className:"voxel-fse-loop-field-label"},e("Loop limit","voxel-fse")),React.createElement("input",{type:"number",className:"voxel-fse-loop-field-input",value:String(t.loopLimit??""),onChange:l=>a({loopLimit:l.target.value})})),React.createElement("p",{className:"voxel-fse-loop-field-help"},e("If a hard limit is set, the loop will stop there even if there are additional items left","voxel-fse")),React.createElement("div",{className:"voxel-fse-loop-field-inline"},React.createElement("label",{className:"voxel-fse-loop-field-label"},e("Loop offset","voxel-fse")),React.createElement("input",{type:"number",className:"voxel-fse-loop-field-input",value:String(t.loopOffset??""),onChange:l=>a({loopOffset:l.target.value})})),React.createElement("p",{className:"voxel-fse-loop-field-help"},e("Skip a set amount of items from the start of the loop","voxel-fse"))),f&&React.createElement("div",{id:"vx-dynamic-data","data-v-app":""},React.createElement("div",{className:"nvx-editor nvx-editor-loop"},React.createElement("div",{className:"nvx-topbar"},React.createElement("div",{className:"nvx-topbar__title nvx-flex nvx-v-center"},React.createElement("h2",null,e("Select loop source","voxel-fse"))),React.createElement("div",{className:"nvx-topbar__buttons nvx-flex nvx-v-center"},React.createElement("button",{type:"button",className:"ts-button ts-outline",onClick:()=>i(!1)},e("Discard","voxel-fse")))),React.createElement("div",{className:"nvx-editor-body"},React.createElement("div",{className:"nvx-scrollable nvx-loops"},React.createElement("div",{className:"nvx-loops-container"},React.createElement("div",{className:"nvx-mod-list"},React.createElement("div",{className:`nvx-mod ${s==="author"?"mod-open":""}`},React.createElement("div",{className:"nvx-mod-title"},e("Author","voxel-fse"),React.createElement("div",{className:"nvx-mod-actions"},React.createElement("a",{href:"#",className:"ts-button ts-outline icon-only",onClick:l=>{l.preventDefault(),x(s==="author"?null:"author")}},React.createElement("svg",{width:"80",height:"80",viewBox:"0 0 24 24",fill:"none",xmlns:"http://www.w3.org/2000/svg",transform:"rotate(0 0 0)"},React.createElement("path",{d:"M6.75002 2.74951C6.75002 2.3353 7.08581 1.99951 7.50002 1.99951H16.5C16.9142 1.99951 17.25 2.3353 17.25 2.74951C17.25 3.16373 16.9142 3.49951 16.5 3.49951H12.752L12.752 15.8752H16.625C16.9284 15.8752 17.2019 16.0579 17.318 16.3383C17.434 16.6186 17.3698 16.9412 17.1552 17.1557L12.5791 21.7286C12.4415 21.8941 12.234 21.9995 12.002 21.9995C11.7881 21.9995 11.5951 21.91 11.4585 21.7664L6.84486 17.1557C6.63026 16.9412 6.56601 16.6186 6.68207 16.3383C6.79812 16.0579 7.07163 15.8752 7.37502 15.8752H11.252L11.252 3.49951H7.50002C7.08581 3.49951 6.75002 3.16373 6.75002 2.74951Z",fill:"#343C54"}))))),s==="author"&&React.createElement("div",{className:"nvx-mod-content"},React.createElement("div",{className:"nvx-mod mod-open mod-active"},React.createElement("div",{className:"nvx-mod-title"},e("Role","voxel-fse"),React.createElement("div",{className:"nvx-mod-actions"},React.createElement("a",{className:"ts-button ts-outline",href:"#",style:{width:"auto"},onClick:l=>{l.preventDefault(),a({loopSource:"author",loopProperty:"role"}),i(!1)}},e("Use loop","voxel-fse"))))))),React.createElement("div",{className:`nvx-mod ${s==="user"?"mod-open":""}`},React.createElement("div",{className:"nvx-mod-title"},e("User","voxel-fse"),React.createElement("div",{className:"nvx-mod-actions"},React.createElement("a",{href:"#",className:"ts-button ts-outline icon-only",onClick:l=>{l.preventDefault(),x(s==="user"?null:"user")}},React.createElement("svg",{width:"80",height:"80",viewBox:"0 0 24 24",fill:"none",xmlns:"http://www.w3.org/2000/svg",transform:"rotate(0 0 0)"},React.createElement("path",{d:"M6.75002 2.74951C6.75002 2.3353 7.08581 1.99951 7.50002 1.99951H16.5C16.9142 1.99951 17.25 2.3353 17.25 2.74951C17.25 3.16373 16.9142 3.49951 16.5 3.49951H12.752L12.752 15.8752H16.625C16.9284 15.8752 17.2019 16.0579 17.318 16.3383C17.434 16.6186 17.3698 16.9412 17.1552 17.1557L12.5791 21.7286C12.4415 21.8941 12.234 21.9995 12.002 21.9995C11.7881 21.9995 11.5951 21.91 11.4585 21.7664L6.84486 17.1557C6.63026 16.9412 6.56601 16.6186 6.68207 16.3383C6.79812 16.0579 7.07163 15.8752 7.37502 15.8752H11.252L11.252 3.49951H7.50002C7.08581 3.49951 6.75002 3.16373 6.75002 2.74951Z",fill:"#343C54"}))))),s==="user"&&React.createElement("div",{className:"nvx-mod-content"},React.createElement("div",{className:"nvx-mod mod-open mod-active"},React.createElement("div",{className:"nvx-mod-title"},e("Role","voxel-fse"),React.createElement("div",{className:"nvx-mod-actions"},React.createElement("a",{className:"ts-button ts-outline",href:"#",style:{width:"auto"},onClick:l=>{l.preventDefault(),a({loopSource:"user",loopProperty:"role"}),i(!1)}},e("Use loop","voxel-fse"))))))))))))))),React.createElement("style",null,`
				/* Control Note - matches search-form editor.css */
				.voxel-fse-control-note {
					margin: 0 0 12px;
					font-size: 12px;
					color: #9ca3af;
					font-style: italic;
				}

				/* Visibility Rules List - matches Element Visibility panel styling */
				.voxel-fse-visibility-rules-list {
					display: flex;
					flex-direction: column;
					gap: 2px;
					margin-bottom: 12px;
					padding: 12px;
					background: #fbfafb;
					border-radius: 4px;
				}

				.voxel-fse-visibility-rule-label {
					font-size: 12px;
					color: #515962;
					line-height: 1.5;
					display: block;
				}

				/* Filter Actions Row - matches search-form editor.css */
				.voxel-fse-filter-actions-row {
					display: flex;
					gap: 8px;
					margin-top: 20px;
					padding-top: 16px;
					border-top: 1px solid #e5e7eb;
				}

				.voxel-fse-filter-actions-row .components-button {
					flex: 1;
					justify-content: center;
				}

				/* Loop element - matches Voxel's original styling */
				.voxel-fse-loop-info {
					padding: 12px;
					background: #fbfafb;
					border-radius: 4px;
					margin-bottom: 0;
				}

				.voxel-fse-loop-description {
					margin: 0 0 4px;
					font-size: 12px;
					color: #515962;
					font-style: italic;
				}

				.voxel-fse-loop-status {
					margin: 0;
					font-size: 12px;
					color: #515962;
					font-weight: 600;
				}

				/* Loop fields container - light gray background */
				.voxel-fse-loop-fields {
					margin-top: 16px;
					padding: 12px;
					background: #fbfafb;
					border-radius: 4px;
				}

				/* Inline field row - label left, input right */
				.voxel-fse-loop-field-inline {
					display: flex;
					justify-content: space-between;
					align-items: center;
					margin-bottom: 4px;
				}

				.voxel-fse-loop-field-label {
					color: #2271b1;
					font-weight: 700;
					font-size: 13px;
					text-transform: capitalize;
				}

				.voxel-fse-loop-field-input {
					width: 80px;
					padding: 6px 8px;
					border: 1px solid #8c8f94;
					border-radius: 4px;
					font-size: 13px;
				}

				.voxel-fse-loop-field-input:focus {
					border-color: #2271b1;
					box-shadow: 0 0 0 1px #2271b1;
					outline: none;
				}

				.voxel-fse-loop-field-help {
					margin: 0 0 16px;
					font-size: 12px;
					color: #757575;
					font-style: italic;
				}

				.voxel-fse-loop-field-help:last-child {
					margin-bottom: 0;
				}

				/* Loop Source Modal - uses Voxel's backend.css for styling */
				/* nvx-editor, nvx-topbar, ts-term-dropdown classes are styled by backend.css */

				/* Container Options - calc input group */
				.voxel-fse-calc-input-group {
					display: flex;
					flex-direction: column;
					gap: 12px;
					padding: 12px;
					background: #fbfafb;
					border-radius: 4px;
					margin-bottom: 16px;
				}

				.voxel-fse-calc-input-group .components-base-control {
					margin-bottom: 0;
				}

				.voxel-fse-calc-input-group .components-base-control__help {
					color: #757575;
					font-size: 11px;
					font-style: italic;
					margin-top: 4px;
				}
			`))}const q={stickyEnabled:{type:"boolean",default:!1},stickyDesktop:{type:"string",default:"sticky"},stickyTablet:{type:"string",default:"sticky"},stickyMobile:{type:"string",default:"sticky"},stickyTop:{type:"number"},stickyTop_tablet:{type:"number"},stickyTop_mobile:{type:"number"},stickyTopUnit:{type:"string",default:"px"},stickyLeft:{type:"number"},stickyLeft_tablet:{type:"number"},stickyLeft_mobile:{type:"number"},stickyLeftUnit:{type:"string",default:"px"},stickyRight:{type:"number"},stickyRight_tablet:{type:"number"},stickyRight_mobile:{type:"number"},stickyRightUnit:{type:"string",default:"px"},stickyBottom:{type:"number"},stickyBottom_tablet:{type:"number"},stickyBottom_mobile:{type:"number"},stickyBottomUnit:{type:"string",default:"px"},visibilityBehavior:{type:"string",default:"show"},visibilityRules:{type:"array",default:[]},loopEnabled:{type:"boolean",default:!1},loopSource:{type:"string",default:""},loopProperty:{type:"string",default:""},loopLimit:{type:"string",default:""},loopOffset:{type:"string",default:""}};function G({tabs:t,includeAdvancedTab:a=!1,includeVoxelTab:d=!1,attributes:m,setAttributes:p,defaultTab:v,activeTabAttribute:c}){const r=I(()=>{const o=t.map(n=>{if(!n.icon){if(n.id==="content")return{...n,icon:""};if(n.id==="style")return{...n,icon:""}}return n});return a&&o.push({id:"advanced",label:e("Advanced","voxel-fse"),icon:"",render:n=>React.createElement(T,{attributes:n?.attributes,setAttributes:n?.setAttributes})}),d&&o.push({id:"voxel",label:e("Voxel","voxel-fse"),icon:"/wp-content/themes/voxel/assets/images/post-types/logo.svg",render:n=>React.createElement(j,{attributes:n?.attributes,setAttributes:n?.setAttributes})}),o},[t,a,d]),f=_(o=>o("core/block-editor").getSelectedBlockClientId(),[]),i=f?`voxel_inspector_tab_${f}`:null,[s,x]=E(()=>{if(c&&m?.[c])return m[c];if(i){const o=sessionStorage.getItem(i);if(o&&r.some(n=>n.id===o))return o}return v||r[0]?.id||null});L(()=>{const o=c?m?.[c]:void 0;if(c&&o&&o!==s){x(o);return}if(s===null&&i){const n=sessionStorage.getItem(i);n&&r.some(N=>N.id===n)&&x(n)}},[c,m?.[c],s,i,r]);const b=s||v||r[0]?.id||"",k=o=>{i&&sessionStorage.setItem(i,o),c&&p&&p({[c]:o}),x(o)},C=r.findIndex(o=>o.id===b),l=r.find(o=>o.id===b);return React.createElement("div",{className:"voxel-fse-inspector-wrapper"},React.createElement("div",{className:"voxel-fse-inspector-tabs","data-active-tab":C,style:{"--tab-count":r.length}},r.map(o=>{const n=o.icon||"",N=n.startsWith("http://")||n.startsWith("https://")||n.startsWith("/");return React.createElement("button",{key:o.id,type:"button",className:`voxel-fse-tab-btn ${b===o.id?"is-active":""}`,onClick:()=>k(o.id),title:o.label},N?React.createElement("img",{src:n,alt:"",className:"voxel-fse-tab-icon-img"}):React.createElement("i",{"data-icon":n}),React.createElement("span",{className:"voxel-fse-tab-label"},o.label))})),React.createElement("div",{className:"voxel-fse-tab-content"},l?.render({attributes:m,setAttributes:p})),React.createElement("style",null,`
				/* Stable wrapper - use display:block to create stable layout context */
				.voxel-fse-inspector-wrapper {
					display: block;
				}

				/* Inspector tabs - Elementor-style horizontal navigation */
				.voxel-fse-inspector-tabs {
					display: flex;
					gap: 4px;
					padding: 0;
					border-bottom: 1px solid #e0e0e0;
					background: #fff;
					margin: 0;
					position: relative;
				}

				/* WordPress-style animated tab indicator */
				.voxel-fse-inspector-tabs::before {
					content: "";
					position: absolute;
					bottom: 0;
					left: 0;
					height: 0;
					width: calc(100% / var(--tab-count, 4));
					border-bottom: 2px solid #007cba;
					transition: transform 0.2s ease;
					transform-origin: left top;
					pointer-events: none;
				}

				/* Dynamic transform based on active tab index */
				.voxel-fse-inspector-tabs[data-active-tab="0"]::before {
					transform: translateX(0);
				}

				.voxel-fse-inspector-tabs[data-active-tab="1"]::before {
					transform: translateX(100%);
				}

				.voxel-fse-inspector-tabs[data-active-tab="2"]::before {
					transform: translateX(200%);
				}

				.voxel-fse-inspector-tabs[data-active-tab="3"]::before {
					transform: translateX(300%);
				}

				.voxel-fse-inspector-tabs[data-active-tab="4"]::before {
					transform: translateX(400%);
				}

				.voxel-fse-inspector-tabs[data-active-tab="5"]::before {
					transform: translateX(500%);
				}

				.voxel-fse-inspector-tabs[data-active-tab="6"]::before {
					transform: translateX(600%);
				}

				.voxel-fse-tab-btn {
					flex: 1;
					display: flex;
					flex-direction: column;
					align-items: center;
					justify-content: center;
					gap: 4px;
					padding: 12px 8px;
					background: transparent;
					border: none;
					border-radius: 0;
					color: #757575;
					cursor: pointer;
					transition: all 0.1s ease;
					font-size: 11px;
					font-weight: 400;
					text-transform: uppercase;
					letter-spacing: 0.5px;
					position: relative;
				}

				.voxel-fse-tab-btn:hover {
					color: #1e1e1e;
					background: transparent;
				}

				.voxel-fse-tab-btn.is-active {
					color: #1e1e1e;
					background: transparent;
					font-weight: 500;
					box-shadow: none;
				}

				/* Render Elementor icons using ::before pseudo-element */
				.voxel-fse-tab-btn i {
					font-size: 18px;
					line-height: 1;
					font-family: 'eicons';
					font-style: normal;
					font-weight: normal;
					font-variant: normal;
					text-transform: none;
				}

				/* Set icon content from data attribute */
				.voxel-fse-tab-btn i::before {
					content: attr(data-icon);
				}

				/* Image icon support (e.g., Voxel logo) */
				.voxel-fse-tab-icon-img {
					width: 18px;
					height: 18px;
					object-fit: contain;
					opacity: 0.7;
					transition: opacity 0.1s ease;
				}

				.voxel-fse-tab-btn:hover .voxel-fse-tab-icon-img,
				.voxel-fse-tab-btn.is-active .voxel-fse-tab-icon-img {
					opacity: 1;
				}

				.voxel-fse-tab-label {
					font-size: 11px;
					white-space: nowrap;
					overflow: hidden;
					display: none;
					text-overflow: ellipsis;
					max-width: 100%;
				}

				.voxel-fse-tab-content {
					padding: 0;
				}
			`))}export{G as I,R,j as V,q as v};
