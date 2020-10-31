
class Input {
    constructor(canvas) {
        this.canvas = canvas;
        this.doc = canvas.ownerDocument;
        this[Symbol.for("callbacks")] = ("keydown,keyup,mousedown,mouseup,mousemove,mousewheel,wheelup,wheeldown,pointerlockchange").split(",")
            .reduce((obj, event) => {
                obj[event] = [];
                return obj;
            }, {});
        this.keys = [];
        canvas.requestPointerLock = canvas.requestPointerLock    ||
                                    canvas.mozRequestPointerLock ||
                                    canvas.webkitRequestPointerLock;
        this.autoLock = false;
        this.locked = false;
        this.doc.addEventListener("pointerlockchange", (e) => {
            let locked = document.pointerLockElement === this.canvas;
            if (this.locked !== locked)
                this[Symbol.for("onPointerLockChange")](e, locked);
            this.locked = locked;
        });
        this.doc.addEventListener("keydown", this[Symbol.for("onKeyDown")].bind(this), false);
        this.doc.addEventListener("keyup", this[Symbol.for("onKeyUp")].bind(this), false);
        canvas.addEventListener("mousedown", this[Symbol.for("onMouseDown")].bind(this), false);
        canvas.addEventListener("mouseup", this[Symbol.for("onMouseUp")].bind(this), false);
        canvas.addEventListener("mousemove", this[Symbol.for("onMouseMove")].bind(this), false);
        canvas.addEventListener("mousewheel", this[Symbol.for("onMouseWheel")].bind(this), false);
        canvas.addEventListener("DOMMouseScroll", this[Symbol.for("onMouseWheel")].bind(this), false);
        canvas.addEventListener("contextmenu", e => {e.preventDefault();}, false);
        this.addEventListener("mousewheel", (e) => {
            if (e.deltaY < 0) this[Symbol.for("targetEvent")]("wheelup", e, this.locked);
            else if (e.deltaY > 0) this[Symbol.for("targetEvent")]("wheeldown", e, this.locked);
        });

        const keyEvt = {
            w: {down: new KeyboardEvent("keydown", {
                    bubbles: true, cancelable: true,
                    key: "w", code: "KeyW", keyCode: 87, repeat: true, which: 87,
                }),
                up: new KeyboardEvent("keyup", {
                    bubbles: true, cancelable: true,
                    key: "w", code: "KeyW", keyCode: 87, repeat: true, which: 87,
                })},
            a: {down: new KeyboardEvent("keydown", {
                    bubbles: true, cancelable: true,
                    key: "a", code: "KeyA", keyCode: 65, repeat: true, which: 65,
                }),
                up: new KeyboardEvent("keyup", {
                    bubbles: true, cancelable: true,
                    key: "a", code: "KeyA", keyCode: 65, repeat: false, which: 65,
                })},
            s: {down: new KeyboardEvent("keydown", {
                    bubbles: true, cancelable: true,
                    key: "s", code: "KeyS", keyCode: 83, repeat: true, which: 83,
                }),
                up: new KeyboardEvent("keyup", {
                    bubbles: true, cancelable: true,
                    key: "s", code: "KeyS", keyCode: 83, repeat: false, which: 83,
                })},
            d: {down: new KeyboardEvent("keydown", {
                    bubbles: true, cancelable: true,
                    key: "d", code: "KeyD", keyCode: 68, repeat: true, which: 68,
                }),
                up: new KeyboardEvent("keyup", {
                    bubbles: true, cancelable: true,
                    key: "d", code: "KeyD", keyCode: 68, repeat: false, which: 68,
                })},
            space: {down: new KeyboardEvent("keydown", {
                    bubbles: true, cancelable: true,
                    key: " ", code: "Space", keyCode: 32, repeat: true, which: 32,
                }),up: new KeyboardEvent("keyup", {
                    bubbles: true, cancelable: true,
                    key: " ", code: "Space", keyCode: 32, repeat: false, which: 32,
                })},
            shift: {down: new KeyboardEvent("keydown", {
                    bubbles: true, cancelable: true,
                    key: "Shift", code: "ShiftLeft", keyCode: 16, repeat: true, which: 16, location: 1, shiftKey: true,
                }),up: new KeyboardEvent("keyup", {
                    bubbles: true, cancelable: true,
                    key: "Shift", code: "ShiftLeft", keyCode: 16, repeat: true, which: 16, location: 0, shiftKey: false,
                })},
            x: {down: new KeyboardEvent("keydown", {
                    bubbles: true, cancelable: true,
                    key: "x", code: "KeyX", keyCode: 88, repeat: true, which: 88,
                }),up: new KeyboardEvent("keyup", {
                    bubbles: true, cancelable: true,
                    key: "x", code: "KeyX", keyCode: 88, repeat: false, which: 88,
                })},
        };
        let lastMoveBtn = null;
        let moveBtns = document.getElementsByClassName("mc-move-buttons")[0];
        this.moveBtns = moveBtns;
        window.moveBtns = moveBtns;
        const activeMoveBtn = (btn, e) => {
            if (!btn) return;
            btn.setAttribute("active", "ture");
            const classList = [...btn.classList];
            if (classList.includes("mc-move-btn-up")) {
                for (let b of moveBtns.querySelectorAll('[class*="mc-move-btn-up"]'))
                    b.style.display = "";
                document.body.dispatchEvent(keyEvt.w.down);
            }
            else if (classList.includes("mc-move-btn-fly")) {
                for (let b of moveBtns.querySelectorAll(".mc-move-btn-up, .mc-move-btn-down"))
                    b.style.display = "none";
                for (let b of moveBtns.querySelectorAll('[class*="mc-move-btn-fly"]'))
                    b.style.display = "";
            }
            else if (classList.includes("mc-move-btn-left"))
                document.body.dispatchEvent(keyEvt.a.down);
            else if (classList.includes("mc-move-btn-down"))
                document.body.dispatchEvent(keyEvt.s.down);
            else if (classList.includes("mc-move-btn-right"))
                document.body.dispatchEvent(keyEvt.d.down);
            else if (classList.includes("mc-move-btn-upleft")) {
                document.body.dispatchEvent(keyEvt.w.down);
                document.body.dispatchEvent(keyEvt.a.down);
            }
            else if (classList.includes("mc-move-btn-upright")) {
                document.body.dispatchEvent(keyEvt.w.down);
                document.body.dispatchEvent(keyEvt.d.down);
            }
            else if (classList.includes("mc-move-btn-jump"))
                document.body.dispatchEvent(keyEvt.space.down);
            else if (classList.includes("mc-move-btn-flyup"))
                document.body.dispatchEvent(keyEvt.space.down);
            else if (classList.includes("mc-move-btn-flydown"))
                document.body.dispatchEvent(keyEvt.shift.down);
        };
        const inactiveMoveBtn = (btn, e) => {
            if (!btn) return;
            btn.removeAttribute("active");
            const classList = [...btn.classList];
            if (classList.find(s => /mc-move-btn-up.*/g.test(s))) {
                let btns = moveBtns.querySelectorAll('[class*="mc-move-btn-up"]');
                let hasActive = [...btns].find(b => b.getAttribute("active"));
                if (!hasActive) {
                    for (let b of btns)
                        if (![...b.classList].includes("mc-move-btn-up"))
                            b.style.display = "none";
                }
            }
            else if (classList.find(s => /mc-move-btn-fly.*/g.test(s))) {
                let btns = moveBtns.querySelectorAll('[class*="mc-move-btn-fly"]');
                let hasActive = [...btns].find(b => b.getAttribute("active"));
                if (!hasActive) {
                    for (let b of btns)
                        if (![...b.classList].includes("mc-move-btn-fly"))
                            b.style.display = "none";
                    for (let b of moveBtns.querySelectorAll(".mc-move-btn-up, .mc-move-btn-down"))
                        b.style.display = "";
                }
            }
            if (classList.includes("mc-move-btn-up"))
                document.body.dispatchEvent(keyEvt.w.up);
            else if (classList.includes("mc-move-btn-left"))
                document.body.dispatchEvent(keyEvt.a.up);
            else if (classList.includes("mc-move-btn-down"))
                document.body.dispatchEvent(keyEvt.s.up);
            else if (classList.includes("mc-move-btn-right"))
                document.body.dispatchEvent(keyEvt.d.up);
            else if (classList.includes("mc-move-btn-upleft")) {
                document.body.dispatchEvent(keyEvt.w.up);
                document.body.dispatchEvent(keyEvt.a.up);
            }
            else if (classList.includes("mc-move-btn-upright")) {
                document.body.dispatchEvent(keyEvt.w.up);
                document.body.dispatchEvent(keyEvt.d.up);
            }
            else if (classList.includes("mc-move-btn-jump"))
                document.body.dispatchEvent(keyEvt.space.up);
            else if (classList.includes("mc-move-btn-flyup"))
                document.body.dispatchEvent(keyEvt.space.up);
            else if (classList.includes("mc-move-btn-flydown"))
                document.body.dispatchEvent(keyEvt.shift.up);
            else if (classList.includes("mc-move-btn-fly")) {
                if (e.target === btn && this.onFlyBtnClick)
                    this.onFlyBtnClick();
            }
        };
        moveBtns.addEventListener("touchstart", function(e) {
            e.preventDefault();
            let ele = document.elementFromPoint(e.targetTouches[0].clientX, e.targetTouches[0].clientY);
            activeMoveBtn(ele, e);
            if (lastMoveBtn !== ele) inactiveMoveBtn(lastMoveBtn, e);
            lastMoveBtn = ele;
        });
        function touchend(e) {
            e.preventDefault();
            inactiveMoveBtn(lastMoveBtn, e);
            lastMoveBtn = null;
        }
        moveBtns.addEventListener("touchend", touchend);
        moveBtns.addEventListener("touchcancel", touchend);
        moveBtns.addEventListener("touchmove", function(e) {
            e.preventDefault();
            let ele = document.elementFromPoint(e.targetTouches[0].clientX, e.targetTouches[0].clientY);
            activeMoveBtn(ele, e);
            if (lastMoveBtn !== ele) inactiveMoveBtn(lastMoveBtn, e);
            lastMoveBtn = ele;
        });
    };
    // 鼠标点击第一次锁定，同时让注册的回调函数只有在鼠标锁定的情况下才回调
    enableAutoPointerLock() {
        if (this.autoLock !== false) return;
        this[Symbol.for("callbacks")].mousedown.unshift((e, locked) => {
            if (!locked) {
                this.canvas.requestPointerLock();
                return false;
            }
        });
        Object.entries(this[Symbol.for("callbacks")]).forEach(([event, cbs]) => {
            if (event === "mousedown" || event === "pointerlockchange") return;
            cbs.unshift((_, locked) => locked);
        });
        this.autoLock = true;
    };
    disableAutoPointerLock() {
        if (this.autoLock === false) return;
        Object.values(this[Symbol.for("callbacks")]).forEach(cbs => cbs.shift());
        this.autoLock = false;
    };
    requestPointerLock() {
        if (window.isTouchDevice) return;
        this.canvas.requestPointerLock();
    };
    exitPointerLock() {
        if (window.isTouchDevice) return;
        this.doc.exitPointerLock();
    };

