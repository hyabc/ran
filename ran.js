var width = 800, height = 600
var game_width = 500
var fps = 120
var num_life = 3
var num_bomb = 3
var title = "Project Ran"
var key_last = "", key_active = new Set
var delta_time, current_time, counter

var story = [
	{
		type: "text",
		text: "Stage 1",
		color: "white",
		x: 210,
		y: 300,
		timeout: 1
	},
	{
		type: "game",
		enemy: [
			{
				type: "single",
				start_time: 1.0,
				start_x: 100,
				start_y: 100,
				speed: 100,
				health: 6,
				shape: "circle",
				bullet_style: {
					shape: "circle",
					radius: 4, 
					thickness: 1,
					fill_color: "white",
					border_color: "#ff5757"
				}
			}
			
		]
		
	}
]

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

function Bullet(x, y) {
	this.x = x
	this.y = y

	this.check = () => {
		return this.x >= 0 && this.x < game_width && this.y >= 0 && this.y < height
	}

	this.update = () => {
		this.x += this.x_speed * delta_time
		this.y += this.y_speed * delta_time
	}

	this.draw = () => {
		switch (this.shape) {
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

function Timer(timeout) {
	this.time = 0
	this.timeout = timeout

	this.update = () => {
		this.time += delta_time
	}

	this.expire = () => {
		return this.time >= this.timeout
	}

	this.reset = () => {
		this.time = 0
	}
}

function Player() {
	this.x = 250
	this.y = 500
	this.border = 10
	this.speed = 500
	this.slow_speed = 250
	this.speedchange = null
	this.speedchange_timeout = 0.2
	this.shift_status = false
	this.shoot = new Timer(0.05)
	this.shoot_status = false
	this.bullets = []

	this.bullet_style = {
		x_speed: 0,
		y_speed: -1500,
		shape: "square",
		radius: 8,
		thickness: 1,
		fill_color: "#f59d9d",
		border_color: "#ff5757"
	}

	this.update_bullet_array = () => {
		if (!this.shoot_status)
			this.bullets = []
		else {
			var arr = []
			this.bullets.forEach((value) => {
				value.update()
				if (value.check())
					arr.push(value)
			})
			if (this.shoot.expire()) {
				this.shoot.reset()
				arr.push(Object.assign(new Bullet(this.x, this.y - 20), this.bullet_style))
			}

			this.bullets = arr
			this.shoot.update()
		}
	}

	this.draw_bullets = () => {
		this.update_bullet_array()
		this.bullets.forEach((value) => {value.draw()})
	}

	this.update = () => {
		this.process_key()
	}

	this.draw = () => {
		this.update()

		c.beginPath()
		c.arc(this.x, this.y, 5, 0, 360)
		c.fillStyle = "white"
		c.strokeStyle = "black"
		c.lineWidth = 3
		c.stroke()
		c.fill()
		if (this.speedchange !== null) {
			var radius = Math.min(this.speedchange.time, this.speedchange_timeout - this.speedchange.time) / (this.speedchange_timeout / 2.0) * 20
			c.beginPath()
			c.arc(this.x, this.y, radius + 5, 0, 360)
			c.lineWidth = 2
			c.strokeStyle = "#a1a1a1"
			c.stroke()
			this.speedchange.update()
			if (this.speedchange.expire()) this.speedchange = null
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
			this.speedchange = new Timer(this.speedchange_timeout)
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

function Arena_text(obj) {
	Object.assign(this, obj)
	this.timer = new Timer(this.timeout)

	this.update = () => {
		this.timer.update()
	}

	this.draw = () => {
		this.update()
		c.fillStyle = this.color
		c.font = "30px Verdana"
		c.fillText(this.text, this.x, this.y)
	}

	this.expire = () => {
		return this.timer.expire()
	}

}

function Arena_game(obj) {
	Object.assign(this, obj)
	this.player = new Player
	this.enemy = []

	this.draw = () => {
		this.player.draw()
	}

	this.expire = () => {
		return false
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

	this.init = () => {
		this.score = 0
		this.power = 0
		this.life = num_life
		this.bomb = num_bomb
		this.cnt = 0
		this.arena = new Arena_text(story[0])
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
	}

	this.left_draw = () => {
		c.fillStyle = "#0133a0"
		c.fillRect(0, 0, game_width, canvas.height)

		this.arena.draw()
		if (this.arena.expire()) {
			this.cnt++
			if (story[this.cnt].type === "text")
				this.arena = new Arena_text
			else if (story[this.cnt].type === "game")
				this.arena = new Arena_game
		}
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
