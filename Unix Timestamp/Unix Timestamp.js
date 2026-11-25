
(function (Scratch) {
    'use strict';

    const units = {
        Milliseconds: 1,
        Seconds: 1000,
        Minutes: 60000,
        Hours: 3600000,
        Days: 86400000,
        Weeks: 604800000,
        'Months (31 Days)': 2678400000,
        Years: 31536000000
    };

    class UnixTimestamp {
        getInfo() {
            return {
           id: 'unixtimestamp',
            name: 'Unix Timestamp',

menuIconURI: 'data:image/svg+xml;base64,PHN2ZyB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHdpZHRoPSI0OC45NDY5MSIgaGVpZ2h0PSI0OC43MzQ5NiIgdmlld0JveD0iMCwwLDQ4Ljk0NjkxLDQ4LjczNDk2Ij48ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtMjE1LjUyNjU0LC0xNTUuNjMyNTIpIj48ZyBzdHJva2UtbWl0ZXJsaW1pdD0iMTAiPjxwYXRoIGQ9Ik0yMTcuODgyNTEsMTgwYzAsLTEyLjIxNTE0IDkuOTAyMzMsLTIyLjExNzQ4IDIyLjExNzQ4LC0yMi4xMTc0OGMxMi4yMTUxNCwwIDIyLjExNzQ4LDkuOTAyMzMgMjIuMTE3NDgsMjIuMTE3NDhjMCwxMi4yMTUxNCAtOS45MDIzMywyMi4xMTc0OCAtMjIuMTE3NDgsMjIuMTE3NDhjLTEyLjIxNTE0LDAgLTIyLjExNzQ4LC05LjkwMjMzIC0yMi4xMTc0OCwtMjIuMTE3NDh6IiBmaWxsPSJub25lIiBzdHJva2U9IiNmZmZmZmYiIHN0cm9rZS13aWR0aD0iNC41IiBzdHJva2UtbGluZWNhcD0iYnV0dCIvPjxwYXRoIGQ9Ik0yMzkuOTk5OTgsMTc5Ljk5OTk5aC0xOC4wMjE2NSIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZmZmZmZmIiBzdHJva2Utd2lkdGg9IjQuNSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PHBhdGggZD0iTTI0MCwxNjEuOTc4MzN2MTguMDIxNjUiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2ZmZmZmZiIgc3Ryb2tlLXdpZHRoPSI0LjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPjxwYXRoIGQ9Ik0yNjAuMDQ4NTksMTY0LjI4MzczYy0wLjUyMDE1LDAuMjE0MDIgLTEuNDI4ODcsLTAuODg5NjQgLTEuNzI3MDYsLTEuMTc3NjZjLTEuMDk1ODEsLTEuMDU4NDMgLTIuNDc4ODcsLTEuNzYwODMgLTMuNjA0OCwtMi43NTkxOWMtMy43NjUzNCwtMy4zMzg3MSA0Ljc3NzM3LC0zLjQ5MDk5IDYuOTM5MTQsMC44MTc4NGMwLjI0NDUzLDAuNDg3NDEgMC40MDc0MiwxLjAzMTg5IDAuNDYxNjEsMS42MzUzMXoiIGZpbGw9IiMwMDAwMDAiIHN0cm9rZT0iI2ZmZmZmZiIgc3Ryb2tlLXdpZHRoPSI0LjUiIHN0cm9rZS1saW5lY2FwPSJidXR0Ii8+PHBhdGggZD0iTTIxNy44ODI1MiwxNjIuODAwMDJjMC4wNTQxOSwtMC42MDM0MiAwLjIxNzA3LC0xLjE0NzkgMC40NjE2MSwtMS42MzUzMWMyLjE2MTc3LC00LjMwODgzIDEwLjcwNDQ4LC00LjE1NjU1IDYuOTM5MTMsLTAuODE3ODRjLTEuMTI1OTMsMC45OTgzNyAtMi41MDg5OSwxLjcwMDc2IC0zLjYwNDgsMi43NTkxOWMtMC4yOTgyLDAuMjg4MDMgLTEuMjA2OTEsMS4zOTE2OCAtMS43MjcwNiwxLjE3NzY2eiIgZmlsbD0iIzAwMDAwMCIgc3Ryb2tlPSIjZmZmZmZmIiBzdHJva2Utd2lkdGg9IjQuNSIgc3Ryb2tlLWxpbmVjYXA9ImJ1dHQiLz48cGF0aCBkPSJNMjE3Ljg4MjUzLDE4MC4wMDAwMWMwLC0xMi4yMTUxNCA5LjkwMjMzLC0yMi4xMTc0OCAyMi4xMTc0OCwtMjIuMTE3NDhjMTIuMjE1MTQsMCAyMi4xMTc0OCw5LjkwMjMzIDIyLjExNzQ4LDIyLjExNzQ4YzAsMTIuMjE1MTQgLTkuOTAyMzMsMjIuMTE3NDggLTIyLjExNzQ4LDIyLjExNzQ4Yy0xMi4yMTUxNCwwIC0yMi4xMTc0OCwtOS45MDIzMyAtMjIuMTE3NDgsLTIyLjExNzQ4eiIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMDAwMDAwIiBzdHJva2Utd2lkdGg9IjIuNSIgc3Ryb2tlLWxpbmVjYXA9ImJ1dHQiLz48cGF0aCBkPSJNMjQwLDE4MGgtMTguMDIxNjUiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzAwMDAwMCIgc3Ryb2tlLXdpZHRoPSIyLjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPjxwYXRoIGQ9Ik0yNDAuMDAwMDEsMTYxLjk3ODM0djE4LjAyMTY1IiBmaWxsPSJub25lIiBzdHJva2U9IiMwMDAwMDAiIHN0cm9rZS13aWR0aD0iMi41IiBzdHJva2UtbGluZWNhcD0icm91bmQiLz48cGF0aCBkPSJNMjYwLjA0ODYxLDE2NC4yODM3NGMtMC41MjAxNSwwLjIxNDAyIC0xLjQyODg3LC0wLjg4OTY0IC0xLjcyNzA2LC0xLjE3NzY2Yy0xLjA5NTgxLC0xLjA1ODQzIC0yLjQ3ODg3LC0xLjc2MDgzIC0zLjYwNDgsLTIuNzU5MTljLTMuNzY1MzQsLTMuMzM4NzEgNC43NzczNywtMy40OTA5OSA2LjkzOTE0LDAuODE3ODRjMC4yNDQ1MywwLjQ4NzQxIDAuNDA3NDIsMS4wMzE4OSAwLjQ2MTYxLDEuNjM1MzF6IiBmaWxsPSIjMDAwMDAwIiBzdHJva2U9Im5vbmUiIHN0cm9rZS13aWR0aD0iMC41IiBzdHJva2UtbGluZWNhcD0iYnV0dCIvPjxwYXRoIGQ9Ik0yMTcuODgyNTMsMTYyLjgwMDAzYzAuMDU0MTksLTAuNjAzNDIgMC4yMTcwNywtMS4xNDc5IDAuNDYxNjEsLTEuNjM1MzFjMi4xNjE3NywtNC4zMDg4MyAxMC43MDQ0OCwtNC4xNTY1NSA2LjkzOTEzLC0wLjgxNzg0Yy0xLjEyNTkzLDAuOTk4MzcgLTIuNTA4OTksMS43MDA3NiAtMy42MDQ4LDIuNzU5MTljLTAuMjk4MiwwLjI4ODAzIC0xLjIwNjkxLDEuMzkxNjggLTEuNzI3MDYsMS4xNzc2NnoiIGZpbGw9IiMwMDAwMDAiIHN0cm9rZT0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIwLjUiIHN0cm9rZS1saW5lY2FwPSJidXR0Ii8+PC9nPjwvZz48L3N2Zz48IS0tcm90YXRpb25DZW50ZXI6MjQuNDczNDU2ODcyMTkxNDk6MjQuMzY3NDgwNTAxMDIwMzEtLT4=',

            color1: '#8952e8',
            color2: '#7540cf',
            color3: '#6233b5',
                blocks: [
                    {
                        opcode: 'current',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'Current Unix Timestamp'
                    },
                    {
                        opcode: 'getTimestamp',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'Get timestamp for [NUM] [UNIT]',
                        arguments: {
                            NUM: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: 0
                            },
                            UNIT: {
                                type: Scratch.ArgumentType.STRING,
                                menu: 'units'
                            }
                        }
                    }
                ],
                menus: {
                    units: {
                        acceptReporters: false,
                        items: Object.keys(units)
                    }
                }
            };
        }

        current() {
            return Date.now() / 1000;
        }
getTimestamp(args) {
    const amount = Number(args.NUM) || 0;
    const unit = units[args.UNIT] || 1000;
	
    return amount * unit / 1000;
}
    }

    Scratch.extensions.register(new UnixTimestamp());
})(Scratch);


