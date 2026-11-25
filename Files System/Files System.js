
// Files System - TurboWarp + PenguinMod
// Load as an UNSANDBOXED custom extension.

(function (Scratch) {
  "use strict";

  if (!Scratch || !Scratch.extensions) {
    throw new Error("Scratch Extensions API was not found.");
  }

  const STORAGE_KEY = "scratch-files-system-v1";

  const MENU = {
    format: ["base64", "json"],
    info: ["data", "type"],
    lists: ["folders", "files"],
    deleteMode: [
      {
        text: "move all files to the directory the folder was in",
        value: "move"
      },
      {
        text: "delete all files inside the folder",
        value: "delete"
      }
    ]
  };

  function cleanPath(value) {
    return String(value ?? "")
      .replace(/\\/g, "/")
      .split("/")
      .filter(part => part && part !== ".")
      .reduce((parts, part) => {
        if (part === "..") parts.pop();
        else parts.push(part);
        return parts;
      }, [])
      .join("/");
  }

  function parentPath(path) {
    const p = cleanPath(path);
    const i = p.lastIndexOf("/");
    return i < 0 ? "" : p.slice(0, i);
  }

  function baseName(path) {
    const p = cleanPath(path);
    return p.slice(p.lastIndexOf("/") + 1);
  }

  function encodeBase64(text) {
    const bytes = new TextEncoder().encode(text);
    let binary = "";
    for (const byte of bytes) {
      binary += String.fromCharCode(byte);
    }
    return btoa(binary);
  }

  function decodeBase64(value) {
    const binary = atob(String(value));
    const bytes = Uint8Array.from(
      binary,
      c => c.charCodeAt(0)
    );
    return new TextDecoder().decode(bytes);
  }

  class FilesSystem {
    constructor() {
      this.files = {};
      this.folders = [""];
      this.loadStored();
    }

    loadStored() {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) this.importJSON(saved);
      } catch (e) {
        // Storage unavailable: use memory.
      }
    }

    persist() {
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            version: 1,
            files: this.files,
            folders: this.folders
          })
        );
      } catch (e) {
        // Continue in memory.
      }
    }

    ensureFolder(path) {
      const parts = cleanPath(path)
        .split("/")
        .filter(Boolean);

      let current = "";

      for (const part of parts) {
        current = current
          ? current + "/" + part
          : part;

        if (!this.folders.includes(current)) {
          this.folders.push(current);
        }
      }
    }

    newFileSystem() {
      this.files = {};
      this.folders = [""];
      this.persist();
    }

    createFile(args) {
      const filename = cleanPath(args.FILENAME);
      const directory = cleanPath(args.DIRECTORY);

      if (!filename) return;

      const path = cleanPath(
        directory
          ? directory + "/" + filename
          : filename
      );

      this.ensureFolder(parentPath(path));
      this.files[path] = String(args.DATA ?? "");
      this.persist();
    }

    renameFile(args) {
      const oldPath = cleanPath(args.PATH);
      const newName = cleanPath(args.NEWNAME);

      if (!oldPath || !newName ||
          !(oldPath in this.files)) return;

      const destination = cleanPath(
        parentPath(oldPath)
          ? parentPath(oldPath) + "/" + newName
          : newName
      );

      this.files[destination] = this.files[oldPath];
      delete this.files[oldPath];
      this.persist();
    }

    rewriteFile(args) {
      const path = cleanPath(args.PATH);

      if (!path || !(path in this.files)) return;

      this.files[path] = String(args.DATA ?? "");
      this.persist();
    }

    moveFile(args) {
      const source = cleanPath(args.PATH);
      const destination = cleanPath(args.DESTINATION);

      if (!source || !destination ||
          !(source in this.files)) return;

      this.ensureFolder(parentPath(destination));
      this.files[destination] = this.files[source];
      delete this.files[source];
      this.persist();
    }

    deleteFile(args) {
      const path = cleanPath(args.PATH);

      if (path in this.files) {
        delete this.files[path];
        this.persist();
      }
    }

    createFolder(args) {
      const name = cleanPath(args.NAME);
      const directory = cleanPath(args.DIRECTORY);

      if (!name) return;

      this.ensureFolder(
        directory ? directory + "/" + name : name
      );

      this.persist();
    }

    listItems(args) {
      const directory = cleanPath(args.DIRECTORY);
      const kind = String(args.KIND);
      const prefix = directory ? directory + "/" : "";
      const results = new Set();

      if (kind === "folders") {
        for (const folder of this.folders) {
          if (!folder || !folder.startsWith(prefix)) continue;

          const rest = folder.slice(prefix.length);

          if (rest && !rest.includes("/")) {
            results.add(rest);
          }
        }
      } else {
        for (const path of Object.keys(this.files)) {
          if (!path.startsWith(prefix)) continue;

          const rest = path.slice(prefix.length);

          if (rest && !rest.includes("/")) {
            results.add(rest);
          }
        }
      }

      return Array.from(results).sort().join("\n");
    }

    deleteFolder(args) {
      const folder = cleanPath(args.PATH);

      if (!folder) return;

      const prefix = folder + "/";
      const mode = String(args.MODE);
      const parent = parentPath(folder);

      if (mode === "move") {
        const moved = {};

        for (const [path, data] of Object.entries(this.files)) {
          if (path.startsWith(prefix)) {
            const rest = path.slice(prefix.length);

            if (!rest.includes("/")) {
              const newPath = cleanPath(
                parent ? parent + "/" + rest : rest
              );

              moved[newPath] = data;
            } else {
              moved[path] = data;
            }
          } else {
            moved[path] = data;
          }
        }

        this.files = moved;

        this.folders = this.folders.filter(
          f => f !== folder && !f.startsWith(prefix)
        );

        this.ensureFolder(parent);

      } else {
        for (const path of Object.keys(this.files)) {
          if (path === folder || path.startsWith(prefix)) {
            delete this.files[path];
          }
        }

        this.folders = this.folders.filter(
          f => f !== folder && !f.startsWith(prefix)
        );
      }

      this.persist();
    }

    fileInfo(args) {
      const path = cleanPath(args.PATH);

      if (!(path in this.files)) return "";

      if (String(args.INFO) === "data") {
        return encodeBase64(this.files[path]);
      }

      const name = baseName(path);
      const dot = name.lastIndexOf(".");

      return dot > 0 ? name.slice(dot + 1) : "";
    }

    saveFileSystem(args) {
      const json = JSON.stringify({
        version: 1,
        files: this.files,
        folders: this.folders
      });

      return String(args.FORMAT) === "base64"
        ? encodeBase64(json)
        : json;
    }

    importJSON(json) {
      const parsed = JSON.parse(json);

      if (
        !parsed ||
        typeof parsed !== "object" ||
        !parsed.files ||
        typeof parsed.files !== "object"
      ) {
        throw new Error("Invalid filesystem data");
      }

      const nextFiles = {};

      for (const [path, data] of Object.entries(parsed.files)) {
        const safe = cleanPath(path);
        if (safe) nextFiles[safe] = String(data);
      }

      const nextFolders = [""];

      if (Array.isArray(parsed.folders)) {
        for (const folder of parsed.folders) {
          const safe = cleanPath(folder);

          if (safe && !nextFolders.includes(safe)) {
            nextFolders.push(safe);
          }
        }
      }

      for (const path of Object.keys(nextFiles)) {
        const parent = parentPath(path);

        if (parent && !nextFolders.includes(parent)) {
          this.addParents(nextFolders, parent);
        }
      }

      this.files = nextFiles;
      this.folders = nextFolders;
      this.persist();
    }

    addParents(list, path) {
      const parts = cleanPath(path)
        .split("/")
        .filter(Boolean);

      let current = "";

      for (const part of parts) {
        current = current
          ? current + "/" + part
          : part;

        if (!list.includes(current)) {
          list.push(current);
        }
      }
    }

    loadFileSystem(args) {
      try {
        const format = String(args.FORMAT);

        const raw = format === "base64"
          ? decodeBase64(args.DATA)
          : String(args.DATA);

        this.importJSON(raw);

      } catch (e) {
        console.warn(
          "Files System: could not load filesystem:",
          e
        );
      }
    }

    getInfo() {
      return {
        id: "filessystem",
        name: "Files System",
        color1: "#ed4245",
        color2: "#d9363a",
        color3: "#b92b30",

        blocks: [
          {
            opcode: "newFileSystem",
            blockType: Scratch.BlockType.COMMAND,
            text: "new file system"
          },

          {
            opcode: "loadFileSystem",
            blockType: Scratch.BlockType.COMMAND,
            text: "load file system from [DATA] with format: [FORMAT]",
            arguments: {
              DATA: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: " "
              },
              FORMAT: {
                type: Scratch.ArgumentType.STRING,
                menu: "format"
              }
            }
          },

          {
            opcode: "createFile",
            blockType: Scratch.BlockType.COMMAND,
            text: "create file [FILENAME] with data [DATA] and save in directory [DIRECTORY]",
            arguments: {
              FILENAME: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "filename.txt"
              },
              DATA: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "data"
              },
              DIRECTORY: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "directory/"
              }
            }
          },

          {
            opcode: "renameFile",
            blockType: Scratch.BlockType.COMMAND,
            text: "rename file [PATH] to [NEWNAME]",
            arguments: {
              PATH: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "directory/filename.txt"
              },
              NEWNAME: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "newfile.txt"
              }
            }
          },

          {
            opcode: "rewriteFile",
            blockType: Scratch.BlockType.COMMAND,
            text: "rewrite data of [PATH] to [DATA]",
            arguments: {
              PATH: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "directory/filename.txt"
              },
              DATA: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "data"
              }
            }
          },

          {
            opcode: "moveFile",
            blockType: Scratch.BlockType.COMMAND,
            text: "move file [PATH] to folder [DESTINATION]",
            arguments: {
              PATH: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "directory/filename.txt"
              },
              DESTINATION: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "directory/name/filename.txt"
              }
            }
          },

          {
            opcode: "deleteFile",
            blockType: Scratch.BlockType.COMMAND,
            text: "delete file [PATH]",
            arguments: {
              PATH: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "directory/filename.txt"
              }
            }
          },

          {
            opcode: "createFolder",
            blockType: Scratch.BlockType.COMMAND,
            text: "create folder [NAME] in directory [DIRECTORY]",
            arguments: {
              NAME: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "name"
              },
              DIRECTORY: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "directory/"
              }
            }
          },

          {
            opcode: "listItems",
            blockType: Scratch.BlockType.REPORTER,
            text: "list all [KIND] in directory [DIRECTORY]",
            arguments: {
              KIND: {
                type: Scratch.ArgumentType.STRING,
                menu: "lists"
              },
              DIRECTORY: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "directory/"
              }
            }
          },

          {
            opcode: "deleteFolder",
            blockType: Scratch.BlockType.COMMAND,
            text: "delete folder [PATH] and [MODE]",
            arguments: {
              PATH: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "directory/name"
              },
              MODE: {
                type: Scratch.ArgumentType.STRING,
                menu: "deleteMode"
              }
            }
          },

          {
            opcode: "fileInfo",
            blockType: Scratch.BlockType.REPORTER,
            text: "file [PATH] [INFO]",
            arguments: {
              PATH: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "directory/filename.txt"
              },
              INFO: {
                type: Scratch.ArgumentType.STRING,
                menu: "info"
              }
            }
          },

          {
            opcode: "saveFileSystem",
            blockType: Scratch.BlockType.REPORTER,
            text: "save current file system as [FORMAT]",
            arguments: {
              FORMAT: {
                type: Scratch.ArgumentType.STRING,
                menu: "format"
              }
            }
          }
        ],

        menus: {
          format: {
            acceptReporters: false,
            items: MENU.format
          },

          info: {
            acceptReporters: false,
            items: MENU.info
          },

          lists: {
            acceptReporters: false,
            items: MENU.lists
          },

          deleteMode: {
            acceptReporters: false,
            items: MENU.deleteMode
          }
        }
      };
    }
  }

  Scratch.extensions.register(new FilesSystem());

})(Scratch);
