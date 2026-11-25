/* TurboWarp Bit Resolution Controls
 * Custom extension for TurboWarp.
 * IMPORTANT: Load with "Run extension without sandbox" enabled.
 */
(function (Scratch) {
  'use strict';

  if (!Scratch.extensions.unsandboxed) {
    throw new Error('Bit Resolution Controls requires "Run extension without sandbox".');
  }

  // Second installation confirmation
  const accepted = window.confirm(
    'Install Bit Resolution Controls?\n\n' +
    'WARNING: This extension applies a color-quantization filter across the stage. ' +
    'Changing the setting may take time and can make the project look very different. ' +
    'Higher settings may be limited by your browser or computer. ' +
    'You can restore the normal appearance with "reset bit resolution settings".\n\n' +
    'Do you really want to install this extension?'
  );
  if (!accepted) return;

  const vm = Scratch.vm;
  const runtime = vm && vm.runtime;
  const renderer = runtime && runtime.renderer;

  const MODES = [
    'mono (DANGEROUS)',
    '8 bit',
    '16 bit',
    '24 bit',
    '32 bit',
    '64 bit',
    '128 bit',
    '256 bit'
  ];

  const PALETTES = {
    'mono (DANGEROUS)': [2, 2, 2],
    '8 bit': [8, 8, 4],
    '16 bit': [32, 64, 32],
    '24 bit': [256, 256, 256],
    '32 bit': [256, 256, 256],
    '64 bit': [256, 256, 256],
    '128 bit': [256, 256, 256],
    '256 bit': [256, 256, 256]
  };

  class BitResolutionControls {
    constructor() {
      this.resolution = '24 bit';
      this.unsupportedMode = 'round';
      this.svgId = 'tw-bit-resolution-svg';
      this.filterId = 'tw-bit-resolution-filter';
      this.channelIds = [
        'tw-bit-resolution-r',
        'tw-bit-resolution-g',
        'tw-bit-resolution-b'
      ];
      this.canvas = null;
      this.previousFilter = '';
      this.ensureFilter();
      this.applyResolution();
    }

    getInfo() {
      return {
        id: 'bitresolution',
        name: 'Bit Resolution',
        color1: '#b7cd6f',
        color2: '#a5bf5c',
        color3: '#8da94b',
        blocks: [
          {
            opcode: 'setResolution',
            blockType: Scratch.BlockType.COMMAND,
            text: 'set bit resolution to [RESOLUTION]',
            arguments: {
              RESOLUTION: {
                type: Scratch.ArgumentType.STRING,
                menu: 'resolutions',
                defaultValue: '24 bit'
              }
            }
          },
          {
            opcode: 'whenResolutionSet',
            blockType: Scratch.BlockType.HAT,
            text: 'when bit resolution set to [RESOLUTION]',
            isEdgeActivated: false,
            arguments: {
              RESOLUTION: {
                type: Scratch.ArgumentType.STRING,
                menu: 'resolutions',
                defaultValue: '8 bit'
              }
            }
          },
          {
            opcode: 'currentResolution',
            blockType: Scratch.BlockType.REPORTER,
            text: 'current bit resolution'
          },
          {
            opcode: 'isResolution',
            blockType: Scratch.BlockType.BOOLEAN,
            text: 'is bit resolution [RESOLUTION] ?',
            arguments: {
              RESOLUTION: {
                type: Scratch.ArgumentType.STRING,
                menu: 'resolutions',
                defaultValue: '64 bit'
              }
            }
          },
          {
            opcode: 'unsupportedColors',
            blockType: Scratch.BlockType.COMMAND,
            text: "if there are colors that aren't in the bit resolution, [MODE]",
            arguments: {
              MODE: {
                type: Scratch.ArgumentType.STRING,
                menu: 'unsupportedModes',
                defaultValue: 'round unsupported colors to nearest like bit-supported color'
              }
            }
          },
          {
            opcode: 'resetSettings',
            blockType: Scratch.BlockType.COMMAND,
            text: 'reset bit resolution settings'
          }
        ],
        menus: {
          resolutions: {
            acceptReporters: true,
            items: MODES
          },
          unsupportedModes: {
            acceptReporters: true,
            items: [
              'round unsupported colors to nearest like bit-supported color',
              'replace unsupported colors with black'
            ]
          }
        }
      };
    }

    ensureFilter() {
      if (document.getElementById(this.svgId)) return;

      const svg = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'svg'
      );

      svg.id = this.svgId;
      svg.setAttribute('width', '0');
      svg.setAttribute('height', '0');
      svg.style.position = 'absolute';
      svg.style.overflow = 'hidden';

      const filter = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'filter'
      );

      filter.id = this.filterId;
      filter.setAttribute('color-interpolation-filters', 'sRGB');
      filter.setAttribute('x', '0');
      filter.setAttribute('y', '0');
      filter.setAttribute('width', '100%');
      filter.setAttribute('height', '100%');

      const transfer = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'feComponentTransfer'
      );

      this.channelIds.forEach((id, index) => {
        const fn = document.createElementNS(
          'http://www.w3.org/2000/svg',
          'feFunc' + ['R', 'G', 'B'][index]
        );

        fn.id = id;
        fn.setAttribute('type', 'discrete');
        fn.setAttribute('tableValues', '0 1');

        transfer.appendChild(fn);
      });

      filter.appendChild(transfer);
      svg.appendChild(filter);
      document.body.appendChild(svg);
    }

    getStageCanvas() {
      return renderer &&
        (renderer.canvas || (renderer._gl && renderer._gl.canvas)) ||
        null;
    }

    makeTable(levels) {
      const values = [];

      for (let i = 0; i < 256; i++) {
        const input = i / 255;
        const quantized =
          Math.round(input * (levels - 1)) / (levels - 1);

        values.push(
          this.unsupportedMode === 'black' &&
          Math.abs(input - quantized) > 0.00001
            ? '0'
            : String(quantized)
        );
      }

      return values.join(' ');
    }

    applyResolution() {
      const canvas = this.getStageCanvas();

      if (!canvas || !canvas.style) return;

      if (this.canvas !== canvas) {
        if (this.canvas) {
          this.canvas.style.filter = this.previousFilter;
        }

        this.canvas = canvas;
        this.previousFilter = canvas.style.filter || '';
      }

      const palette =
        PALETTES[this.resolution] || PALETTES['24 bit'];

      this.channelIds.forEach((id, i) => {
        const fn = document.getElementById(id);

        if (fn) {
          fn.setAttribute(
            'tableValues',
            this.makeTable(palette[i])
          );
        }
      });

      canvas.style.filter = 'url(#' + this.filterId + ')';
    }

    setResolution(args) {
      const selected = String(args.RESOLUTION);

      if (!Object.prototype.hasOwnProperty.call(PALETTES, selected)) {
        return;
      }

      this.resolution = selected;
      this.applyResolution();

      if (runtime && typeof runtime.startHats === 'function') {
        runtime.startHats(
          'bitresolution_whenResolutionSet',
          { RESOLUTION: selected }
        );
      }
    }

    whenResolutionSet() {
      return false;
    }

    currentResolution() {
      return this.resolution;
    }

    isResolution(args) {
      return this.resolution === String(args.RESOLUTION);
    }

    unsupportedColors(args) {
      const mode = String(args.MODE);

      this.unsupportedMode =
        mode.startsWith('replace') ? 'black' : 'round';

      this.applyResolution();
    }

    resetSettings() {
      this.unsupportedMode = 'round';
      this.resolution = '24 bit';
      this.applyResolution();
    }
  }

  Scratch.extensions.register(new BitResolutionControls());

})(Scratch);