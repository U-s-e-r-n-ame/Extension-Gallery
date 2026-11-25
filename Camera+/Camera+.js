/*
 * Camera+ for Scratch / PenguinMod
 * Unsandboxed extension
 */
(function (Scratch) {
  'use strict';

  if (!Scratch || !Scratch.extensions || !Scratch.extensions.unsandboxed) {
    throw new Error('Camera+ requires an unsandboxed extension.');
  }

  class CameraPlus {
    constructor() {
      this.runtime = Scratch.vm && Scratch.vm.runtime;
      this.enabled = false;
      this.size = 100;
      this.x = 0;
      this.y = 0;
      this.flipX = false;
      this.flipY = false;
      this.effect = 'none';
      this.layer = 0;
      this.previousEnabled = false;
      this.canvas = null;
      this.original = null;
      this.styleTag = null;
      this._apply();
    }

    getInfo() {
      const menu = (items) => items.map(value => ({
        text: value,
        value
      }));

      return {
        id: 'cameraplus',
        name: 'Camera+',
        color1: '#10b98f',
        color2: '#0da77f',
        color3: '#078d6c',

        blocks: [
          {
            opcode: 'flipCamera',
            blockType: Scratch.BlockType.COMMAND,
            text: 'flip camera [DIRECTION]',
            arguments: {
              DIRECTION: {
                type: Scratch.ArgumentType.STRING,
                menu: 'flipDirection'
              }
            }
          },
          {
            opcode: 'applyEffect',
            blockType: Scratch.BlockType.COMMAND,
            text: 'apply effect [EFFECT]',
            arguments: {
              EFFECT: {
                type: Scratch.ArgumentType.STRING,
                menu: 'effects'
              }
            }
          },
          {
            opcode: 'anyEffects',
            blockType: Scratch.BlockType.BOOLEAN,
            text: 'any effects applied?'
          },
          {
            opcode: 'currentEffect',
            blockType: Scratch.BlockType.REPORTER,
            text: 'current camera effect'
          },
          {
            opcode: 'resetCamera',
            blockType: Scratch.BlockType.COMMAND,
            text: 'reset camera'
          },
          {
            opcode: 'cameraHat',
            blockType: Scratch.BlockType.HAT,
            text: 'when camera turned [STATE]',
            isEdgeActivated: true,
            arguments: {
              STATE: {
                type: Scratch.ArgumentType.STRING,
                menu: 'onOff'
              }
            }
          },
          {
            opcode: 'cameraWhile',
            blockType: Scratch.BlockType.HAT,
            text: 'while camera turned [STATE]',
            arguments: {
              STATE: {
                type: Scratch.ArgumentType.STRING,
                menu: 'onOff'
              }
            }
          },
          {
            opcode: 'isCameraOn',
            blockType: Scratch.BlockType.BOOLEAN,
            text: 'is camera [STATE]?',
            arguments: {
              STATE: {
                type: Scratch.ArgumentType.STRING,
                menu: 'onOff'
              }
            }
          },
          {
            opcode: 'setCameraOn',
            blockType: Scratch.BlockType.COMMAND,
            text: 'turn camera [STATE]',
            arguments: {
              STATE: {
                type: Scratch.ArgumentType.STRING,
                menu: 'onOff'
              }
            }
          },
          {
            opcode: 'setLayer',
            blockType: Scratch.BlockType.COMMAND,
            text: 'set camera to [LAYER] layer',
            arguments: {
              LAYER: {
                type: Scratch.ArgumentType.STRING,
                menu: 'frontBack'
              }
            }
          },
          {
            opcode: 'moveLayer',
            blockType: Scratch.BlockType.COMMAND,
            text: 'move camera [AMOUNT] layers [DIRECTION]',
            arguments: {
              AMOUNT: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 1
              },
              DIRECTION: {
                type: Scratch.ArgumentType.STRING,
                menu: 'forwardBackward'
              }
            }
          },
          {
            opcode: 'setValue',
            blockType: Scratch.BlockType.COMMAND,
            text: 'set camera [PROPERTY] to [VALUE]',
            arguments: {
              PROPERTY: {
                type: Scratch.ArgumentType.STRING,
                menu: 'properties'
              },
              VALUE: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 100
              }
            }
          },
          {
            opcode: 'getValue',
            blockType: Scratch.BlockType.REPORTER,
            text: 'camera [PROPERTY]',
            arguments: {
              PROPERTY: {
                type: Scratch.ArgumentType.STRING,
                menu: 'reportProperties'
              }
            }
          }
        ],

        menus: {
          flipDirection: menu([
            'horizontally',
            'vertically'
          ]),
          effects: menu([
            'sepia',
            'grayscale',
            'invert',
            'negative brightness',
            'negative colors'
          ]),
          onOff: menu(['on', 'off']),
          frontBack: menu(['front', 'back']),
          forwardBackward: menu(['forward', 'backward']),
          properties: menu([
            'size',
            'x position',
            'y position'
          ]),
          reportProperties: menu([
            'size',
            'x position',
            'y position'
          ])
        }
      };
    }

    _getCanvas() {
      const renderer = this.runtime && this.runtime.renderer;

      return (renderer && renderer.canvas) ||
        document.querySelector('.stage canvas') ||
        document.querySelector('canvas');
    }

    _rememberCanvas(canvas) {
      if (!canvas || canvas === this.canvas) return;

      this.canvas = canvas;

      this.original = {
        transform: canvas.style.transform,
        transformOrigin: canvas.style.transformOrigin,
        filter: canvas.style.filter,
        position: canvas.style.position,
        zIndex: canvas.style.zIndex,
        willChange: canvas.style.willChange
      };
    }

    _filter() {
      switch (this.effect) {
        case 'sepia':
          return 'sepia(1)';
        case 'grayscale':
          return 'grayscale(1)';
        case 'invert':
          return 'invert(1)';
        case 'negative brightness':
          return 'brightness(0) contrast(200%)';
        case 'negative colors':
          return 'invert(1) hue-rotate(180deg)';
        default:
          return 'none';
      }
    }

    _apply() {
      const canvas = this._getCanvas();

      if (!canvas) return;

      this._rememberCanvas(canvas);

      if (!this.original) return;

      if (!this.enabled) {
        canvas.style.transform = this.original.transform;
        canvas.style.filter = this.original.filter;
        canvas.style.zIndex = this.original.zIndex;
        canvas.style.position = this.original.position;
        canvas.style.willChange = this.original.willChange;
        return;
      }

      const sx = this.flipX ? -1 : 1;
      const sy = this.flipY ? -1 : 1;

      canvas.style.transformOrigin = 'center center';

      canvas.style.transform =
        `translate(${this.x}px, ${this.y}px) ` +
        `scale(${this.size / 100}) scale(${sx}, ${sy})`;

      canvas.style.filter = this._filter();
      canvas.style.position = 'relative';
      canvas.style.zIndex = String(this.layer);
      canvas.style.willChange = 'transform, filter';
    }

    _setEffect(effect) {
      this.effect = effect;
      this.enabled = true;
      this._apply();
    }

    flipCamera(args) {
      if (args.DIRECTION === 'horizontally') {
        this.flipX = !this.flipX;
      } else {
        this.flipY = !this.flipY;
      }

      this.enabled = true;
      this._apply();
    }

    applyEffect(args) {
      this._setEffect(args.EFFECT);
    }

    anyEffects() {
      return this.effect !== 'none';
    }

    currentEffect() {
      return this.effect === 'none' ? 'none' : this.effect;
    }

    resetCamera() {
      this.enabled = false;
      this.size = 100;
      this.x = 0;
      this.y = 0;
      this.flipX = false;
      this.flipY = false;
      this.effect = 'none';
      this.layer = 0;

      this._apply();
    }

    cameraHat(args) {
      const wanted = args.STATE === 'on';
      const now = this.enabled === wanted;
      const edge = now && this.previousEnabled !== this.enabled;

      this.previousEnabled = this.enabled;

      return edge;
    }

    cameraWhile(args) {
      return this.enabled === (args.STATE === 'on');
    }

    isCameraOn(args) {
      return this.enabled === (args.STATE === 'on');
    }

    setCameraOn(args) {
      this.enabled = args.STATE === 'on';
      this._apply();
    }

    setLayer(args) {
      this.layer = args.LAYER === 'front' ? 100 : -1;
      this.enabled = true;
      this._apply();
    }

    moveLayer(args) {
      const amount = Math.max(0, Number(args.AMOUNT) || 0);

      this.layer += args.DIRECTION === 'forward'
        ? amount
        : -amount;

      this.enabled = true;
      this._apply();
    }

    setValue(args) {
      const value = Number(args.VALUE) || 0;

      if (args.PROPERTY === 'size') {
        this.size = Math.max(1, Math.min(1000, value));
      }

      if (args.PROPERTY === 'x position') {
        this.x = value;
      }

      if (args.PROPERTY === 'y position') {
        this.y = value;
      }

      this.enabled = true;
      this._apply();
    }

    getValue(args) {
      if (args.PROPERTY === 'size') return this.size;
      if (args.PROPERTY === 'x position') return this.x;

      return this.y;
    }
  }

  Scratch.extensions.register(new CameraPlus());

})(Scratch);