    [Symbol.for("onKeyDown")](e) {
        this.keys[e.keyCode] = this.keys[String.fromCharCode(e.keyCode)] = true;
        this[Symbol.for("targetEvent")]("keydown", e, this.locked);
        return true;
    };
    [Symbol.for("onKeyUp")](e) {
        this.keys[e.keyCode] = this.keys[String.fromCharCode(e.keyCode)] = false;
        this[Symbol.for("targetEvent")]("keyup", e, this.locked);
        return true;
    };
    [Symbol.for("onMouseDown")](e) {
        this[Symbol.for("targetEvent")]("mousedown", e, this.locked);
        return true;
    };
    [Symbol.for("onMouseUp")](e) {
        this[Symbol.for("targetEvent")]("mouseup", e, this.locked);
        return true;
    };
    [Symbol.for("onMouseMove")](e) {
        this[Symbol.for("targetEvent")]("mousemove", e, this.locked);
        return true;
    };
    [Symbol.for("onMouseWheel")](e) {
        this[Symbol.for("targetEvent")]("mousewheel", e, this.locked);
        return true;
    };
    [Symbol.for("onPointerLockChange")](e, locked) {
        this[Symbol.for("targetEvent")]("pointerlockchange", e, locked);
        return true;
    };

    [Symbol.for("targetEvent")](event, ...arg) {
        if (event in this[Symbol.for("callbacks")])
            for (let fn of this[Symbol.for("callbacks")][event])
                if (fn.apply(this, arg) === false)
                    break;
    };

    addEventListener(event, callback) {
        if (event in this[Symbol.for("callbacks")])
            this[Symbol.for("callbacks")][event].push(callback);
        else throw "Input addEventListener error: Unrecognized event \"" + event + '"';
    };
    removeEventListener(event, callback) {
        if (!(event in this[Symbol.for("callbacks")])) return false;
        return this[Symbol.for("callbacks")][event].some((cb, i, cbs) => {
            if (cb === callback) {
                cbs.splice(i, 1);
                return true;
            }
            return false;
        });
    };
};

export {
    Input,
    Input as default
};
