
(function (Scratch) {
    'use strict';

    if (!Scratch.extensions.unsandboxed) {
        throw new Error('Permissions requires an unsandboxed extension.');
    }

    const TYPES = ['all', 'camera', 'microphone', 'clipboard', 'notification'];

    class Permissions {
        getInfo() {
            return {
                id: 'permissions',
                name: 'Permissions',
                color1: '#10B990',
                color2: '#0DA780',
                color3: '#098E70',

                blocks: [
                    {
                        opcode: 'request',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'request access for [TYPE] permissions',
                        arguments: {
                            TYPE: {
                                type: Scratch.ArgumentType.STRING,
                                menu: 'types'
                            }
                        }
                    },
                    {
                        opcode: 'has',
                        blockType: Scratch.BlockType.BOOLEAN,
                        text: 'has [TYPE] permissions?',
                        arguments: {
                            TYPE: {
                                type: Scratch.ArgumentType.STRING,
                                menu: 'types'
                            }
                        }
                    },
                    {
                        opcode: 'remove',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'remove [TYPE] permissions',
                        arguments: {
                            TYPE: {
                                type: Scratch.ArgumentType.STRING,
                                menu: 'types'
                            }
                        }
                    }
                ],

                menus: {
                    types: {
                        acceptReporters: true,
                        items: TYPES
                    }
                }
            };
        }

        async request(args) {
            const type = args.TYPE;

            try {
                if (type === 'all') {
                    await this.requestMedia();
                    await this.requestNotification();
                    await this.checkClipboard();
                } else if (type === 'camera') {
                    await this.requestMedia('camera');
                } else if (type === 'microphone') {
                    await this.requestMedia('microphone');
                } else if (type === 'notification') {
                    await this.requestNotification();
                } else if (type === 'clipboard') {
                    await this.checkClipboard();
                }
            } catch (e) {
                console.warn('Permission request:', e);
            }
        }

        async requestMedia(type = 'both') {
            const constraints = {
                video: type === 'camera' || type === 'both',
                audio: type === 'microphone' || type === 'both'
            };

            const stream =
                await navigator.mediaDevices.getUserMedia(constraints);

            stream.getTracks().forEach(track => track.stop());
        }

        async requestNotification() {
            if ('Notification' in window &&
                Notification.permission === 'default') {
                await Notification.requestPermission();
            }
        }

        async checkClipboard() {
            if (navigator.permissions) {
                try {
                    await navigator.permissions.query({
                        name: 'clipboard-read'
                    });
                } catch (e) {
                    console.warn('Clipboard permission unavailable.');
                }
            }
        }

        async has(args) {
            const type = args.TYPE;

            if (type === 'all') {
                const results = await Promise.all([
                    this.check('camera'),
                    this.check('microphone'),
                    this.check('clipboard'),
                    this.check('notification')
                ]);

                return results.every(Boolean);
            }

            return this.check(type);
        }

        async check(type) {
            try {
                if (type === 'notification') {
                    return Notification.permission === 'granted';
                }

                if (!navigator.permissions) return false;

                const name = type === 'camera'
                    ? 'camera'
                    : type === 'microphone'
                        ? 'microphone'
                        : 'clipboard-read';

                const result = await navigator.permissions.query({
                    name
                });

                return result.state === 'granted';
            } catch (e) {
                return false;
            }
        }

        remove(args) {
            const type = args.TYPE;

            // Stop any active media streams owned by this extension.
            // This extension does not retain streams after requesting access.

            console.warn(
                'Browsers do not allow extensions to revoke site permissions.',
                type
            );
        }
    }

    Scratch.extensions.register(new Permissions());
})(Scratch);
