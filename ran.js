var width = 800, height = 600
var fps = 60
var time_interval = 1.0 / fps

window.onkeydown = (x) => {
/*	var e = x.key;
	if (e.search("Arrow") > -1 || "1" == e)	current_key = x.key
	else if (e == "i" || e == "I") time_interval -= 10
	else if (e == "d" || e == "D") time_interval += 10*/
	key_last = x.key
	console.log(key_last)
}

function Bullet() {
	this.x = 10, this.y = 20
	this.x_speed = 100.0, this.y_speed = 100.0

	this.update = () => {
		this.x += this.x_speed / fps
		this.y += this.y_speed / fps
	}
	this.draw = () => {
		c.fillStyle = "#F44336"
		c.beginPath()
		c.arc(this.x, this.y, 5, 0, 360)
		c.fill()
	}
}

function Entrance() {
	this.options = ["Start", "Practice Start", "Result"]
	this.base_x = 100, this.base_y = 300
	this.title_x = 450, this.title_y = 200
	this.title = "Project Ran"
	this.delta_y = 50

	this.init = () => {
		this.current_item = 0
	}

	this.process_key = () => {
		if (key_last === "ArrowDown" && this.current_item < this.options.length - 1) this.current_item++
		if (key_last === "ArrowUp" && this.current_item > 0) this.current_item--
		if (key_last === "Enter") {
			switch (this.options[this.current_item]) {
			case "Start":
				state = "game"
				game.init()
				break
			case "Practice Start":
				state = "game"
				game.init()
				break
			case "Result":
				state = "result"
				result.init()
				break
			}
		}
		key_last = ""
	}

	this.draw = () => {
		this.process_key()
		c.fillStyle = "#8fdfff"
		c.font = "40px Verdana"
		c.fillText("Project Ran", this.title_x, this.title_y)
		this.options.forEach((value, index) => {
			if (index === this.current_item)
				c.fillStyle = "white"
			else
				c.fillStyle = "grey"
			c.font = "30px Verdana"
			c.fillText(value, this.base_x, this.base_y + index * this.delta_y)
		})
	}
}

function Game() {

	this.init = () => {
	}

	this.draw = () => {
	}
}

function Result() {

	this.init = () => {
	}

	this.process_key = () => {
		if (key_last === "Escape") {
			entrance.init()
			state = "entrance"
		}
		key_last = ""
	}

	this.draw = () => {
		this.process_key()
	}
}

function draw() {
	c.fillStyle = "black"
	c.fillRect(0, 0, canvas.width, canvas.height)

	switch (state) {
	case "entrance":
		entrance.draw()
		break
	case "game":
		game.draw()
		break
	case "result": 
		result.draw()
		break
	}

	window.setTimeout(function () {window.requestAnimationFrame(draw)}, time_interval)
}


var canvas = document.getElementById("canvas")
canvas.width = width, canvas.height = height

var c = canvas.getContext("2d")
c.fillStyle = "black"
c.fillRect(0, 0, canvas.width, canvas.height)

var key_last = "", key_active = []

var entrance = new Entrance
var game = new Game
var result = new Result

var state = "entrance"
entrance.init()
draw()
