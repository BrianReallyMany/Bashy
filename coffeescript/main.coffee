class @BashyController
class @BashyOS
class @BashySprite
class @FileSystem
class @DisplayManager
class @TaskManager
class @MenuManager
class @HelpManager
class @SoundManager

###################################################
########### MAIN GAME SETUP AND LOOP ##############
###################################################
startGame = (sound_mgr, stage, bashy_himself, os, task_mgr) ->
	# Set up graphics
	drawFileSystem(stage, os.file_system)
	bashy_sprite = createBashySprite(bashy_himself, stage)
	startTicker(stage)

	# Create other objects
	display_mgr = new DisplayManager(bashy_sprite) # TODO really need this?
	controller = new BashyController(os, task_mgr, display_mgr, sound_mgr)

	# This is here because I can't seem to pass a class method to the terminal
	# as a callback
	handleInput = (input) ->
		controller.handleInput(input)

	# Create Terminal object
	# 'onBlur: false' guarantees the terminal always stays in focus
	$('#terminal').terminal(handleInput,
		{ greetings: "", prompt: '> ', onBlur: false, name: 'bashy_terminal' })


jQuery ->
	###################################################
	################ SOUND ############################
	###################################################
	playSounds = false
	sound_mgr = new SoundManager(playSounds)
	# Listen for 'turn off sound' button
	$("#audio_off").click sound_mgr.soundOff

	###################################################
	################## CANVAS, ETC. ###################
	###################################################
	## EASELJS SETUP CANVAS, STAGE, ANIMATIONS ##
	# Create canvas and stage
	canvas = $("#bashy_canvas")[0]
	stage = new createjs.Stage(canvas)

	###################################################
	################ HELP SCREEN ######################
	###################################################
	# Play intro on first click; show help screen on subsequent clicks
	help_mgr = new HelpManager()
	$("#playScreen").click -> help_mgr.onClick()

	# Create OS
	file_system = new FileSystem()
	os = new BashyOS(file_system)

	menu_mgr = new MenuManager()
	task_mgr = new TaskManager(menu_mgr)

	# Load spritesheet image; start game when it's loaded
	bashy_himself = new Image()
	bashy_himself.src = "assets/bashy_sprite_sheet.png"
	bashy_himself.onload = ->
		startGame(sound_mgr, stage, bashy_himself, os, task_mgr)

