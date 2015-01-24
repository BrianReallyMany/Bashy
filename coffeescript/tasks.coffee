get_tasks = () ->
	task1_fn = (os) ->
		return os.cwd == "/home"
	task2_fn = (os) ->
		return os.cwd == "/media"
	task3_fn = (os) ->
		return os.cwd == "/"
	task1 = new Task("navigate to home", ["type 'cd' and press enter"], task1_fn)
	task2 = new Task("navigate to /media", ["type 'cd /media' and press enter"], task2_fn)
	task3 = new Task("navigate to root", ["type 'cd /' and press enter"], task3_fn)
	return [task1, task2, task3]

# TaskManager class keeps track of Tasks, updates Menu (?)
class TaskManager
	constructor: (@menu_mgr) ->
		@tasks = get_tasks()
		for task in @tasks
			@menu_mgr.showTask(task)

	update: (os) ->
		# Check for newly-completed tasks
		all_complete = true
		for task in @tasks
			if not task.done(os)
				alert "uncompleted task: " + task.name
				all_complete = false
		if all_complete
			alert "you win"

# Task class encapsulates a task name, hint(s) and any number of 
# os queries and the desired responses
class Task
	constructor: (@name, @hints, @complete_fn) ->
		@is_complete = false

	done: (os) ->
		if @is_complete
			return true
		else
			@is_complete = @complete_fn(os)
			return @is_complete

window.TaskManager = TaskManager

