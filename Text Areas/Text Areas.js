
(function (Scratch) {
  'use strict';

  if (!Scratch.extensions.unsandboxed) {
    throw new Error('Text Areas requires an unsandboxed extension.');
  }

  const areas = new Map();
  let nextId = 1;

  const fonts = [
    'Sans Serif',
    'Serif',
    'Scratch Handwriting',
    'Scratch Marker',
    'Scratch Curly',
    'Scratch Pixel',
    'Cursive',
    'A Goblin Appears!',
    'Bold Sans Serif',
    'Edu TAS Beginner'
  ];

  const symbols = [
    '•',
    '●',
    '■',
    '#',
    'do not show anything in text area'
  ];

  const fontMap = {
    'Sans Serif': 'Arial, sans-serif',
    'Serif': 'Georgia, serif',
    'Scratch Handwriting': 'Comic Sans MS, cursive',
    'Scratch Marker': 'Impact, sans-serif',
    'Scratch Curly': 'cursive',
    'Scratch Pixel': 'monospace',
    'Cursive': 'cursive',
    'A Goblin Appears!': 'fantasy',
    'Bold Sans Serif': 'Arial Black, sans-serif',
    'Edu TAS Beginner': 'Comic Sans MS, cursive'
  };

  function getCanvas() {
    return Scratch.vm.runtime.renderer.canvas;
  }

  function updatePosition(area) {
    const canvas = getCanvas();
    if (!canvas || !area.element) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = rect.width / 480;
    const scaleY = rect.height / 360;

    area.element.style.left =
      (rect.left + (area.x1 + 240) * scaleX) + 'px';

    area.element.style.top =
      (rect.top + (180 - area.y2) * scaleY) + 'px';

    area.element.style.width =
      Math.max(1, (area.x2 - area.x1) * scaleX) + 'px';

    area.element.style.height =
      Math.max(1, (area.y2 - area.y1) * scaleY) + 'px';
  }

  function updateAll() {
    for (const area of areas.values()) {
      updatePosition(area);
    }
  }

  window.addEventListener('resize', updateAll);
  window.addEventListener('scroll', updateAll, true);

  function getArea(id) {
    return areas.get(String(id));
  }

  class TextAreas {
    getInfo() {
      return {
        id: 'lucidtextareas',
        name: 'Text Areas',
        color1: '#FFBF26',
        color2: '#E6A800',
        color3: '#CC9200',

        blocks: [
          {
            opcode: 'create',
            blockType: Scratch.BlockType.COMMAND,
            text: 'create new text area with ID: [ID]',
            arguments: {
              ID: { type: Scratch.ArgumentType.NUMBER, defaultValue: 1 }
            }
          },
          {
            opcode: 'setRange',
            blockType: Scratch.BlockType.COMMAND,
            text: 'Set text area with ID: [ID] ranges to x1: [X1] y1: [Y1] x2: [X2] y2: [Y2]',
            arguments: {
              ID: { type: Scratch.ArgumentType.NUMBER, defaultValue: 1 },
              X1: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 },
              Y1: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 },
              X2: { type: Scratch.ArgumentType.NUMBER, defaultValue: 100 },
              Y2: { type: Scratch.ArgumentType.NUMBER, defaultValue: 100 }
            }
          },

          ...fonts.map((font, i) => ({
            opcode: 'setFont' + i,
            blockType: Scratch.BlockType.COMMAND,
            text: 'set font family for text area with ID: [ID] to ' + font,
            arguments: {
              ID: { type: Scratch.ArgumentType.NUMBER, defaultValue: 1 }
            }
          })),

          {
            opcode: 'show',
            blockType: Scratch.BlockType.COMMAND,
            text: 'show text area with ID: [ID]',
            arguments: {
              ID: { type: Scratch.ArgumentType.NUMBER, defaultValue: 1 }
            }
          },
          {
            opcode: 'hide',
            blockType: Scratch.BlockType.COMMAND,
            text: 'hide text area with ID: [ID]',
            arguments: {
              ID: { type: Scratch.ArgumentType.NUMBER, defaultValue: 1 }
            }
          },
          {
            opcode: 'showAll',
            blockType: Scratch.BlockType.COMMAND,
            text: 'show all text areas'
          },
          {
            opcode: 'hideAll',
            blockType: Scratch.BlockType.COMMAND,
            text: 'hide all text areas'
          },

          {
            opcode: 'setStyle',
            blockType: Scratch.BlockType.COMMAND,
            text: 'set [STYLE] on text area with ID: [ID] to [VALUE]',
            arguments: {
              STYLE: {
                type: Scratch.ArgumentType.STRING,
                menu: 'styles'
              },
              ID: { type: Scratch.ArgumentType.NUMBER, defaultValue: 1 },
              VALUE: { type: Scratch.ArgumentType.STRING, defaultValue: '20' }
            }
          },
          {
            opcode: 'fontFamily',
            blockType: Scratch.BlockType.REPORTER,
            text: 'font family on text area with ID: [ID]',
            arguments: {
              ID: { type: Scratch.ArgumentType.NUMBER, defaultValue: 1 }
            }
          },
          {
            opcode: 'fontColor',
            blockType: Scratch.BlockType.REPORTER,
            text: '[STYLE] on text area with ID: [ID]',
            arguments: {
              STYLE: {
                type: Scratch.ArgumentType.STRING,
                menu: 'colorStyles'
              },
              ID: { type: Scratch.ArgumentType.NUMBER, defaultValue: 1 }
            }
          },
          {
            opcode: 'getX1',
            blockType: Scratch.BlockType.REPORTER,
            text: 'x1 of text area with ID: [ID]',
            arguments: {
              ID: { type: Scratch.ArgumentType.NUMBER, defaultValue: 1 }
            }
          },
          {
            opcode: 'lock',
            blockType: Scratch.BlockType.COMMAND,
            text: '[ACTION] contents in text area with ID: [ID]',
            arguments: {
              ACTION: { type: Scratch.ArgumentType.STRING, menu: 'lockActions' },
              ID: { type: Scratch.ArgumentType.NUMBER, defaultValue: 1 }
            }
          },
          {
            opcode: 'setContents',
            blockType: Scratch.BlockType.COMMAND,
            text: 'set contents in text area with ID: [ID] to [VALUE]',
            arguments: {
              ID: { type: Scratch.ArgumentType.NUMBER, defaultValue: 1 },
              VALUE: { type: Scratch.ArgumentType.STRING, defaultValue: 'Hello!' }
            }
          },
          {
            opcode: 'contents',
            blockType: Scratch.BlockType.REPORTER,
            text: 'contents in text area with ID: [ID]',
            arguments: {
              ID: { type: Scratch.ArgumentType.NUMBER, defaultValue: 1 }
            }
          },

          {
            opcode: 'password',
            blockType: Scratch.BlockType.COMMAND,
            text: '[ACTION] password mode for text area with ID: [ID]',
            arguments: {
              ACTION: { type: Scratch.ArgumentType.STRING, menu: 'passwordActions' },
              ID: { type: Scratch.ArgumentType.NUMBER, defaultValue: 1 }
            }
          },
          {
            opcode: 'setSymbol',
            blockType: Scratch.BlockType.COMMAND,
            text: 'set password symbol for text area with ID: [ID] to [SYMBOL]',
            arguments: {
              ID: { type: Scratch.ArgumentType.NUMBER, defaultValue: 1 },
              SYMBOL: { type: Scratch.ArgumentType.STRING, menu: 'symbols' }
            }
          },
          {
            opcode: 'passwordEnabled',
            blockType: Scratch.BlockType.BOOLEAN,
            text: 'password mode for text area with ID: [ID] enabled?',
            arguments: {
              ID: { type: Scratch.ArgumentType.NUMBER, defaultValue: 1 }
            }
          },

          {
            opcode: 'count',
            blockType: Scratch.BlockType.REPORTER,
            text: 'number of text areas'
          },
          {
            opcode: 'shownCount',
            blockType: Scratch.BlockType.REPORTER,
            text: 'number of shown text areas'
          },
          {
            opcode: 'hiddenCount',
            blockType: Scratch.BlockType.REPORTER,
            text: 'number of hidden text areas'
          },
          {
            opcode: 'exists',
            blockType: Scratch.BlockType.BOOLEAN,
            text: 'text area with ID: [ID] exists?',
            arguments: {
              ID: { type: Scratch.ArgumentType.NUMBER, defaultValue: 1 }
            }
          },
          {
            opcode: 'delete',
            blockType: Scratch.BlockType.COMMAND,
            text: 'delete text area with ID: [ID]',
            arguments: {
              ID: { type: Scratch.ArgumentType.NUMBER, defaultValue: 1 }
            }
          },
          {
            opcode: 'deleteAll',
            blockType: Scratch.BlockType.COMMAND,
            text: 'delete all text areas'
          }
        ],

        menus: {
          styles: {
            acceptReporters: true,
            items: ['font color', 'font size', 'background color', 'sample text']
          },
          colorStyles: {
            acceptReporters: false,
            items: ['font color', 'background color']
          },
          lockActions: {
            acceptReporters: false,
            items: ['lock', 'unlock']
          },
          passwordActions: {
            acceptReporters: false,
            items: ['enable', 'disable']
          },
          symbols: {
            acceptReporters: false,
            items: symbols
          }
        }
      };
    }

    create(args) {
      const id = String(args.ID);

      if (areas.has(id)) return;

      const element = document.createElement('textarea');

      element.style.cssText = `
        position: fixed;
        z-index: 999999;
        display: none;
        box-sizing: border-box;
        resize: none;
        padding: 5px;
        border: 1px solid #888;
        border-radius: 3px;
        outline: none;
        font-family: Arial, sans-serif;
        font-size: 20px;
        color: #000000;
        background: #ffffff;
        overflow: auto;
      `;

      document.body.appendChild(element);

      const area = {
        element,
        x1: 0,
        y1: 0,
        x2: 100,
        y2: 100,
        shown: false,
        password: false,
        symbol: '•',
        font: 'Sans Serif',
        locked: false
      };

      areas.set(id, area);
      updatePosition(area);
    }

    setRange(args) {
      const a = getArea(args.ID);
      if (!a) return;

      a.x1 = Number(args.X1) || 0;
      a.y1 = Number(args.Y1) || 0;
      a.x2 = Number(args.X2) || 0;
      a.y2 = Number(args.Y2) || 0;

      updatePosition(a);
    }

    setFont(id, font) {
      const a = getArea(id);
      if (!a) return;

      a.font = font;
      a.element.style.fontFamily = fontMap[font] || font;
    }

    setFont0(a) { this.setFont(a.ID, fonts[0]); }
    setFont1(a) { this.setFont(a.ID, fonts[1]); }
    setFont2(a) { this.setFont(a.ID, fonts[2]); }
    setFont3(a) { this.setFont(a.ID, fonts[3]); }
    setFont4(a) { this.setFont(a.ID, fonts[4]); }
    setFont5(a) { this.setFont(a.ID, fonts[5]); }
    setFont6(a) { this.setFont(a.ID, fonts[6]); }
    setFont7(a) { this.setFont(a.ID, fonts[7]); }
    setFont8(a) { this.setFont(a.ID, fonts[8]); }
    setFont9(a) { this.setFont(a.ID, fonts[9]); }

    setStyle(args) {
      const a = getArea(args.ID);
      if (!a) return;

      const el = a.element;
      const value = String(args.VALUE);

      switch (args.STYLE) {
        case 'font color':
          el.style.color = value;
          break;
        case 'font size':
          el.style.fontSize = Math.max(1, Number(value) || 20) + 'px';
          break;
        case 'background color':
          el.style.backgroundColor = value;
          break;
        case 'sample text':
          el.placeholder = value;
          break;
      }
    }

    show(args) {
      const a = getArea(args.ID);
      if (!a) return;
      a.shown = true;
      a.element.style.display = 'block';
      updatePosition(a);
    }

    hide(args) {
      const a = getArea(args.ID);
      if (!a) return;
      a.shown = false;
      a.element.style.display = 'none';
    }

    showAll() {
      for (const a of areas.values()) {
        a.shown = true;
        a.element.style.display = 'block';
        updatePosition(a);
      }
    }

    hideAll() {
      for (const a of areas.values()) {
        a.shown = false;
        a.element.style.display = 'none';
      }
    }

    fontFamily(args) {
      return getArea(args.ID)?.font || '';
    }

    fontColor(args) {
      const a = getArea(args.ID);
      if (!a) return '';
      return args.STYLE === 'font color'
        ? a.element.style.color
        : a.element.style.backgroundColor;
    }

    getX1(args) {
      return getArea(args.ID)?.x1 ?? 0;
    }

    lock(args) {
      const a = getArea(args.ID);
      if (!a) return;

      a.locked = args.ACTION === 'lock';
      a.element.readOnly = a.locked;
    }

    setContents(args) {
      const a = getArea(args.ID);
      if (a) a.element.value = String(args.VALUE);
    }

    contents(args) {
      return getArea(args.ID)?.element.value || '';
    }

    password(args) {
      const a = getArea(args.ID);
      if (!a) return;

      a.password = args.ACTION === 'enable';
      this.applyPassword(a);
    }

    setSymbol(args) {
      const a = getArea(args.ID);
      if (!a) return;

      a.symbol = args.SYMBOL;
      this.applyPassword(a);
    }

    applyPassword(a) {
      const el = a.element;

      if (!a.password) {
        el.style.webkitTextSecurity = 'none';
        el.style.color = '';
        return;
      }

      if (a.symbol === 'do not show anything in text area') {
        el.style.webkitTextSecurity = 'none';
        el.style.color = 'transparent';
        el.style.caretColor = '#000000';
      } else {
        el.style.color = '';
        el.style.caretColor = '';
        el.style.webkitTextSecurity =
          a.symbol === '■' || a.symbol === '#'
            ? 'square'
            : a.symbol === '•'
              ? 'disc'
              : 'circle';
      }
    }

    passwordEnabled(args) {
      return getArea(args.ID)?.password || false;
    }

    count() {
      return areas.size;
    }

    shownCount() {
      return [...areas.values()].filter(a => a.shown).length;
    }

    hiddenCount() {
      return [...areas.values()].filter(a => !a.shown).length;
    }

    exists(args) {
      return areas.has(String(args.ID));
    }

    delete(args) {
      const id = String(args.ID);
      const a = getArea(id);
      if (!a) return;

      a.element.remove();
      areas.delete(id);
    }

    deleteAll() {
      for (const a of areas.values()) {
        a.element.remove();
      }
      areas.clear();
    }
  }

  Scratch.extensions.register(new TextAreas());
})(Scratch);
