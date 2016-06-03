var GlobalNavigationController = {
    create: function () {
        var o = {};

        o.name = "GlobalNavigationController";
        o.hasBackdropFilter = false;
        o.touchAvailable = false;

        o.initialize = function () {
            this.setNodeReferences();
            this.featureDetection();
            this.setNodeEvents();
            this.queryViewport();
        };

        o.setNodeReferences = function () {
            this.globalNav = document.querySelector(".global-nav");
            this.globalNavMenuIcon = document.querySelector(".js.gn-menu-icon");
            this.searchLink = document.querySelector(".gn-menu-item.search > a");
            this.searchForm = document.querySelector(".gn-searchform-input");
            this.viewportEmitter = document.querySelector("#gn-viewport-emitter");
            this.menuLinks = document.querySelectorAll(".gn-menu-link");
            this.menuItemList = document.querySelector("ul.gn-menu-items");
            this.menuItems = document.querySelectorAll("li.gn-menu-item");
            this.menuItemsHasSub = document.querySelectorAll(".gn-menu-item.has-sub");
            this.menuSubItems = document.querySelectorAll(".gn-menu-sub-items");
            this.root = document.documentElement; // <html>
        };

        o.featureDetection = function () {
            // Detect back-drop-filter
            this.hasBackdropFilter = !!('webkitBackdropFilter' in this.root.style || 'backdropFilter' in this.root.style);
            // Detect device screen can be touched
            this.touchAvailable = !!(("ontouchstart" in window) || (window.DocumentTouch && document instanceof window.DocumentTouch) || (navigator.maxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0));
            // Set back-drop-filter
            if (this.hasBackdropFilter) {
                this.root.classList.remove('no-backdropfilter');
            }
            // Set touch
            if (this.touchAvailable) {
                this.root.classList.remove('no-touch');
            }
        };

        o.setNodeEvents = function () {
            this.searchLink.addEventListener("click", this.onSearchLinkClick.bind(this), false);
            this.searchForm.addEventListener("blur", this.onSearchFormBlur.bind(this), false);
            this.globalNavMenuIcon.addEventListener("click", this.onMenuIconClick.bind(this), false);

            var _length = this.menuItemsHasSub.length;
            for (var i = 0; i < _length; i++) {
                this.menuItemsHasSub[i].addEventListener("click", this.onMenuItemHasSubClick, false);
            }
            window.addEventListener("resize", o.queryViewport.bind(this), false);
        };

        o.onSearchLinkClick = function () {
            this.globalNav.classList.add("global-nav--searching");
            this.addTranslateX();
            // 以上两行不能颠倒位置
            // 判断 searchForm 的动画完成，完成后 focus 到 searchForm
            this.searchForm.focus();

        };

        o.addTranslateX = function () {
            var _left = (this.menuLinks[0].getBoundingClientRect()).left;
            for (var i = 0; i < this.menuLinks.length; i++) {
                var offset = parseInt((window.getComputedStyle(this.menuLinks[i], null)).paddingLeft) + ((this.menuLinks[i].getBoundingClientRect()).left - _left);
                this.menuLinks[i].parentNode.style.transform = "translateX(-" + offset + "px)";
            }
        }

        // 加入 onblur 事件
        o.onSearchFormBlur = function () {
            this.globalNav.classList.remove("global-nav--searching");
            this.removeTranslateX();
        }
        
        o.removeTranslateX = function () {
            this.removeStyle(this.menuItems);
        }

        o.removeStyle = function (_obj) {
            if (_obj == '[object NodeList]') {
                var _length = _obj.length;
                for (var i = 0; i < _length; i++) {
                    _obj[i].removeAttribute("style");
                }
            }
        };

        o.onMenuIconClick = function () {
            // console.log(this);
            if (this.globalNav.classList.toggle("global-nav--opened")) {
                this.globalNav.classList.remove("global-nav--closed");
                this.addOtherAreaClickEvent();
                this.disableScroll()
            } else {
                this.globalNav.classList.add("global-nav--closed");
                this.removeOtherAreaClickEvent();
                this.enableScroll()
            }
        };

        o.addOtherAreaClickEvent = function () {
            this.root.addEventListener("click", this.hideMenu, true);
            this.root.addEventListener("touchstart", this.hideMenu, true);
        };

        o.removeOtherAreaClickEvent = function () {
            this.root.removeEventListener("click", this.hideMenu, true);
            this.root.removeEventListener("touchstart", this.hideMenu, true);
        };

        o.hideMenu = function (e) {
            if (e.target.classList[0] === "gn-curtain") {
                o.onMenuIconClick();
            }
        };

        o.disableScroll = function () {
            // document.body.classList.add("disable-scroll");
            document.ontouchmove = function (event) {
                event.preventDefault();
            };
        };

        o.enableScroll = function () {
            // document.body.classList.remove("disable-scroll");
            document.ontouchmove = null;
        };

        o.onMenuItemHasSubClick = function () {
            var _subList = this.querySelector(".gn-menu-sub-items")

            window.getComputedStyle(o.menuItemList)
            if(o.viewport === "small") {
                this.classList.toggle("opened")
                if (this.classList.contains("opened")) {
                    // Javascript Open transition
                    var _startTime = Date.now();
                    var _height = parseInt(window.getComputedStyle(_subList).getPropertyValue("height"));
                    var _duration = 200;
                    function _open() {
                        var __now = Date.now();
                        var __currentTime = __now - _startTime;
                        var __height = o.easeInCubic(__currentTime, 0, _height, _duration);
                        // var __opacity = Math.min(o.easeInCubic(__currentTime, 0, 1, 50), 1);
                        if (__currentTime >= _duration) {
                            _subList.removeAttribute("style");
                            return;
                        }
                        _subList.style.height = __height + "px";
                        // _subList.style.opacity = __opacity;
                        window.requestAnimationFrame(_open);
                    }
                    _open();
                } else {
                    // Javascript Close transition
                    _subList.style.visibility = "visible";
                    _subList.style.position = "inherit";
                    var _startTime = Date.now();
                    var _height = parseInt(window.getComputedStyle(_subList).getPropertyValue("height"));
                    var _duration = 200;
                    function _close() {
                        var __now = Date.now();
                        var __currentTime = __now - _startTime;
                        var __height = o.easeOutCubic(__currentTime, _height, (0-_height), _duration);
                        // var __opacity = Math.min(o.easeOutCubic(__currentTime, 1, -1, 200), 1);
                        if (__currentTime >= _duration) {
                            _subList.removeAttribute("style");
                            return;
                        }
                        _subList.style.height = __height + "px";
                        // _subList.style.opacity = __opacity;
                        window.requestAnimationFrame(_close);
                    }
                    _close();
                }
            }
        };

        // t: current time
        // b: beginning value
        // c: change in value
        // d: duration
        // [jQuery Easing v1.3](http://gsgd.co.uk/sandbox/jquery/easing/)
        o.easeInCubic = function (t, b, c, d) {
            return c*(t/=d)*t*t + b;
        };

        o.easeOutCubic = function (t, b, c, d) {
            return c*((t=t/d-1)*t*t + 1) + b;
        };

        o.queryViewport = function () {
            var _str = window.getComputedStyle(this.viewportEmitter, "::after").content;
            var _reg = /"/g;
            this.setViewport(_str.replace(_reg, ''));
        };

        o.setViewport = function (_viewport) {
            if (_viewport != this.viewport) {
                this.onViewportChange(this.viewport, _viewport);
                this.viewport = _viewport;
            }
        };

        o.onViewportChange = function (_old, _new) {
            if (_old === undefined) {
                return;
            }
            var _flag = 0;
            this.blockTransitions();
        };

        o.blockTransitions = function () {
            this.globalNav.classList.add("no-transition");
            // Safari 下删除 will-change 后有效。
            // Chrome 下不起作用。
            // window.requestAnimationFrame(this.unblockTransitions.bind(this));
            // 临时使用 setTimeout
            window.setTimeout(this.unblockTransitions.bind(this), 20);
        };

        o.unblockTransitions = function () {
            this.globalNav.classList.remove("no-transition");
        };

        o.initialize();
        return o;
    }
};
var GNC = GlobalNavigationController.create();