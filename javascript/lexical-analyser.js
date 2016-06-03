"use strict";
var ViewController = {
    create: function () {
        var o = {};

        o.initialize = function () {
            this.setNodeReferences();
            this.setNodeEvents();
        };

        o.setNodeReferences = function () {
            this.middleLine = document.querySelector(".middle-line");
            this.wrapper = document.querySelector(".wrapper");
            this.wrapperInner = document.querySelector(".wrapper-inner");
            this.inputArea = document.querySelector(".input-area");
            this.outputArea = document.querySelector(".output-area");
        };

        o.setNodeEvents = function () {
            this.middleLine.addEventListener("mousedown", this.onMouseDownMiddleLine.bind(this), false);
        };

        o.onMouseDownMiddleLine = function () {
            this.wrapperInner_left = this.wrapperInner.getBoundingClientRect().left;
            this.wrapperInner_width = this.wrapperInner.getBoundingClientRect().width;
            this.wrapper.classList.add("no-select");
            document.addEventListener("mousemove", this.onMouseMoveMiddleLine, false);
            document.addEventListener("mouseup", this.onMouseUpMiddleLine, false);
        };

        o.onMouseMoveMiddleLine = function (event) {
            var _percent = (event.clientX - o.wrapperInner_left) * 100 / o.wrapperInner_width;
            o.inputArea.style.width = _percent + "%";
            o.outputArea.style.width = (100 - _percent) + "%";
            if (parseInt(getComputedStyle(o.inputArea).width) <= 370) {
                o.inputArea.classList.add("small");
            } else {
                o.inputArea.classList.remove("small");
            }
        };

        o.onMouseUpMiddleLine = function () {
            o.wrapper.classList.remove("no-select");
            document.removeEventListener("mousemove", o.onMouseMoveMiddleLine, false);
            document.removeEventListener("mouseup", o.onMouseUpMiddleLine, false);
        };

        o.initialize();
        return o;
    }
};

