
(function (Scratch) {
    'use strict';

    if (!Scratch.extensions.unsandboxed) {
        throw new Error('Screenshot Utils requires unsandboxed mode!');
    }

    const vm = Scratch.vm;

    class ScreenshotUtils {
        getInfo() {
            return {
                id: 'screenshotutils',
                name: 'Screenshot Utils',
                color1: '#10B995',
                color2: '#0DA783',
                color3: '#098D70',

                blocks: [
                    {
                        opcode: 'entireStage',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'screenshot entire stage'
                    },
                    {
                        opcode: 'stageRegion',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'screenshot stage from x1: [X1] y1: [Y1] x2: [X2] y2: [Y2]',
                        arguments: {
                            X1: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: 0
                            },
                            Y1: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: 0
                            },
                            X2: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: 100
                            },
                            Y2: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: 100
                            }
                        }
                    }
                ]
            };
        }

        capture() {
            return new Promise((resolve, reject) => {
                const renderer = vm.renderer;

                if (!renderer || !renderer.requestSnapshot) {
                    reject(new Error('Renderer unavailable'));
                    return;
                }

                renderer.requestSnapshot(resolve);
            });
        }

        async entireStage() {
            try {
                return await this.capture();
            } catch (e) {
                return '';
            }
        }

        async stageRegion(args) {
            try {
                const dataURL = await this.capture();

                const image = new Image();

                await new Promise((resolve, reject) => {
                    image.onload = resolve;
                    image.onerror = reject;
                    image.src = dataURL;
                });

                const clamp = (n) =>
                    Math.max(0, Math.min(100, Number(n) || 0));

                let x1 = clamp(args.X1) / 100 * image.width;
                let y1 = clamp(args.Y1) / 100 * image.height;
                let x2 = clamp(args.X2) / 100 * image.width;
                let y2 = clamp(args.Y2) / 100 * image.height;

                const left = Math.min(x1, x2);
                const top = Math.min(y1, y2);
                const width = Math.abs(x2 - x1);
                const height = Math.abs(y2 - y1);

                if (width < 1 || height < 1) return '';

                const canvas = document.createElement('canvas');

                canvas.width = Math.round(width);
                canvas.height = Math.round(height);

                const ctx = canvas.getContext('2d');

                ctx.drawImage(
                    image,
                    left, top, width, height,
                    0, 0, canvas.width, canvas.height
                );

                return canvas.toDataURL('image/png');

            } catch (e) {
                return '';
            }
        }
    }

    Scratch.extensions.register(new ScreenshotUtils());

})(Scratch);
