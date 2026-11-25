
(function (Scratch) {
    'use strict';

    if (!Scratch.extensions.unsandboxed) {
        throw new Error('Advanced Stretch requires unsandboxed mode.');
    }

    const vm = Scratch.vm;
    const runtime = vm.runtime;
    const renderer = Scratch.renderer || vm.renderer || runtime.renderer;

    const states = new Map();

    const CORNERS = {
        'top left corner': 'tl',
        'top right corner': 'tr',
        'bottom left corner': 'bl',
        'bottom right corner': 'br'
    };

    function getState(target) {
        if (!states.has(target.id)) {
            states.set(target.id, {
                costume: -1,
                originalSkin: null,
                warpedSkin: null,
                version: 0,
                stretchX: 100,
                stretchY: 100,
                corners: {
                    tl: { x: 0, y: 0 },
                    tr: { x: 0, y: 0 },
                    bl: { x: 0, y: 0 },
                    br: { x: 0, y: 0 }
                }
            });
        }
        return states.get(target.id);
    }

    async function loadCostume(costume) {
        const asset = costume.asset;

        if (!asset) throw new Error('Costume asset missing.');

        let url;

        if (typeof asset.encodeDataURI === 'function') {
            url = asset.encodeDataURI();
        } else if (asset.data) {
            const format = costume.dataFormat || 'png';
            const mime = format === 'svg'
                ? 'image/svg+xml'
                : format === 'jpg' || format === 'jpeg'
                    ? 'image/jpeg'
                    : 'image/png';

            const blob = new Blob([asset.data], { type: mime });
            url = URL.createObjectURL(blob);
        } else {
            throw new Error('Cannot read costume data.');
        }

        const image = new Image();

        await new Promise((resolve, reject) => {
            image.onload = resolve;
            image.onerror = reject;
            image.src = url;
        });

        if (url.startsWith('blob:')) URL.revokeObjectURL(url);

        return image;
    }

    function drawTriangle(ctx, image, source, destination) {
        const [p0, p1, p2] = source;
        const [q0, q1, q2] = destination;

        const x1 = p1.x - p0.x;
        const y1 = p1.y - p0.y;
        const x2 = p2.x - p0.x;
        const y2 = p2.y - p0.y;

        const determinant = x1 * y2 - x2 * y1;

        if (Math.abs(determinant) < 0.000001) return;

        const dx1 = q1.x - q0.x;
        const dy1 = q1.y - q0.y;
        const dx2 = q2.x - q0.x;
        const dy2 = q2.y - q0.y;

        const a = (dx1 * y2 - dx2 * y1) / determinant;
        const c = (dx2 * x1 - dx1 * x2) / determinant;
        const b = (dy1 * y2 - dy2 * y1) / determinant;
        const d = (dy2 * x1 - dy1 * x2) / determinant;

        const e = q0.x - a * p0.x - c * p0.y;
        const f = q0.y - b * p0.x - d * p0.y;

        ctx.save();

        ctx.beginPath();
        ctx.moveTo(q0.x, q0.y);
        ctx.lineTo(q1.x, q1.y);
        ctx.lineTo(q2.x, q2.y);
        ctx.closePath();
        ctx.clip();

        ctx.setTransform(a, b, c, d, e, f);
        ctx.drawImage(image, 0, 0);

        ctx.restore();
    }

    function interpolate(points, u, v) {
        return {
            x: (1-u)*(1-v)*points.tl.x +
               u*(1-v)*points.tr.x +
               (1-u)*v*points.bl.x +
               u*v*points.br.x,

            y: (1-u)*(1-v)*points.tl.y +
               u*(1-v)*points.tr.y +
               (1-u)*v*points.bl.y +
               u*v*points.br.y
        };
    }

    async function apply(target, state) {
        const version = ++state.version;

        if (!target || target.isStage) return;

        const costume = target.sprite.costumes[target.currentCostume];
        if (!costume) return;

        const drawableID = target.drawableID;
        const drawable = renderer._allDrawables &&
                         renderer._allDrawables[drawableID];

        if (!drawable || !drawable.skin) return;

        // Capture the original costume skin.
        if (state.costume !== target.currentCostume) {
            if (state.warpedSkin !== null) {
                renderer.updateDrawableSkinId(
                    drawableID,
                    state.originalSkin
                );

                renderer.destroySkin(state.warpedSkin);
                state.warpedSkin = null;
            }

            state.originalSkin = drawable.skin.id;
            state.costume = target.currentCostume;
        }

        const image = await loadCostume(costume);

        if (version !== state.version) return;

        const width = image.naturalWidth || image.width;
        const height = image.naturalHeight || image.height;

        if (!width || !height) return;

        const scaleX = state.stretchX / 100;
        const scaleY = state.stretchY / 100;

        const original = {
            tl: { x: 0, y: 0 },
            tr: { x: width, y: 0 },
            bl: { x: 0, y: height },
            br: { x: width, y: height }
        };

        const points = {};

        for (const key of ['tl', 'tr', 'bl', 'br']) {
            const p = original[key];
            const offset = state.corners[key];

            points[key] = {
                x: width/2 + (p.x-width/2)*scaleX + offset.x,
                y: height/2 + (p.y-height/2)*scaleY - offset.y
            };
        }

        const values = Object.values(points);

        const minX = Math.min(...values.map(p => p.x));
        const minY = Math.min(...values.map(p => p.y));
        const maxX = Math.max(...values.map(p => p.x));
        const maxY = Math.max(...values.map(p => p.y));

        const outputWidth = Math.max(1, Math.ceil(maxX-minX));
        const outputHeight = Math.max(1, Math.ceil(maxY-minY));

        const canvas = document.createElement('canvas');
        canvas.width = outputWidth;
        canvas.height = outputHeight;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        for (const key of ['tl', 'tr', 'bl', 'br']) {
            points[key].x -= minX;
            points[key].y -= minY;
        }

        const source = {
            tl: { x: 0, y: 0 },
            tr: { x: width, y: 0 },
            bl: { x: 0, y: height },
            br: { x: width, y: height }
        };

        // First triangle.
        drawTriangle(
            ctx,
            image,
            [source.tl, source.tr, source.bl],
            [points.tl, points.tr, points.bl]
        );

        // Second triangle.
        drawTriangle(
            ctx,
            image,
            [source.tr, source.br, source.bl],
            [points.tr, points.br, points.bl]
        );

        if (version !== state.version) return;

        // Preserve the rotation center using bilinear interpolation.
        let centerX = width / 2;
        let centerY = height / 2;

        try {
            const originalCenter = renderer.getSkinRotationCenter(
                state.originalSkin
            );

            centerX = originalCenter[0];
            centerY = originalCenter[1];
        } catch (e) {
            centerX = costume.rotationCenterX || width/2;
            centerY = costume.rotationCenterY || height/2;
        }

        const warpedCenter = interpolate(
            points,
            centerX / width,
            centerY / height
        );

        const resolution = costume.bitmapResolution || 1;

        const newSkin = renderer.createBitmapSkin(
            canvas,
            resolution,
            [
                warpedCenter.x,
                warpedCenter.y
            ]
        );

        if (version !== state.version) {
            renderer.destroySkin(newSkin);
            return;
        }

        const oldSkin = state.warpedSkin;

        // Apply the new deformed image to the actual sprite.
        renderer.updateDrawableSkinId(drawableID, newSkin);

        state.warpedSkin = newSkin;

        if (oldSkin !== null) {
            renderer.destroySkin(oldSkin);
        }
    }

    class AdvancedStretch {
        getInfo() {
            return {
                id: 'advancedstretch',
                name: 'Advanced Stretch',
                color1: '#1748D8',
                color2: '#1239B5',
                color3: '#0B298A',

                blocks: [
                    {
                        opcode: 'setCorner',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'set [CORNER] x: [X] y: [Y]',
                        arguments: {
                            CORNER: {
                                type: Scratch.ArgumentType.STRING,
                                menu: 'corners'
                            },
                            X: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: 100
                            },
                            Y: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: 100
                            }
                        }
                    },
                    {
                        opcode: 'reset',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'reset stretch effects'
                    },
                    {
                        opcode: 'whenReset',
                        blockType: Scratch.BlockType.EVENT,
                        text: 'when stretch reset'
                    },
                    {
                        opcode: 'whenStretchX',
                        blockType: Scratch.BlockType.EVENT,
                        text: 'when stretch x set to [VALUE]',
                        isEdgeActivated: true,
                        arguments: {
                            VALUE: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: 100
                            }
                        }
                    },
                    {
                        opcode: 'whenStretchY',
                        blockType: Scratch.BlockType.EVENT,
                        text: 'when stretch y set to [VALUE]',
                        isEdgeActivated: true,
                        arguments: {
                            VALUE: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: 100
                            }
                        }
                    },
                    {
                        opcode: 'setStretchX',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'set stretch x to [VALUE]',
                        arguments: {
                            VALUE: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: 100
                            }
                        }
                    },
                    {
                        opcode: 'setStretchY',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'set stretch y to [VALUE]',
                        arguments: {
                            VALUE: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: 100
                            }
                        }
                    },
                    {
                        opcode: 'cornerX',
                        blockType: Scratch.BlockType.REPORTER,
                        text: '[CORNER] x value',
                        arguments: {
                            CORNER: {
                                type: Scratch.ArgumentType.STRING,
                                menu: 'corners'
                            }
                        }
                    },
                    {
                        opcode: 'cornerY',
                        blockType: Scratch.BlockType.REPORTER,
                        text: '[CORNER] y value',
                        arguments: {
                            CORNER: {
                                type: Scratch.ArgumentType.STRING,
                                menu: 'corners'
                            }
                        }
                    }
                ],

                menus: {
                    corners: {
                        acceptReporters: false,
                        items: [
                            { text: 'top left corner', value: 'top left corner' },
                            { text: 'top right corner', value: 'top right corner' },
                            { text: 'bottom left corner', value: 'bottom left corner' },
                            { text: 'bottom right corner', value: 'bottom right corner' }
                        ]
                    }
                }
            };
        }

        setCorner(args, util) {
            const state = getState(util.target);
            const key = CORNERS[args.CORNER];
            if (!key) return;

            state.corners[key] = {
                x: Number(args.X) || 0,
                y: Number(args.Y) || 0
            };

            apply(util.target, state).catch(console.error);
        }

        setStretchX(args, util) {
            const state = getState(util.target);
            state.stretchX = Number(args.VALUE) || 0;

            apply(util.target, state).catch(console.error);

            runtime.startHats('advancedstretch_whenStretchX', {
                VALUE: String(state.stretchX)
            });
        }

        setStretchY(args, util) {
            const state = getState(util.target);
            state.stretchY = Number(args.VALUE) || 0;

            apply(util.target, state).catch(console.error);

            runtime.startHats('advancedstretch_whenStretchY', {
                VALUE: String(state.stretchY)
            });
        }

        cornerX(args, util) {
            const state = getState(util.target);
            const key = CORNERS[args.CORNER];
            return key ? state.corners[key].x : 0;
        }

        cornerY(args, util) {
            const state = getState(util.target);
            const key = CORNERS[args.CORNER];
            return key ? state.corners[key].y : 0;
        }

        reset(args, util) {
            const target = util.target;
            const state = getState(target);

            state.version++;

            if (state.warpedSkin !== null) {
                renderer.updateDrawableSkinId(
                    target.drawableID,
                    state.originalSkin
                );

                renderer.destroySkin(state.warpedSkin);
            }

            state.warpedSkin = null;
            state.originalSkin = null;
            state.costume = -1;

            state.stretchX = 100;
            state.stretchY = 100;

            for (const key of ['tl', 'tr', 'bl', 'br']) {
                state.corners[key] = { x: 0, y: 0 };
            }

            runtime.startHats('advancedstretch_whenReset');
        }

        whenReset() {
            return false;
        }

        whenStretchX() {
            return false;
        }

        whenStretchY() {
            return false;
        }
    }

    Scratch.extensions.register(new AdvancedStretch());

})(Scratch);
