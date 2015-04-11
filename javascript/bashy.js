// Generated by CoffeeScript 1.9.1
(function() {
  var BashyGame, BashyOS, Directory, DisplayManager, FileSystem, MenuManager, SoundManager, Task, TaskManager, Zone, ZoneManager, calculateChildCoords, cleanPath, createBashyOS, createBashySprite, createDisplayManager, createZoneManager, drawChildren, drawFile, findFileCoords, getParentPath, getTasks, helpScreen, introScreen, parseCommand, startTicker,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  Directory = (function() {
    function Directory(path1) {
      this.path = path1;
      this.children = [];
    }

    Directory.prototype.name = function() {
      var len, splitPath;
      if (this.path === "/") {
        return this.path;
      } else {
        splitPath = this.path.split("/");
        len = splitPath.length;
        return splitPath[len - 1];
      }
    };

    Directory.prototype.toString = function() {
      return "Directory object with path=" + this.path;
    };

    Directory.prototype.getChild = function(name) {
      var child, j, len1, ref;
      ref = this.children;
      for (j = 0, len1 = ref.length; j < len1; j++) {
        child = ref[j];
        if (child.name() === name) {
          return child;
        }
      }
      return "";
    };

    return Directory;

  })();

  FileSystem = (function() {
    function FileSystem() {
      var bashy, home, media, pics;
      this.root = new Directory("/");
      media = new Directory("/media");
      pics = new Directory("/media/pics");
      media.children.push(pics);
      this.root.children.push(media);
      home = new Directory("/home");
      bashy = new Directory("/home/bashy");
      home.children.push(bashy);
      this.root.children.push(home);
    }

    FileSystem.prototype.isValidPath = function(path) {
      var currentParent, dir, dirName, j, len1, ref, splitPath;
      if (path === "/") {
        return true;
      }
      splitPath = path.split("/");
      currentParent = this.root;
      ref = splitPath.slice(1);
      for (j = 0, len1 = ref.length; j < len1; j++) {
        dirName = ref[j];
        dir = currentParent.getChild(dirName);
        if (!dir) {
          return false;
        } else {
          currentParent = dir;
        }
      }
      return true;
    };

    FileSystem.prototype.getDirectory = function(path) {
      var currentParent, dirName, j, len1, ref, splitPath;
      if (path === "/") {
        return this.root;
      }
      currentParent = this.root;
      splitPath = path.split("/");
      ref = splitPath.slice(1);
      for (j = 0, len1 = ref.length; j < len1; j++) {
        dirName = ref[j];
        currentParent = currentParent.getChild(dirName);
      }
      return currentParent;
    };

    return FileSystem;

  })();

  cleanPath = function(path) {
    var dir, j, len1, newPath, splitPath;
    splitPath = path.split("/");
    newPath = "";
    for (j = 0, len1 = splitPath.length; j < len1; j++) {
      dir = splitPath[j];
      if (dir !== "") {
        newPath = newPath + "/" + dir;
      }
    }
    return newPath;
  };

  getParentPath = function(dir) {
    var i, j, len, parentPath, ref, splitPath;
    if (dir.path === "/") {
      return "/";
    } else {
      splitPath = dir.path.split("/");
      len = splitPath.length;
      parentPath = "";
      for (i = j = 0, ref = len - 2; 0 <= ref ? j <= ref : j >= ref; i = 0 <= ref ? ++j : --j) {
        parentPath = parentPath + "/" + splitPath[i];
      }
      return parentPath;
    }
  };

  createBashyOS = function(zone_name) {
    var validCommands;
    if (zone_name === "nav") {
      validCommands = ["cd", "pwd"];
      return new BashyOS(validCommands);
    } else {
      alert("createBashyOS called with unknown zone name: " + zone_name);
      return None;
    }
  };

  BashyOS = (function() {
    function BashyOS(validCommands1) {
      this.validCommands = validCommands1;
      this.pwd = bind(this.pwd, this);
      this.cd = bind(this.cd, this);
      this.cdAbsolutePath = bind(this.cdAbsolutePath, this);
      this.cdRelativePath = bind(this.cdRelativePath, this);
      this.runCommand = bind(this.runCommand, this);
      this.fileSystem = new FileSystem();
      this.cwd = this.fileSystem.root;
    }

    BashyOS.prototype.runCommand = function(command, args) {
      var ref, ref1, ref2, stderr, stdout;
      ref = ["", ""], stdout = ref[0], stderr = ref[1];
      if (command === 'cd') {
        ref1 = this.cd(args), stdout = ref1[0], stderr = ref1[1];
      } else if (command === 'pwd') {
        ref2 = this.pwd(), stdout = ref2[0], stderr = ref2[1];
      }
      return [this.cwd, stdout, stderr];
    };

    BashyOS.prototype.cdRelativePath = function(path) {
      var absolutePath, field, fields, j, len1, newpath, ref, ref1, stderr, stdout;
      ref = ["", ""], stdout = ref[0], stderr = ref[1];
      newpath = "";
      fields = path.split("/");
      if (fields[0] === "..") {
        absolutePath = getParentPath(this.cwd);
        ref1 = [fields.slice(1)];
        for (j = 0, len1 = ref1.length; j < len1; j++) {
          field = ref1[j];
          if (absolutePath === "/") {
            absolutePath = absolutePath + field;
          } else {
            absolutePath = absolutePath + "/" + field;
          }
        }
        absolutePath = cleanPath(absolutePath);
        if (this.fileSystem.isValidPath(absolutePath)) {
          this.cwd = this.fileSystem.getDirectory(absolutePath);
        } else {
          stderr = "Invalid path: " + absolutePath;
        }
      } else if (fields[0] === ".") {
        if (this.cwd === this.fileSystem.root) {
          absolutePath = "/" + path.slice(2);
        } else {
          absolutePath = this.cwd + "/" + path.slice(2);
        }
        absolutePath = cleanPath(absolutePath);
        if (this.fileSystem.isValidPath(absolutePath)) {
          this.cwd = this.fileSystem.getDirectory(absolutePath);
        } else {
          stderr = "Invalid path: " + absolutePath;
        }
      } else {
        if (this.cwd === this.fileSystem.root) {
          absolutePath = this.cwd.path + path;
        } else {
          absolutePath = this.cwd.path + "/" + path;
        }
        absolutePath = cleanPath(absolutePath);
        if (this.fileSystem.isValidPath(absolutePath)) {
          this.cwd = this.fileSystem.getDirectory(absolutePath);
        } else {
          stderr = "Invalid path: " + absolutePath;
        }
      }
      return [stdout, stderr];
    };

    BashyOS.prototype.cdAbsolutePath = function(path) {
      var absolutePath, ref, stderr, stdout;
      ref = ["", ""], stdout = ref[0], stderr = ref[1];
      absolutePath = cleanPath(path);
      if (this.fileSystem.isValidPath(path)) {
        this.cwd = this.fileSystem.getDirectory(path);
      } else {
        stderr = "Invalid path";
      }
      return [stdout, stderr];
    };

    BashyOS.prototype.cd = function(args) {
      var path, ref, ref1, ref2, stderr, stdout;
      ref = ["", ""], stdout = ref[0], stderr = ref[1];
      if (args.length === 0) {
        this.cwd = this.fileSystem.getDirectory("/home");
      } else if (args.length > 0) {
        path = args[0];
        if (path[0] === "/") {
          ref1 = this.cdAbsolutePath(path), stdout = ref1[0], stderr = ref1[1];
        } else {
          ref2 = this.cdRelativePath(path), stdout = ref2[0], stderr = ref2[1];
        }
      }
      return [stdout, stderr];
    };

    BashyOS.prototype.pwd = function() {
      var ref, stderr, stdout;
      ref = ["", ""], stdout = ref[0], stderr = ref[1];
      stdout = this.cwd.path;
      return [stdout, stderr];
    };

    return BashyOS;

  })();

  getTasks = function() {
    var task1, task1Function, task2, task2Function, task3, task3Function;
    task1Function = function(os) {
      return os.cwd.path === "/home";
    };
    task2Function = function(os) {
      return os.cwd.path === "/media";
    };
    task3Function = function(os) {
      return os.cwd.path === "/";
    };
    task1 = new Task("navigate to home", ["type 'cd' and press enter"], task1Function);
    task2 = new Task("navigate to /media", ["type 'cd /media' and press enter"], task2Function);
    task3 = new Task("navigate to root", ["type 'cd /' and press enter"], task3Function);
    return [task1, task2, task3];
  };

  TaskManager = (function() {
    function TaskManager() {
      this.winner = false;
      this.tasks = getTasks();
      this.currentTask = this.tasks[0];
      this.showTask(this.currentTask);
    }

    TaskManager.prototype.update = function(os) {
      if (!this.winner) {
        if (this.currentTask.done(os)) {
          if (this.tasks.length > 1) {
            this.tasks = this.tasks.slice(1);
            this.currentTask = this.tasks[0];
            this.showTask(this.currentTask);
          } else {
            this.winner = true;
            this.win();
          }
        }
      }
    };

    TaskManager.prototype.showTask = function(task) {
      $("#menu").html(task.name);
    };

    TaskManager.prototype.win = function() {
      $("#menuHeader").html("");
      $("#menu").html("<h4>You Win!</h4>");
    };

    return TaskManager;

  })();

  Task = (function() {
    function Task(name1, hints, completeFunction) {
      this.name = name1;
      this.hints = hints;
      this.completeFunction = completeFunction;
      this.isComplete = false;
    }

    Task.prototype.done = function(os) {
      if (this.isComplete) {
        return true;
      } else {
        this.isComplete = this.completeFunction(os);
        return this.isComplete;
      }
    };

    Task.prototype.toString = function() {
      return this.name;
    };

    return Task;

  })();

  MenuManager = (function() {
    function MenuManager() {}

    MenuManager.prototype.showTask = function(task) {
      $("#menu").html(task.name);
    };

    MenuManager.prototype.win = function() {
      $("#menuHeader").html("");
      $("#menu").html("<h4>You Win!</h4>");
    };

    return MenuManager;

  })();

  introScreen = function() {
    var introHtml;
    introHtml = "<h3>Welcome to B@shy!</h3>";
    introHtml += "<p>Use your keyboard to type commands.</p>";
    introHtml += "<p>Available commands are 'pwd' and 'cd'</p>";
    $('#helpText').html(introHtml);
    $('#helpScreen').foundation('reveal', 'open');
  };

  helpScreen = function(hint) {
    var helpHtml;
    helpHtml = "<h3>B@shy Help</h3>";
    helpHtml += "<p>Hint: " + hint + "</p>";
    $('#helpText').html(helpHtml);
    $('#helpScreen').foundation('reveal', 'open');
  };

  createDisplayManager = function(image) {
    var bashySprite, canvas, displayMgr, stage;
    canvas = $("#bashyCanvas")[0];
    stage = new createjs.Stage(canvas);
    bashySprite = createBashySprite(image, stage);
    displayMgr = new DisplayManager(stage, bashySprite);
    startTicker(stage);
    return displayMgr;
  };

  createBashySprite = function(bashyImage, stage) {
    var SPRITEX, SPRITEY, bashySpriteSheet, ref, sprite;
    ref = [200, 50], SPRITEX = ref[0], SPRITEY = ref[1];
    bashySpriteSheet = new createjs.SpriteSheet({
      images: [bashyImage],
      frames: {
        width: 64,
        height: 64
      },
      animations: {
        walking: [0, 4, "walking"],
        standing: [0, 0, "standing"]
      }
    });
    sprite = new createjs.Sprite(bashySpriteSheet, 0);
    sprite.name = "bashySprite";
    sprite.framerate = 4;
    sprite.gotoAndPlay("walking");
    sprite.currentFrame = 0;
    sprite.x = SPRITEX;
    sprite.y = SPRITEY;
    stage.addChild(sprite);
    return sprite;
  };

  startTicker = function(stage) {
    var tick;
    tick = function(event) {
      return stage.update(event);
    };
    createjs.Ticker.addEventListener("tick", tick);
    createjs.Ticker.useRAF = true;
    createjs.Ticker.setFPS(15);
  };

  calculateChildCoords = function(count, parentX, parentY) {
    var coords, i, startingX, xOffset, y, yOffset;
    yOffset = 80;
    xOffset = 100;
    startingX = parentX - 0.5 * count * xOffset;
    y = parentY + yOffset;
    coords = (function() {
      var j, ref, results;
      results = [];
      for (i = j = 0, ref = count - 1; 0 <= ref ? j <= ref : j >= ref; i = 0 <= ref ? ++j : --j) {
        results.push([startingX + 2 * i * xOffset, y]);
      }
      return results;
    })();
    return coords;
  };

  drawFile = function(map, file, x, y) {
    var ref, text;
    text = new createjs.Text(file.name(), "20px Arial", "black");
    text.name = file.path;
    ref = [x, y], text.x = ref[0], text.y = ref[1];
    text.textBaseline = "alphabetic";
    map.addChild(text);
  };

  drawChildren = function(map, parent, parentX, parentY) {
    var child, childCoords, childX, childY, i, j, line, lineOffsetX, lineOffsetY, numChildren, ref;
    lineOffsetX = 20;
    lineOffsetY = 20;
    numChildren = parent.children.length;
    childCoords = calculateChildCoords(numChildren, parentX, parentY);
    for (i = j = 0, ref = numChildren - 1; 0 <= ref ? j <= ref : j >= ref; i = 0 <= ref ? ++j : --j) {
      child = parent.children[i];
      childX = childCoords[i][0];
      childY = childCoords[i][1];
      if (child.children.length > 0) {
        drawChildren(map, child, childX, childY);
      }
      drawFile(map, child, childX, childY);
      line = new createjs.Shape();
      line.graphics.setStrokeStyle(1);
      line.graphics.beginStroke("gray");
      line.graphics.moveTo(parentX, parentY + lineOffsetY);
      line.graphics.lineTo(childX + lineOffsetX, childY - lineOffsetY);
      line.graphics.endStroke();
      map.addChild(line);
    }
  };

  findFileCoords = function(fs, filepath, rootX, rootY) {
    if (filepath === "/") {
      return [250, 120];
    } else {
      return [200, 100];
    }
  };

  DisplayManager = (function() {
    function DisplayManager(stage1, bashySprite1) {
      var ref, ref1;
      this.stage = stage1;
      this.bashySprite = bashySprite1;
      this.update = bind(this.update, this);
      ref = [130, 60], this.startingX = ref[0], this.startingY = ref[1];
      this.centeredOn = "/";
      this.map = new createjs.Container();
      this.map.name = "map";
      ref1 = [this.startingX, this.startingY], this.map.x = ref1[0], this.map.y = ref1[1];
    }

    DisplayManager.prototype.update = function(fs, newDir) {
      var deltaX, deltaY, newX, newY, oldX, oldY, ref, ref1, ref2;
      ref = this.getCoordinatesForPath(this.centeredOn), oldX = ref[0], oldY = ref[1];
      ref1 = this.getCoordinatesForPath(newDir.path), newX = ref1[0], newY = ref1[1];
      ref2 = [oldX - newX, oldY - newY], deltaX = ref2[0], deltaY = ref2[1];
      createjs.Tween.get(this.map).to({
        x: this.map.x + deltaX,
        y: this.map.y + deltaY
      }, 500, createjs.Ease.getPowInOut(2));
      this.centeredOn = newDir.path;
    };

    DisplayManager.prototype.getCoordinatesForPath = function(path) {
      var item, j, len1, ref;
      ref = this.map.children;
      for (j = 0, len1 = ref.length; j < len1; j++) {
        item = ref[j];
        if (item.name === path) {
          return [item.x, item.y];
        }
      }
    };

    DisplayManager.prototype.drawFileSystem = function(fs) {
      drawFile(this.map, fs.root, this.map.x, this.map.y);
      drawChildren(this.map, fs.root, this.map.x, this.map.y);
      this.stage.addChild(this.map);
    };

    return DisplayManager;

  })();

  jQuery(function() {
    var game;
    return game = new BashyGame();
  });

  SoundManager = (function() {
    function SoundManager(playSounds1) {
      this.playSounds = playSounds1;
      this.handleFileLoad = bind(this.handleFileLoad, this);
      createjs.Sound.addEventListener("fileload", this.handleFileLoad);
      createjs.Sound.alternateExtensions = ["mp3"];
      createjs.Sound.registerManifest([
        {
          id: "boing1",
          src: "boing1.mp3"
        }, {
          id: "boing2",
          src: "boing2.mp3"
        }, {
          id: "oops",
          src: "oops.mp3"
        }, {
          id: "bashy_theme1",
          src: "bashy_theme1.mp3"
        }
      ], "assets/");
      $("#audioOff").click(this.soundOff);
    }

    SoundManager.prototype.soundOff = function() {
      this.playSounds = false;
      createjs.Sound.stop();
    };

    SoundManager.prototype.playBoing = function() {
      if (this.playSounds) {
        if (Math.random() < 0.5) {
          createjs.Sound.play("boing1");
        } else {
          createjs.Sound.play("boing2");
        }
      }
    };

    SoundManager.prototype.playOops = function() {
      if (this.playSounds) {
        createjs.Sound.play("oops");
      }
    };

    SoundManager.prototype.playTheme = function() {
      if (this.playSounds) {
        createjs.Sound.play("bashy_theme1", createjs.SoundJS.INTERRUPT_ANY, 0, 0, -1, 0.5);
      }
    };

    SoundManager.prototype.handleFileLoad = function(event) {
      console.log("Preloaded:", event.id, event.src);
      if (event.id === "bashy_theme1") {
        this.playTheme();
      }
    };

    return SoundManager;

  })();

  parseCommand = function(input) {
    var args, command, splitInput;
    splitInput = input.split(/\s+/);
    command = splitInput[0];
    args = splitInput.slice(1);
    return [command, args];
  };

  createZoneManager = function(display, sound, zone) {
    var zoneManager;
    zoneManager = new ZoneManager(display, sound);
    return zoneManager;
  };

  Zone = (function() {
    function Zone(displayMgr1, soundMgr, taskMgr, os1) {
      this.displayMgr = displayMgr1;
      this.soundMgr = soundMgr;
      this.taskMgr = taskMgr;
      this.os = os1;
      this.handleInput = bind(this.handleInput, this);
      $("html").click((function(_this) {
        return function() {
          return helpScreen(_this.taskMgr.currentTask.hints[0]);
        };
      })(this));
    }

    Zone.prototype.run = function() {
      this.displayMgr.drawFileSystem(this.os.fileSystem);
      return $('#terminal').terminal(this.handleInput, {
        greetings: "",
        prompt: '$ ',
        onBlur: false,
        name: 'bashyTerminal'
      });
    };

    Zone.prototype.executeCommand = function(command, args) {
      var cwd, fs, ref, stderr, stdout;
      fs = this.os.fileSystem;
      ref = this.os.runCommand(command, args), cwd = ref[0], stdout = ref[1], stderr = ref[2];
      this.taskMgr.update(this.os);
      this.displayMgr.update(fs, cwd);
      if (stderr) {
        this.playError();
        return stderr;
      } else {
        this.playSuccess();
        if (stdout) {
          return stdout;
        } else {
          return void 0;
        }
      }
    };

    Zone.prototype.playError = function() {
      return this.soundMgr.playOops();
    };

    Zone.prototype.playSuccess = function() {
      return this.soundMgr.playBoing();
    };

    Zone.prototype.handleInput = function(input) {
      var args, command, ref;
      input = input.replace(/^\s+|\s+$/g, "");
      ref = parseCommand(input), command = ref[0], args = ref[1];
      if (indexOf.call(this.os.validCommands, command) < 0) {
        return "Invalid command: " + command;
      } else {
        return this.executeCommand(command, args);
      }
    };

    return Zone;

  })();

  ZoneManager = (function() {
    function ZoneManager(displayMgr1, soundMgr) {
      this.displayMgr = displayMgr1;
      this.soundMgr = soundMgr;
      this.taskMgr = new TaskManager();
      this.os = createBashyOS("nav");
      this.currentZone = new Zone(this.displayMgr, this.soundMgr, this.taskMgr, this.os);
    }

    ZoneManager.prototype.run = function() {
      return this.currentZone.run();
    };

    return ZoneManager;

  })();

  BashyGame = (function() {
    function BashyGame() {
      var playSounds;
      this.soundMgr = new SoundManager(playSounds = false);
      this.bashyImage = new Image();
      this.bashyImage.onload = (function(_this) {
        return function() {
          return _this.initialize();
        };
      })(this);
      this.bashyImage.src = "assets/bashy_sprite_sheet.png";
    }

    BashyGame.prototype.initialize = function() {
      var current_zone;
      this.displayMgr = createDisplayManager(this.bashyImage);
      current_zone = "nav";
      this.zoneManager = createZoneManager(this.displayMgr, this.soundMgr, current_zone);
      return this.zoneManager.run();
    };

    return BashyGame;

  })();

}).call(this);
