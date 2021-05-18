var width = 800, height = 600
var game_width = 500
var fps = 60
var time_interval = 1.0 / fps
var num_life = 3
var num_bomb = 3
var title = "Project Ran"
var key_last = "", key_active = new Set

window.onkeydown = (x) => {
	key_last = x.key
	key_active.add(x.key)
	console.log(key_last)
}

window.onkeyup = (x) => {
	key_active.delete(x.key)
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
	this.delta_y = 50
	this.current_item = 0

	this.reset = () => {
		this.current_item = 0
	}

	this.process_key = () => {
		if (key_last === "ArrowDown" && this.current_item < this.options.length - 1) this.current_item++
		if (key_last === "ArrowUp" && this.current_item > 0) this.current_item--
		if (key_last === "Enter") {
			switch (this.options[this.current_item]) {
			case "Start":
				state = "game"
				game.reset()
				break
			case "Practice Start":
				state = "game"
				game.reset()
				break
			case "Result":
				state = "result"
				break
			}
		}
		key_last = ""
	}

	this.update = () => {
		this.process_key()
	}

	this.draw = () => {
		this.update()
		c.fillStyle = "#8fdfff"
		c.font = "40px Verdana"
		c.fillText(title, this.title_x, this.title_y)
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

function Pause() {
	this.options = ["Continue", "Restart", "Return to home"]
	this.base_x = 200, this.base_y = 300
	this.title_x = 350, this.title_y = 200
	this.delta_y = 50
	this.current_item = 0

	this.reset = () => {
		this.current_item = 0
	}

	this.process_key = () => {
		if (key_last === "ArrowDown" && this.current_item < this.options.length - 1) this.current_item++
		if (key_last === "ArrowUp" && this.current_item > 0) this.current_item--
		if (key_last === "Enter") {
			switch (this.options[this.current_item]) {
			case "Continue":
				state = "game"
				break
			case "Restart":
				state = "game"
				game.reset()
				break
			case "Return to home":
				state = "entrance"
				entrance.reset()
				break
			}
		}
		if (key_last === "Escape") {
			state = "game"
		}
		key_last = ""
	}

	this.update = () => {
		this.process_key()
	}

	this.draw = () => {
		this.update()
		c.fillStyle = "white"
		c.font = "40px Verdana"
		c.fillText("Paused", this.title_x, this.title_y)
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

function Player() {
	this.x = 250
	this.y = 500
	this.border = 10
	this.speed = 300

	this.draw = () => {
		c.beginPath()
		c.arc(this.x, this.y, 5, 0, 360)
		c.fillStyle = "white"
		c.lineWidth = 3
		c.stroke()
		c.fill()
	}

	this.limit_border = () => {
		if (this.x < this.border) this.x = this.border
		if (this.x > game_width - this.border) this.x = game_width - this.border
		if (this.y < this.border) this.y = this.border
		if (this.y > height - this.border) this.y = height - this.border
	}

	this.process_key = () => {
		if (key_active.has("ArrowLeft")) this.x -= this.speed / fps
		if (key_active.has("ArrowRight")) this.x += this.speed / fps
		if (key_active.has("ArrowUp")) this.y -= this.speed / fps
		if (key_active.has("ArrowDown")) this.y += this.speed / fps
		this.limit_border()
	}
}

function Game() {
	this.x1 = game_width + 50
	this.x2 = game_width + 150
	this.x3 = game_width + 50
	this.y1 = 140
	this.y2 = 200
	this.y3 = 230
	this.y4 = 290
	this.y5 = 450

	this.reset = () => {
		this.score = 0
		this.power = 0
		this.life = num_life
		this.bomb = num_bomb
		this.stage = 1
		this.player = new Player
	}

	this.process_key = () => {
		if (key_last === "Escape") {
			pause.reset()
			state = "pause"
		}
		key_last = ""
	}

	this.update = () => {
		this.process_key()
		this.player.process_key()
	}

	this.right_draw = () => {
		c.fillStyle = "black"
		c.fillRect(game_width, 0, canvas.width, canvas.height)

		c.fillStyle = "#d4d4d4"
		c.font = "20px Verdana"
		c.fillText("Score", this.x1, this.y1)
		c.fillText("Player", this.x1, this.y2)
		c.fillText("Bomb", this.x1, this.y3)
		c.fillText("Power", this.x1, this.y4)

		c.fillStyle = "white"
		c.font = "20px Verdana"
		c.fillText(this.score.toString().padStart(8, '0'), this.x2, this.y1)
		c.fillText(this.power, this.x2, this.y4)
		c.fillStyle = "#f2446f"
		for (let i = 0;i < this.life;i++) c.fillText("\u2605", this.x2 + i * 20, this.y2)
		c.fillStyle = "#2f7bf5"
		for (let i = 0;i < this.bomb;i++) c.fillText("\u2605", this.x2 + i * 20, this.y3)
		
		c.fillStyle = "#8fdfff"
		c.font = "30px Verdana"
		c.fillText(title, this.x3, this.y5)
	}

	this.left_draw = () => {
		c.fillStyle = "#8fdfff"
		c.fillRect(0, 0, game_width, canvas.height)
		this.player.draw()
	}

	this.draw = () => {
		this.update()
		this.left_draw()
		this.right_draw()
	}
}

function Result() {
	this.title_x = 350, this.title_y = 100

	this.process_key = () => {
		if (key_last === "Escape") {
			entrance.reset()
			state = "entrance"
		}
		key_last = ""
	}

	this.update = () => {
		this.process_key()
	}

	this.draw = () => {
		this.update()
		c.fillStyle = "white"
		c.font = "40px Verdana"
		c.fillText("Result", this.title_x, this.title_y)
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
	case "pause": 
		pause.draw()
		break
	}

	window.setTimeout(function () {window.requestAnimationFrame(draw)}, time_interval)
}


var canvas = document.getElementById("canvas")
canvas.width = width, canvas.height = height

var c = canvas.getContext("2d")
c.fillStyle = "black"
c.fillRect(0, 0, canvas.width, canvas.height)

var entrance = new Entrance
var game = new Game
var result = new Result
var pause = new Pause

var state = "entrance"
draw()
