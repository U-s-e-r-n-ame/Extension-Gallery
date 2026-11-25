
(function (Scratch) {
    'use strict';

    if (!Scratch.extensions.unsandboxed) {
        throw new Error('Custom Booleans requires unsandboxed mode.');
    }

    const booleans = Object.create(null);

    class CustomBooleans {
        getInfo() {
            return {
                id: 'custombooleans',
                name: 'Custom Booleans',
                color1: '#ff891c',
                color2: '#ed7410',
                color3: '#d95c00',

                blocks: [
                    {
                        opcode: 'createBoolean',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'create boolean [NAME] with value [VALUE]',
                        arguments: {
                            NAME: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'apple?'
                            },
                            VALUE: {
                                type: Scratch.ArgumentType.STRING,
                                menu: 'values',
                                defaultValue: 'true'
                            }
                        }
                    },
                    {
                        opcode: 'setBoolean',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'set boolean [NAME] to [VALUE]',
                        arguments: {
                            NAME: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'apple?'
                            },
                            VALUE: {
                                type: Scratch.ArgumentType.STRING,
                                menu: 'values',
                                defaultValue: 'false'
                            }
                        }
                    },
                    {
                        opcode: 'getBoolean',
                        blockType: Scratch.BlockType.BOOLEAN,
                        text: 'boolean [NAME]',
                        arguments: {
                            NAME: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'apple?'
                            }
                        }
                    },
                    {
                        opcode: 'booleanExists',
                        blockType: Scratch.BlockType.BOOLEAN,
                        text: 'boolean [NAME] exists?',
                        arguments: {
                            NAME: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'apple?'
                            }
                        }
                    },
                    {
                        opcode: 'listBooleans',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'list existing custom booleans'
                    },
                    {
                        opcode: 'countBooleans',
                        blockType: Scratch.BlockType.REPORTER,
                        text: '# of active custom booleans'
                    },
                    {
                        opcode: 'whenBooleanChanges',
                        blockType: Scratch.BlockType.HAT,
                        text: 'when boolean [NAME] changes to [VALUE]',
                        isEdgeActivated: true,
                        arguments: {
                            NAME: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'apple?'
                            },
                            VALUE: {
                                type: Scratch.ArgumentType.STRING,
                                menu: 'values',
                                defaultValue: 'true'
                            }
                        }
                    },
                    {
                        opcode: 'deleteBoolean',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'delete boolean [NAME]',
                        arguments: {
                            NAME: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'apple?'
                            }
                        }
                    },
                    {
                        opcode: 'deleteAllBooleans',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'delete all booleans'
                    }
                ],

                menus: {
                    values: {
                        acceptReporters: false,
                        items: ['true', 'false']
                    }
                }
            };
        }

        createBoolean(args) {
            const name = String(args.NAME);
            booleans[name] = args.VALUE === 'true';
        }

        setBoolean(args) {
            const name = String(args.NAME);

            if (Object.prototype.hasOwnProperty.call(booleans, name)) {
                booleans[name] = args.VALUE === 'true';
            }
        }

        getBoolean(args) {
            const name = String(args.NAME);

            return Object.prototype.hasOwnProperty.call(booleans, name)
                ? booleans[name]
                : false;
        }

        booleanExists(args) {
            return Object.prototype.hasOwnProperty.call(
                booleans,
                String(args.NAME)
            );
        }

        listBooleans() {
            return JSON.stringify(Object.keys(booleans));
        }

        countBooleans() {
            return Object.keys(booleans).length;
        }

        whenBooleanChanges(args) {
            const name = String(args.NAME);
            const target = args.VALUE === 'true';

            return Object.prototype.hasOwnProperty.call(booleans, name)
                && booleans[name] === target;
        }

        deleteBoolean(args) {
            delete booleans[String(args.NAME)];
        }

        deleteAllBooleans() {
            for (const name of Object.keys(booleans)) {
                delete booleans[name];
            }
        }
    }

    Scratch.extensions.register(new CustomBooleans());
})(Scratch);
