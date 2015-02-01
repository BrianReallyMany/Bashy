class @BashyOS
class @BashySprite
class @FileSystem
class @DisplayManager
class @TaskManager
class @MenuManager

# Functions for Intro and Help screens
playIntro = () ->
	intro_html = "<h3>Welcome to B@shy!</h3>"
	intro_html += "<p>Use your keyboard to type commands.</p>"
	intro_html += "<p>Available commands are 'pwd' and 'cd'</p>"
	$('#help_text').html(intro_html)
	$('#helpScreen').foundation('reveal', 'open')

helpScreen = () ->
	help_html = "<h3>B@shy Help</h3>"
	help_html += "TODO contextual help messages"
	$('#help_text').html(help_html)
	$('#helpScreen').foundation('reveal', 'open')

# Functions to draw map
showRootText = (stage) ->
	rootText = new createjs.Text("/", "20px Arial", "black")
	rootText.x = 250
	rootText.y = 120
	rootText.textBaseline = "alphabetic"
	stage.addChild(rootText)

showHomeText = (stage) ->
	homeText = new createjs.Text("/home", "20px Arial", "black")
	homeText.x = 140
	homeText.y = 235
	homeText.textBaseline = "alphabetic"
	stage.addChild(homeText)

showMediaText = (stage) ->
	mediaText = new createjs.Text("/media", "20px Arial", "black")
	mediaText.x = 340
	mediaText.y = 235
	mediaText.textBaseline = "alphabetic"
	stage.addChild(mediaText)

drawLines = (stage) ->
	# Draw lines from root to children
	line1 = new createjs.Shape()
	line1.graphics.setStrokeStyle(1)
	line1.graphics.beginStroke("gray")
	line1.graphics.moveTo(255, 125)
	line1.graphics.lineTo(350, 220)
	line1.graphics.endStroke()
	stage.addChild(line1)

	line2 = new createjs.Shape()
	line2.graphics.setStrokeStyle(1)
	line2.graphics.beginStroke("gray")
	line2.graphics.moveTo(245, 125)
	line2.graphics.lineTo(150, 220)
	line2.graphics.endStroke()
	stage.addChild(line2)

drawFileSystemMap = (stage) ->
	showRootText(stage)
	showHomeText(stage)
	showMediaText(stage)
	drawLines(stage)

# Functions to create sprite
createBashySprite = (bashy_himself, stage) ->
	## CREATE AND INITIALIZE CHARACTER SPRITE ##
	# Create SpriteSheet first
	bashySpriteSheet = new createjs.SpriteSheet({
		images: [bashy_himself],
		frames: {width: 64, height: 64},
		animations: {
		    walking: [0, 4, "walking"],
		    standing: [0, 0, "standing"],
		}
	})
	# Now create Sprite
	sprite = new createjs.Sprite(bashySpriteSheet, 0)
	# Start playing the first sequence:
	sprite.gotoAndPlay "walking"
	sprite.currentFrame = 0
	stage.addChild(sprite)
	bashy_sprite = new BashySprite(sprite)

startTicker = (stage) ->
	# Set up Ticker, frame rate
	tick = -> stage.update()
	createjs.Ticker.addEventListener("tick", tick)
	createjs.Ticker.useRAF = true
	createjs.Ticker.setFPS(5)


jQuery ->
	## EASELJS SETUP CANVAS, STAGE, ANIMATIONS ##
	# Create canvas and stage
	canvas = $("#bashy_canvas")[0]
	stage = new createjs.Stage(canvas)

	# Load spritesheet image; start game when it's loaded
	bashy_himself = new Image()
	bashy_himself.onload = ->
		startGame()
	bashy_himself.src = "assets/bashy_sprite_sheet.png"



	###################################################
	#################### SOUND ########################
	###################################################
	
	## SOUNDJS FUNCTIONS TO LOAD AND PLAY SFX AND THEME ##
	# Be noisy by default
	playSounds = true

	# Function to turn off sound when it gets annoying
	soundOff = () ->
		playSounds = false
		createjs.Sound.stop()

	# Function to play sound effect after each successful user command
	playSound = () ->
		if playSounds
			if Math.random() < 0.5
				createjs.Sound.play("boing1")
			else
				createjs.Sound.play("boing2")

	# Function to play sound effect after erroneous command
	playOops = () ->
		if playSounds
			createjs.Sound.play("oops")

	# Function to play theme song
	playTheme = () ->
		createjs.Sound.play("bashy_theme1", createjs.SoundJS.INTERRUPT_ANY, 0, 0, -1, 0.5)
	# Event listener for loading audio files -- play theme song once it's loaded
	handleFileLoad = (event) =>
		console.log("Preloaded:", event.id, event.src)
		if event.id == "bashy_theme1"
			playTheme()
			soundOff() # delete this line to turn sound back on at start

	# Load sounds and fire handleFileLoad when they're in memory
	createjs.Sound.addEventListener("fileload", handleFileLoad)
	createjs.Sound.alternateExtensions = ["mp3"]
	createjs.Sound.registerManifest(
		    [{id:"boing1", src:"boing1.mp3"},
		     {id:"boing2", src:"boing2.mp3"},
		     {id:"oops", src:"oops.mp3"},
		     {id:"bashy_theme1", src:"bashy_theme1.mp3"}]
			, "assets/")

	# Listen for 'turn off sound' button
	$("#audio_off").click soundOff


	###################################################
	################ HELP SCREEN ######################
	###################################################
	
	# Play intro on first click; show help screen on subsequent clicks
	seenIntro = false
	$("#playScreen").click ->
		if not seenIntro
			playIntro()
			seenIntro = true
		else
			helpScreen()

	###################################################
	########### MAIN GAME SETUP AND LOOP ##############
	###################################################
	startGame = () ->

		drawFileSystemMap(stage)
		bashy_sprite = createBashySprite(bashy_himself, stage)
		startTicker(stage)

		## CREATE OBJECTS, DEFINE FUNCTION CALLED ON INPUT ##
		# Create OS, Display Manager
		os = new BashyOS()
		display_mgr = new DisplayManager(bashy_sprite)
		menu_mgr = new MenuManager()
		task_mgr = new TaskManager(menu_mgr)

		# Function called each time user types a command
		# Takes user input string, updates system, returns text to terminal
		handleInput = (input) ->
			# BashyOS updates and returns context, stdout, stderr
			# (for now 'cwd' is all the context we need)
			[cwd, stdout, stderr] = os.handleTerminalInput(input)

			# TaskManager checks for completed tasks
			task_mgr.update(os)

			# DisplayManager updates character position on the map
			display_mgr.update(cwd)
			
			# Return text to terminal
			if stderr
				playOops()
				stderr
			else
				playSound()
				if stdout
					stdout
				else
					# Returning 'undefined' means no terminal output
					undefined

		# Create Terminal object
		# 'onBlur: false' guarantees the terminal always stays in focus
		$('#terminal').terminal(handleInput,
			{ greetings: "", prompt: '> ', onBlur: false, name: 'test' })

