(function(window){var svgSprite="<svg>"+""+'<symbol id="icon-shuaxin" viewBox="0 0 1024 1024">'+""+'<path d="M819.0635 512.192C818.9952 335.296 669.7643 192 480.3925 192 290.9525 192 137.3525 335.424 137.3525 512.384c0 167.616 164.7957 305.792 340.3776 319.808v128C226.0992 945.152 0 752.64 0 513.856c0-248.576 215.7909-450.048 481.9627-450.048 265.5573 0 472.6784 200.576 473.6341 448.32h136.53333333333333l-204.8 320-204.8-320H819.0634666666666z"  ></path>'+""+"</symbol>"+""+'<symbol id="icon-1" viewBox="0 0 1034 1024">'+""+'<path d="M836.7616 284.4928l0-22.144c0-68.4032-57.6-125.4912-126.5408-125.4912l-329.216 0-2.7136-4.1984-29.312-42.0864C328.0384 60.3136 286.72 38.4 254.2336 38.4L58.5728 38.4C26.3424 38.4 0 60.3136 0 90.5728L0 789.504l107.2896-386.8928c17.9712-64.4864 99.2-118.1184 178.6624-118.1184L836.7616 284.4928zM323.4048 333.7216c-70.912 0-143.232 45.2608-159.2576 99.6608L27.8016 898.5344c-15.9744 54.3744 29.7728 99.6608 100.6592 99.6608l606.3872 0c70.912 0 143.2064-45.2864 159.2576-99.6608l136.2944-465.1264c16-54.4-29.7472-99.6608-100.6592-99.6608L323.4048 333.7472zM442.9824 788.2752l0-159.232-64.4864 0c-27.8016-15.2832 9.088-42.3424 9.088-42.3424s119.8592-98.432 135.3728-104.576c24.576-17.7152 35.4304 0 35.4304 0s138.5472 100.8896 151.808 117.6576c6.4512 26.8288-2.6624 29.2864-2.6624 29.2864l-67.712 0 0 161.4336c0 20.6848-18.2016 35.456-39.9104 35.456l-120.064 0C458.24 825.9328 442.9824 808.6784 442.9824 788.2752z"  ></path>'+""+"</symbol>"+""+'<symbol id="icon-icondel" viewBox="0 0 1024 1024">'+""+'<path d="M704 32 320 32l0 64L128 96c-35.328 0-64 28.608-64 64l0 64 896 0 0-64c0-35.392-28.608-64-64-64l-192 0L704 32z"  ></path>'+""+'<path d="M128 352l0 64 0 512c0 35.392 28.672 64 64 64l640 0c35.392 0 64-28.608 64-64l0-512 0-64 0-64L128 288 128 352zM256 864l0-448 128 0 0 448L256 864zM448 864l0-448 128 0 0 448L448 864zM768 864l-128 0 0-448 128 0L768 864z"  ></path>'+""+"</symbol>"+""+'<symbol id="icon-xiazaiwenjian01" viewBox="0 0 1024 1024">'+""+'<path d="M788.202 292.095h-251.47l-24.728-47.841c-25.312-47.068-31.965-71.401-71.4-71.401h-204.804c-39.435 0-71.397 31.964-71.397 71.4v535.491c0 39.435 31.964 71.4 71.397 71.4h552.403c39.435 0 71.397-31.964 71.397-71.4v-416.251c0-39.434-31.964-71.398-71.397-71.398v0zM634.623 633.585c0 0-95.384 86.877-109.080 92.299-21.691 15.637-31.268 0-31.268 0s-113.612-89.048-125.317-103.846c-5.693-23.683 2.35-25.85 2.35-25.85h90.985v-147.69c0-18.255 10.859-31.294 30.019-31.294h36.597c19.070 0.024 27.337 15.254 27.337 33.262v145.743h86.4c24.54 13.491-8.021 37.374-8.021 37.374v0z"  ></path>'+""+"</symbol>"+""+"</svg>";var script=function(){var scripts=document.getElementsByTagName("script");return scripts[scripts.length-1]}();var shouldInjectCss=script.getAttribute("data-injectcss");var ready=function(fn){if(document.addEventListener){if(~["complete","loaded","interactive"].indexOf(document.readyState)){setTimeout(fn,0)}else{var loadFn=function(){document.removeEventListener("DOMContentLoaded",loadFn,false);fn()};document.addEventListener("DOMContentLoaded",loadFn,false)}}else if(document.attachEvent){IEContentLoaded(window,fn)}function IEContentLoaded(w,fn){var d=w.document,done=false,init=function(){if(!done){done=true;fn()}};var polling=function(){try{d.documentElement.doScroll("left")}catch(e){setTimeout(polling,50);return}init()};polling();d.onreadystatechange=function(){if(d.readyState=="complete"){d.onreadystatechange=null;init()}}}};var before=function(el,target){target.parentNode.insertBefore(el,target)};var prepend=function(el,target){if(target.firstChild){before(el,target.firstChild)}else{target.appendChild(el)}};function appendSvg(){var div,svg;div=document.createElement("div");div.innerHTML=svgSprite;svgSprite=null;svg=div.getElementsByTagName("svg")[0];if(svg){svg.setAttribute("aria-hidden","true");svg.style.position="absolute";svg.style.width=0;svg.style.height=0;svg.style.overflow="hidden";prepend(svg,document.body)}}if(shouldInjectCss&&!window.__iconfont__svg__cssinject__){window.__iconfont__svg__cssinject__=true;try{document.write("<style>.svgfont {display: inline-block;width: 1em;height: 1em;fill: currentColor;vertical-align: -0.1em;font-size:16px;}</style>")}catch(e){console&&console.log(e)}}ready(appendSvg)})(window)