var LexicalAnalyser = {
    create: function () {
        var o = {};

        // Others
        o.name = "LexicalAnalyser";

        // Value
        o.TOKENNUM = 0;

        // Functions
        o.main = function () {
            this.setNodeReferences();
            this.testInput();
            this.setEventListeners();
            this.setDataValue();
        };

        o.testInput = function () {
            this.inputTextarea.value = "\/*example*\/\n\/\/This is an example, you can click submit button directly.\n     b=1\\\n00\n101:a=2*(1+3)\n    IF(b>10) THEN\n        a=1\n    ELSE IF(b>=5) THEN\n        a=2\n    ELSE\n        GOTO 101";
        };

        o.setNodeReferences = function () {
            this.inputTextarea = document.querySelector("#input-textarea");
            this.submitButton = document.querySelector(".input-area-buttons > .submit");
            this.cancelButton = document.querySelector(".input-area-buttons > .cancel");
            this.sourceCodeContainer = document.querySelector(".source-code-container");
            this.afterPreprocessContainer = document.querySelector(".after-preprocess-container");
            this.tokenListTable = document.querySelector(".token-list-table");
        };

        o.setEventListeners = function () {
            this.submitButton.addEventListener("click", this.clickSubmit.bind(this));
            this.cancelButton.addEventListener("click", this.clickCancel.bind(this));
        };

        o.clickSubmit = function () {
            if (this.TOKENNUM === 0) {
                this.start();
            } else {
                this.clearOutput();
                this.start();
            }
        };

        o.clickCancel = function () {
            this.clearInput();
            this.clearOutput();
            this.inputTextarea.focus();
        };

        o.clearInput = function () {
            this.inputTextarea.value = "";
        };

        o.clearOutput = function () {
            this.TOKENNUM = 0;
            this.sourceCodeContainer.innerText = "";
            this.afterPreprocessContainer.innerText = "";
            this.tokenListTable.querySelector("thead").innerHTML = "";
            this.tokenListTable.querySelector("tbody").innerHTML = "";
        };

        o.setDataValue = function () {
            this.keyword = ["IF", "THEN", "ELSE", "GOTO"];
            this.operator = ["+", "-", "*", "/"];
            this.comparision = [">", ">=", "<", "<=", "=", "<>"];
            this.interpunction = [",", ":", "(", ")"];
        };

        o.start = function () {
            // Get Source Code
            this.inputStr = this.inputTextarea.value;
            this.sourceCodeContainer = document.querySelector(".source-code-container");
            this.sourceCodeContainer.innerText = this.inputStr;

            // Begin Pre Process
            this.inputStr = this.preProcess(this.inputStr);
            this.afterPreprocessContainer.innerText = this.inputStr;

            // Begin Process
            this.process(this.inputStr);
        };

        o.preProcess = function (_str) {
            var _tempStr = this._removeComment(_str);
            _tempStr = this._removeLineBreak(_tempStr);
            _tempStr = this._removeMultiSpace(_tempStr);
            _tempStr = this._addEOF(_tempStr);
            return _tempStr;
        };

        o._removeComment = function (_str) {
            var _regStr = "(/\\\*([^*]|[\\\r\\\n]|(\\\*+([^*/]|[\\\r\\\n])))*\\\*+/)|(//.*)";
            var _reg = new RegExp(_regStr,"g");
            return _str.replace(_reg, "");
        };

        o._removeLineBreak = function (_str) {
            var _reg = /\\\n/g;
            return _str.replace(_reg, "");
        };

        o._removeMultiSpace = function (_str) {
            var _reg = /\s+/g;
            return _str.replace(_reg, " ");
        };

        o._addEOF = function (_str) {
            return _str + "#";
        };

        o.process = function (_str) {
            var _length = _str.length;
            for (var i = 0; i < _length; 0) {
                if (_str[i] === ' ') {
                    i++;
                } else if (_str[i] === '#') {
                    break;
                } else if (this.isAlpha(_str[i])) {
                    i = this.letterProcess(i)
                } else if (this.isNum(_str[i])) {
                    i = this.numberProcess(i);
                } else {
                    i = this.otherProcess(i)
                }
            }
        };

        o.showToken = function (_value, _type) {
            if (this.TOKENNUM === 0) {
                this.createTableHead();
                this.TOKENNUM++;
            }

            var _tbody = this.tokenListTable.querySelector("tbody");
            _tbody.innerHTML += "<tr><th>" + this.TOKENNUM + "</th><th>" + _type + "</th><th>" + _value + "</th></tr>";
            if (_type === "ERROR") {
                this.showErrorToken(this.TOKENNUM);
            }
            this.TOKENNUM++;
        };

        o.createTableHead = function () {
            var _thead = this.tokenListTable.querySelector("thead");
            _thead.innerHTML = "<tr><th>#</th><th>Type</th><th>Value</th></tr>";
        };

        o.showErrorToken = function (_tokenNum) {
            var _tr = this.tokenListTable.querySelectorAll("tbody > tr");
            _tr[_tokenNum-1].classList.add("error-token");
        };

        o.letterProcess = function (_i) {
            var _letter = "";
            var _lineNum = "";
            while (this.isAlNum(this.inputStr[_i])) {
                _letter += this.inputStr[_i];
                _i++;
            }
            if (this.isLegal(_letter, this.keyword)) {
                this.showToken(_letter, "keyword");
                if (_letter === "GOTO") {
                    _i++;
                    while (this.isAlNum(this.inputStr[_i])) {
                        _lineNum += this.inputStr[_i];
                        _i++;
                    }
                    if (this.isInteger(_lineNum)) {
                        this.showToken(_lineNum, "linenumber");
                    } else {
                        this.showToken(_lineNum, "ERROR");
                    }
                }
            } else {
                this.showToken(_letter, "identifier");
            }
            return _i;
        };

        o.numberProcess = function (_i) {
            var _num = "";
            while (this.isNum(this.inputStr[_i])) {
                _num += this.inputStr[_i];
                _i++;
            }
            if (this.isAlpha(this.inputStr[_i])) {
                while (this.isAlNum(this.inputStr[_i])) {
                    _num += this.inputStr[_i];
                    _i++;
                }
                this.showToken(_num, "ERROR");
            } else if (this.inputStr[_i] === ":") {
                this.showToken(_num, "linenumber");
            } else {
                this.showToken(_num, "const");
            }
            return _i;
        };

        o.otherProcess = function (_i) {
            var _other = "";
            if (this.inputStr[_i] === "(") {
                _other += this.inputStr[_i];
                _i++;
            }
            while (!this.isAlNum(this.inputStr[_i]) &&
            (this.inputStr[_i] != " ") &&
            (this.inputStr[_i] != "(") &&
            (this.inputStr[_i] != ")")) {
                _other += this.inputStr[_i];
                _i++;
            }
            if (this.inputStr[_i] === ")") {
                _other += this.inputStr[_i];
                _i++;
            }

            if (this.isLegal(_other, this.operator) || this.isLegal(_other, this.comparision)) {
                this.showToken(_other, "operator");
            } else if (this.isLegal(_other, this.interpunction)) {
                this.showToken(_other, "delimiter");
            } else {
                this.showToken(_other, "ERROR");
            }
            return _i;
        };

        o.isLegal = function (_char, _type) {
            return !!(_type.includes(_char));
        };

        o.isNum = function (_char) {
            if (_char.length != 1) {
                return false;
            } else {
                var _reg = /\d/;
                return _reg.test(_char);
            }
        };

        o.isAlpha = function (_char) {
            if (_char.length != 1) {
                return false;
            } else {
                var _reg = /[a-zA-Z]/;
                return _reg.test(_char);
            }
        };

        o.isAlNum = function (_char) {
            return !!(this.isNum(_char) || this.isAlpha(_char))
        };

        o.isInteger = function (_str) {
            return parseInt(_str, 10) + "" === _str;
        };

        o.main();
        return o;
    }
};

var VC = ViewController.create();
var LA = LexicalAnalyser.create();