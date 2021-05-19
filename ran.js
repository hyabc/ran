var width = 800, height = 600
var game_width = 500
var fps = 120
var num_life = 3
var num_bomb = 3
var title = "Project Ran"
var key_last = "", key_active = new Set
var delta_time, current_time

window.onkeydown = (x) => {
	var st = x.key
	if (st.length === 1 && 'A' <= st[0] && st[0] <= 'Z') st = st.toLowerCase()
	key_last = st
	key_active.add(st)
	console.log("keydown: " + st)
}

window.onkeyup = (x) => {
	var st = x.key
	if (st.length === 1 && 'A' <= st[0] && st[0] <= 'Z') st = st.toLowerCase()
	key_active.delete(st)
	console.log("keyup: " + st)
}

function Entrance() {
	this.options = ["Start", "Practice Start", "Result"]
	this.base_x = 100, this.base_y = 300
	this.title_x = 450, this.title_y = 200
	this.delta_y = 50
	this.current_item = 0

	this.process_key = () => {
		if (key_last === "ArrowDown" && this.current_item < this.options.length - 1) this.current_item++
		if (key_last === "ArrowUp" && this.current_item > 0) this.current_item--
		if (key_last === "Enter" || key_last === "z") {
			switch (this.options[this.current_item]) {
			case "Start":
				state = "game"
				game = new Game
				break
			case "Practice Start":
				state = "game"
				game = new Game
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

	this.process_key = () => {
		if (key_last === "ArrowDown" && this.current_item < this.options.length - 1) this.current_item++
		if (key_last === "ArrowUp" && this.current_item > 0) this.current_item--
		if (key_last === "Enter" || key_last === "z") {
			switch (this.options[this.current_item]) {
			case "Continue":
				state = "game"
				break
			case "Restart":
				state = "game"
				game.init()
				break
			case "Return to home":
				state = "entrance"
				entrance = new Entrance
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

function Bullet() {
	this.check = () => {
		return this.x >= 0 && this.x < game_width && this.y >= 0 && this.y < height
	}

	this.update = () => {
		this.x += this.x_speed * delta_time
		this.y += this.y_speed * delta_time
	}

	this.draw = () => {
		switch (this.type) {
		case "circular":
			c.beginPath()
			c.arc(this.x, this.y, this.radius, 0, 360)
			c.lineWidth = this.thickness
			c.strokeStyle = this.border_color
			c.fillStyle = this.fill_color
			c.stroke()
			c.fill()
			break
		case "square":
			c.lineWidth = this.thickness
			c.strokeStyle = this.border_color
			c.fillStyle = this.fill_color
			c.strokeRect(this.x - this.radius, this.y - this.radius, 2 * this.radius, 2 * this.radius)
			c.fillRect(this.x - this.radius, this.y - this.radius, 2 * this.radius, 2 * this.radius)
			break
		}
	}

}

function Player() {
	this.x = 250
	this.y = 500
	this.border = 10
	this.speed = 500
	this.slow_speed = 250
	this.speedchange = -1
	this.speedchange_timeout = 0.2
	this.shift_status = false
	this.shoot_status = false
	this.shoot = 0
	this.shoot_timeout = 0.1
	this.bullets = []

	this.update_bullet_array = () => {
		if (!this.shoot_status)
			this.bullets = []
		else {
			var arr = []
			this.bullets.forEach((value) => {
				value.update()
				if (value.check()) arr.push(value)
			})
			if (this.shoot == 0) {
				var b = new Bullet
				b.x = this.x
				b.y = this.y
				b.x_speed = 0
				b.y_speed = -800
				b.type = "square"
				b.radius = 8
				b.thickness = 1
				b.fill_color = "#f59d9d"
				b.border_color = "#ff5757"
				arr.push(b)
			}
			this.bullets = arr
			this.shoot += delta_time
			if (this.shoot >= this.shoot_timeout)
				this.shoot = 0
		}
	}

	this.draw_bullets = () => {
		this.update_bullet_array()
		this.bullets.forEach((value) => {value.draw()})
	}

	this.draw = () => {
		c.beginPath()
		c.arc(this.x, this.y, 5, 0, 360)
		c.fillStyle = "white"
		c.strokeStyle = "black"
		c.lineWidth = 3
		c.stroke()
		c.fill()
		if (this.speedchange != -1) {
			if (this.speedchange < this.speedchange_timeout / 2.0) 
				var radius = this.speedchange / (this.speedchange_timeout / 2.0) * 20
			else 
				var radius = (this.speedchange_timeout - this.speedchange) / (this.speedchange_timeout / 2.0) * 20
			c.beginPath()
			c.arc(this.x, this.y, radius + 5, 0, 360)
			c.lineWidth = 2
			c.strokeStyle = "#a1a1a1"
			c.stroke()
			this.speedchange += delta_time
			if (this.speedchange >= this.speedchange_timeout) this.speedchange = -1
		}
		this.draw_bullets()
	}

	this.limit_border = () => {
		if (this.x < this.border) this.x = this.border
		if (this.x > game_width - this.border) this.x = game_width - this.border
		if (this.y < this.border) this.y = this.border
		if (this.y > height - this.border) this.y = height - this.border
	}

	this.process_key = () => {
		if (key_active.has("Shift") !== this.shift_status) {
			this.shift_status = key_active.has("Shift")
			this.speedchange = 0
		}
		var current_speed = key_active.has("Shift") ? this.slow_speed : this.speed
		if (key_active.has("ArrowLeft")) this.x -= current_speed * delta_time
		if (key_active.has("ArrowRight")) this.x += current_speed * delta_time
		if (key_active.has("ArrowUp")) this.y -= current_speed * delta_time
		if (key_active.has("ArrowDown")) this.y += current_speed * delta_time
		this.limit_border()
		this.shoot_status = key_active.has("z")
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

	this.story = [
		{
			"stage": 1,
			"stage_timeout": 1,
			"midway": [
				{
				},
				{}
			],
			"boss": []
		},
		{
			"stage": 2,
			"stage_timeout": 1,
			"midway": [],
			"boss": []
		}
	]

	this.init = () => {
		this.score = 0
		this.power = 0
		this.life = num_life
		this.bomb = num_bomb
		this.stage = 1
		this.player = new Player
	}
	this.init()

	this.process_key = () => {
		if (key_last === "Escape") {
			pause = new Pause
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
			entrance = new Entrance
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
	var old_time = current_time
	current_time = new Date()
	delta_time = (current_time - old_time) / 1000.0

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

	counter++
	c.fillStyle = "white"
	c.font = "20px Verdana"
	c.fillText(delta_time.toString(), 700, 550)
	window.setTimeout(function () {window.requestAnimationFrame(draw)}, 1000.0 / fps)
}

counter = 0

var canvas = document.getElementById("canvas")
canvas.width = width, canvas.height = height

var c = canvas.getContext("2d")
c.fillStyle = "black"
c.fillRect(0, 0, canvas.width, canvas.height)

var entrance, pause, game, result = new Result

var state = "entrance"
entrance = new Entrance
current_time = new Date()
draw()
