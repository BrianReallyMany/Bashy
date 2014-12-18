// Generated by CoffeeScript 1.8.0
(function() {
  var BashyOS, BashySprite, DisplayManager, validPath,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  validPath = function(path) {
    if (path === '/' || path === '/home' || path === '/media') {
      return true;
    } else {
      return false;
    }
  };

  BashyOS = (function() {
    BashyOS.prototype.cwd = '/';

    function BashyOS() {
      this.pwd = __bind(this.pwd, this);
      this.cd = __bind(this.cd, this);
      this.handleTerminalInput = __bind(this.handleTerminalInput, this);
    }

    BashyOS.prototype.handleTerminalInput = function(input) {
      var fields, stderr, stdout, _ref, _ref1;
      _ref = ["", ""], stdout = _ref[0], stderr = _ref[1];
      fields = input.split(/\s+/);
      if (fields.length >= 1) {
        if (fields[0] === 'cd') {
          _ref1 = this.cd(fields), stdout = _ref1[0], stderr = _ref1[1];
        } else if (fields[0] === 'pwd') {
          stdout = this.pwd;
        }
      }
      return [this.cwd, stdout, stderr];
    };

    BashyOS.prototype.cd = function(args) {
      var fields, newpath, path, stderr, stdout, x, _ref;
      _ref = ["", ""], stdout = _ref[0], stderr = _ref[1];
      if (args.length === 1) {
        this.cwd = '/home';
      } else if (args.length > 1) {
        path = args[1];
        if (path[0] === "/") {
          if (validPath(path)) {
            this.cwd = path;
          } else {
            stderr = "Invalid path";
          }
        } else {
          newpath = "";
          fields = path.split("/");
          if (fields[0] === "..") {
            if (fields.length === 1) {
              this.cwd = "/";
            } else {
              newpath = "/";
              [
                (function() {
                  var _i, _len, _ref1, _results;
                  _ref1 = fields.slice(1, -1);
                  _results = [];
                  for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
                    x = _ref1[_i];
                    _results.push(newpath += x + "/");
                  }
                  return _results;
                })()
              ];
              newpath += fields.slice(-1);
              if (validPath(newpath)) {
                this.cwd = newpath;
              } else {
                stderr = "Invalid path";
              }
            }
          } else {
            if (validPath(this.cwd + path)) {
              this.cwd = this.cwd + path;
            } else {
              stderr = "Invalid path";
            }
          }
        }
      }
      return [stdout, stderr];
    };

    BashyOS.prototype.pwd = function() {
      return this.cwd;
    };

    return BashyOS;

  })();

  DisplayManager = (function() {
    function DisplayManager(bashy_sprite) {
      this.bashy_sprite = bashy_sprite;
      this.update = __bind(this.update, this);
    }

    DisplayManager.prototype.update = function(new_dir) {
      return this.bashy_sprite.goToDir(new_dir);
    };

    return DisplayManager;

  })();

  BashySprite = (function() {
    function BashySprite(sprite) {
      this.sprite = sprite;
      this.sprite.x = 200;
      this.sprite.y = 50;
    }

    BashySprite.prototype.goToDir = function(dir) {
      if (dir === "/") {
        return this.goRoot();
      } else if (dir === "/home") {
        return this.goHome();
      } else if (dir === "/media") {
        return this.goMedia();
      }
    };

    BashySprite.prototype.goRoot = function() {
      this.sprite.x = 200;
      return this.sprite.y = 50;
    };

    BashySprite.prototype.goHome = function() {
      this.sprite.x = 80;
      return this.sprite.y = 180;
    };

    BashySprite.prototype.goMedia = function() {
      this.sprite.x = 390;
      return this.sprite.y = 180;
    };

    BashySprite.prototype.moveLeft = function() {
      if (this.sprite.x > 0) {
        return this.sprite.x -= 48;
      }
    };

    BashySprite.prototype.moveRight = function() {
      var limit;
      limit = 288 - this.sprite.getBounds().width;
      if (this.sprite.x < limit) {
        return this.sprite.x += 48;
      }
    };

    BashySprite.prototype.moveUp = function() {
      if (this.sprite.y > 0) {
        return this.sprite.y -= 48;
      }
    };

    BashySprite.prototype.moveDown = function() {
      var limit;
      limit = 288 - this.sprite.getBounds().height;
      if (this.sprite.y < limit) {
        return this.sprite.y += 48;
      }
    };

    BashySprite.prototype.moveTo = function(x, y) {
      this.sprite.x = x;
      return this.sprite.y = y;
    };

    return BashySprite;

  })();

  window.BashyOS = BashyOS;

  window.BashySprite = BashySprite;

  window.DisplayManager = DisplayManager;

  this.BashyOS = (function() {
    function BashyOS() {}

    return BashyOS;

  })();

  this.BashySprite = (function() {
    function BashySprite() {}

    return BashySprite;

  })();

  this.FileSystem = (function() {
    function FileSystem() {}

    return FileSystem;

  })();

  this.DisplayManager = (function() {
    function DisplayManager() {}

    return DisplayManager;

  })();

  jQuery(function() {
    var bashy_himself, canvas, handleFileLoad, helpScreen, playIntro, playOops, playSound, playSounds, playTheme, seenIntro, soundOff, stage, startGame, terminalOnBlur, tick;
    terminalOnBlur = function() {
      return false;
    };
    helpScreen = function() {
      var help_html;
      help_html = "<h3>B@shy Help</h3>";
      help_html += "TODO contextual help messages";
      $('#help_text').html(help_html);
      return $('#helpScreen').foundation('reveal', 'open');
    };
    playIntro = function() {
      var intro_html;
      intro_html = "<h3>Welcome to B@ashy!</h3>";
      intro_html += "<p>Use your keyboard to type commands.</p>";
      intro_html += "<p>Available commands are 'pwd' and 'cd'</p>";
      $('#help_text').html(intro_html);
      return $('#helpScreen').foundation('reveal', 'open');
    };
    seenIntro = false;
    $("#playScreen").click(function() {
      if (!seenIntro) {
        playIntro();
        return seenIntro = true;
      } else {
        return helpScreen();
      }
    });
    canvas = $("#bashy_canvas")[0];
    stage = new createjs.Stage(canvas);
    bashy_himself = new Image();
    bashy_himself.onload = function() {
      return startGame();
    };
    bashy_himself.src = "assets/bashy_sprite_sheet.png";
    tick = function() {
      return stage.update();
    };
    playSounds = true;
    playSound = function() {
      if (playSounds) {
        if (Math.random() < 0.5) {
          return createjs.Sound.play("boing1");
        } else {
          return createjs.Sound.play("boing2");
        }
      }
    };
    playOops = function() {
      if (playSounds) {
        return createjs.Sound.play("oops");
      }
    };
    playTheme = function() {
      return createjs.Sound.play("bashy_theme1", createjs.SoundJS.INTERRUPT_ANY, 0, 0, -1, 0.5);
    };
    handleFileLoad = (function(_this) {
      return function(event) {
        console.log("Preloaded:", event.id, event.src);
        if (event.id === "bashy_theme1") {
          return playTheme();
        }
      };
    })(this);
    soundOff = function() {
      playSounds = false;
      return createjs.Sound.stop();
    };
    createjs.Sound.addEventListener("fileload", handleFileLoad);
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
    $("#audio_off").click(soundOff);
    return startGame = function() {
      var bashySpriteSheet, bashy_sprite, display_mgr, handleInput, homeText, line1, line2, mediaText, os, rootText, sprite;
      playTheme();
      rootText = new createjs.Text("/", "20px Arial", "black");
      rootText.x = 250;
      rootText.y = 120;
      rootText.textBaseline = "alphabetic";
      stage.addChild(rootText);
      homeText = new createjs.Text("/home", "20px Arial", "black");
      homeText.x = 140;
      homeText.y = 235;
      homeText.textBaseline = "alphabetic";
      stage.addChild(homeText);
      mediaText = new createjs.Text("/media", "20px Arial", "black");
      mediaText.x = 340;
      mediaText.y = 235;
      mediaText.textBaseline = "alphabetic";
      stage.addChild(mediaText);
      line1 = new createjs.Shape();
      line1.graphics.setStrokeStyle(1);
      line1.graphics.beginStroke("gray");
      line1.graphics.moveTo(255, 125);
      line1.graphics.lineTo(350, 220);
      line1.graphics.endStroke();
      stage.addChild(line1);
      line2 = new createjs.Shape();
      line2.graphics.setStrokeStyle(1);
      line2.graphics.beginStroke("gray");
      line2.graphics.moveTo(245, 125);
      line2.graphics.lineTo(150, 220);
      line2.graphics.endStroke();
      stage.addChild(line2);
      bashySpriteSheet = new createjs.SpriteSheet({
        images: [bashy_himself],
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
      sprite.gotoAndPlay("walking");
      sprite.currentFrame = 0;
      stage.addChild(sprite);
      bashy_sprite = new BashySprite(sprite);
      createjs.Ticker.addEventListener("tick", tick);
      createjs.Ticker.useRAF = true;
      createjs.Ticker.setFPS(5);
      os = new BashyOS();
      display_mgr = new DisplayManager(bashy_sprite);
      handleInput = function(input) {
        var cwd, stderr, stdout, _ref;
        _ref = os.handleTerminalInput(input), cwd = _ref[0], stdout = _ref[1], stderr = _ref[2];
        display_mgr.update(cwd);
        if (stderr) {
          playOops();
          return stderr;
        } else {
          playSound();
          if (stdout) {
            return stdout;
          } else {
            return void 0;
          }
        }
      };
      return $('#terminal').terminal(handleInput, {
        greetings: "",
        prompt: '> ',
        onBlur: terminalOnBlur,
        name: 'test'
      });
    };
  });

}).call(this);
