var width = 800, height = 600
var game_width = 500
var fps = 120
var num_life = 3
var num_bomb = 3
var judge_distance = 5
var title = "Project Ran"

var key_last = "", key_active = new Set, isloaded = false

var story = [
	{
		type: "text",
		content: [
			{
				text: "Stage 1",
				x: 210, 
				y: 250,
				color: "white",
				font: "30px Verdana"
			},
			{
				text: "On Huaji trees are Huaji fruits,",
				x: 100,
				y: 300,
				color: "white",
				font: "16px Verdana"
			},
			{
				text: "Under Huaji trees are you and me,",
				x: 100,
				y: 325,
				color: "white",
				font: "16px Verdana"
			},
			{
				text: "What will happen to the land of Huaji fruit?",
				x: 100,
				y: 350,
				color: "white",
				font: "16px Verdana"
			},
			{
				text: "滑稽树上滑稽果，滑稽树下你和我。",
				x: 100,
				y: 390,
				color: "white",
				font: "16px Verdana"
			},
			{
				text: "滑稽果出现之地，会发生什么呢？",
				x: 100,
				y: 415,
				color: "white",
				font: "16px Verdana"
			}
		],
		timeout: 2
	},
	{
		type: "game",
		enemy: [
			{
				type: "single",
				start_time: 1.0,
				start_x: 100,
				start_y: 100,
				start_health: 10.0,
				health_decrease_time: 1.0,
				self_style: {
					type: "image",
					image_id: "huaji",
					radius: 30
				},
				movement: {
					type: "simple", 
					x_speed: 0,
					y_speed: 150
				},
				bullet_speed: 500,
				bullet_array_style: {
					bullet_style: {
						type: "circle",
						radius: 8, 
						thickness: 5,
						fill_color: "white",
						border_color: "#ff5757"
					},
					bullet_time_interval: 0.5,
					bullet_num: 5
				}
			},
			{
				type: "single",
				start_time: 2.0,
				start_x: 100,
				start_y: 100,
				start_health: 10.0,
				health_decrease_time: 1.0,
				self_style: {
					type: "image",
					image_id: "huaji",
					radius: 30
				},
				movement: {
					type: "simple", 
					x_speed: 0,
					y_speed: 150
				},
				bullet_speed: 500,
				bullet_array_style: {
					bullet_style: {
						type: "circle",
						radius: 8, 
						thickness: 5,
						fill_color: "white",
						border_color: "#ff5757"
					},
					bullet_time_interval: 0.5,
					bullet_num: 5
				}
			},
			{
				type: "single",
				start_time: 3.0,
				start_x: 100,
				start_y: 100,
				start_health: 10.0,
				health_decrease_time: 1.0,
				self_style: {
					type: "image",
					image_id: "huaji",
					radius: 30
				},
				movement: {
					type: "simple", 
					x_speed: 0,
					y_speed: 150
				},
				bullet_speed: 500,
				bullet_array_style: {
					bullet_style: {
						type: "circle",
						radius: 8, 
						thickness: 5,
						fill_color: "white",
						border_color: "#ff5757"
					},
					bullet_time_interval: 0.5,
					bullet_num: 5
				}
			}
		]
	}
]

var player_style = {
	start_x: 250,
	start_y: 500,
	speed: 500,
	slow_speed: 250,
	speedchange_timeout: 0.2,
	border: 20,
	self_style: {
		type: "circle",
		radius: 6,
		thickness: 2,
		fill_color: "white",
		border_color: "black"
	}, 
	bullet_speed: 1500,
	bullet_array_style: {
		bullet_style: {
			type: "square",
			radius: 8,
			thickness: 1,
			fill_color: "#f59d9d",
			border_color: "#ff5757"
		},
		bullet_time_interval: 0.05,
		bullet_num: -1
	}
}

window.onkeydown = (x) => {
	var st = x.key
	if (st.length === 1 && 'A' <= st[0] && st[0] <= 'Z') st = st.toLowerCase()
	key_last = st
	key_active.add(st)
}

window.onkeyup = (x) => {
	var st = x.key
	if (st.length === 1 && 'A' <= st[0] && st[0] <= 'Z') st = st.toLowerCase()
	key_active.delete(st)
}

window.onload = () => {
	isloaded = true
}

function Shape(obj) {
	Object.assign(this, obj)

	this.check = () => {
		return this.x >= 0 && this.x < game_width && this.y >= 0 && this.y < height
	}

	this.update = () => {
		this.x += this.x_speed * delta_time
		this.y += this.y_speed * delta_time
	}

	this.draw = () => {
		switch (this.type) {
		case "circle":
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
		case "image":
			var img = document.getElementById(this.image_id)
			c.drawImage(img, this.x - this.radius, this.y - this.radius, 2 * this.radius, 2 * this.radius)
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

function Bullet_array(obj) {
	Object.assign(this, obj)
	this.bullets = []
	this.timer = new Timer(this.bullet_time_interval)
	this.num = this.bullet_num

	this.update = (delta_obj) => {
		this.timer.update()
		var arr = []
		this.bullets.forEach((value) => {
			value.update()
			if (value.check())
				arr.push(value)
		})
		if (this.timer.expire() && (this.num > 0 || this.num === -1)) {
			this.timer.reset()
			if (this.num !== -1) this.num--
			arr.push(new Shape(Object.assign(delta_obj, this.bullet_style)))
		}

		this.bullets = arr
	}

	this.reset = () => {
		this.bullets = []
	}

	this.draw = (delta_obj) => {
		this.update(delta_obj)
		this.bullets.forEach((value) => {value.draw()})
	}
}

function Player() {
	Object.assign(this, player_style)
	this.speedchange = new Timer(this.speedchange_timeout)
	this.speedchange.time = -1
	this.shift_status = false
	this.shoot_status = false
	this.shape = new Shape(this.self_style)
	this.shape.x = this.start_x
	this.shape.y = this.start_y
	this.bullet_array = new Bullet_array(this.bullet_array_style)

	this.update = () => {
		this.process_key()
	}

	this.draw_speedchange = () => {
		this.speedchange.update()
		var radius = Math.min(this.speedchange.time, this.speedchange_timeout - this.speedchange.time) / (this.speedchange_timeout / 2.0) * 20
		c.beginPath()
		c.arc(this.shape.x, this.shape.y, radius + 5, 0, 360)
		c.lineWidth = 2
		c.strokeStyle = "#a1a1a1"
		c.stroke()
	}

	this.draw = () => {
		this.update()

		this.shape.draw()
		if (this.speedchange.time !== -1) {
			this.draw_speedchange()
			if (this.speedchange.expire()) this.speedchange.time = -1
		}
		if (this.shoot_status) 
			this.bullet_array.draw({x: this.shape.x, y: this.shape.y - 20, x_speed: 0, y_speed: -this.bullet_speed})
		else
			this.bullet_array.reset()
	}

	this.limit_border = () => {
		this.shape.x = Math.max(this.shape.x, this.border)
		this.shape.y = Math.max(this.shape.y, this.border)
		this.shape.x = Math.min(this.shape.x, game_width - this.border)
		this.shape.y = Math.min(this.shape.y, height - this.border)
	}

	this.process_key = () => {
		if (key_active.has("Shift") !== this.shift_status) {
			this.shift_status = key_active.has("Shift")
			this.speedchange.reset()
		}
		var current_speed = key_active.has("Shift") ? this.slow_speed : this.speed
		var mask = (key_active.has("ArrowLeft") ? 8 : 0) | (key_active.has("ArrowRight") ? 4 : 0) |
			(key_active.has("ArrowUp") ? 2 : 0) | (key_active.has("ArrowDown") ? 1 : 0)
		switch (mask) {
			case 8:
				this.shape.x -= current_speed * delta_time
				break
			case 4:
				this.shape.x += current_speed * delta_time
				break
			case 2:
				this.shape.y -= current_speed * delta_time
				break
			case 1: 
				this.shape.y += current_speed * delta_time
				break
			case 10:
				this.shape.x -= current_speed * delta_time / 1.414
				this.shape.y -= current_speed * delta_time / 1.414
				break
			case 9: 
				this.shape.x -= current_speed * delta_time / 1.414
				this.shape.y += current_speed * delta_time / 1.414
				break
			case 6:
				this.shape.x += current_speed * delta_time / 1.414
				this.shape.y -= current_speed * delta_time / 1.414
				break
			case 5:
				this.shape.x += current_speed * delta_time / 1.414
				this.shape.y += current_speed * delta_time / 1.414
				break
		}
		this.limit_border()
		this.shoot_status = key_active.has("z")
	}
}

function Arena_text(obj) {
	Object.assign(this, obj)
	this.timer = new Timer(this.timeout)

	this.draw = () => {
		this.timer.update()
		this.content.forEach((value) => {
			c.fillStyle = value.color
			c.font = value.font
			c.fillText(value.text, value.x, value.y)
		})
	}

	this.expire = () => {
		return this.timer.expire()
	}

}

function Enemy(obj) {
	Object.assign(this, obj)
	this.timer = new Timer
	this.shape = new Shape(this.self_style)
	this.shape.x = this.start_x
	this.shape.y = this.start_y
	this.health = this.start_health
	this.bullet_array = new Bullet_array(this.bullet_array_style)

	this.expire = () => {
		return this.health < 0
	}

	this.update = () => {
		this.health -= delta_time * this.health_decrease_time
		switch (this.movement.type) {
		case "simple":
			this.shape.x_speed = this.movement.x_speed
			this.shape.y_speed = this.movement.y_speed
			this.shape.update()
			break
		}
	}

	this.draw = () => {
		this.update()
		this.shape.draw()
		switch (this.type) {
		case "single":
			var dist = Math.sqrt((this.shape.x - player.shape.x) * (this.shape.x - player.shape.x) + (this.shape.y - player.shape.y) * (this.shape.y - player.shape.y))
			if (dist >= judge_distance) {
				var x_speed = this.bullet_speed / dist * (player.shape.x - this.shape.x)
				var y_speed = this.bullet_speed / dist * (player.shape.y - this.shape.y)
			}
			break
		}
		this.bullet_array.draw({x: this.shape.x, y: this.shape.y, x_speed: x_speed, y_speed: y_speed})
	}

}

function Arena_game(obj) {
	Object.assign(this, obj)
	player = new Player
	this.timer = new Timer
	this.enemy_active = new Map

	this.draw = () => {
		this.timer.update()
		player.draw()
		this.enemy.forEach((value, index) => {
			if (this.timer.time >= value.start_time && !this.enemy_active.has(index)) {
				this.enemy_active.set(index, new Enemy(value))
			}
		})
		this.enemy_active.forEach((value) => {
			if (!value.expire()) value.draw()
		})
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
		if (!isloaded) {
			loading = new Loading
			state = "loading"
		}
	}

	this.draw_left = () => {
		c.fillStyle = "#0133a0"
		c.fillRect(0, 0, game_width, canvas.height)

		this.arena.draw()
		if (this.arena.expire()) {
			this.cnt++
			if (story[this.cnt].type === "text")
				this.arena = new Arena_text(story[this.cnt])
			else if (story[this.cnt].type === "game")
				this.arena = new Arena_game(story[this.cnt])
		}
	}

	this.draw_right = () => {
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
		this.draw_left()
		this.draw_right()
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

function Loading() {
	this.title_x = 200, this.title_y = 300

	this.update = () => {
		if (isloaded) {
			state = "game"
		}
	}

	this.draw = () => {
		this.update()
		c.fillStyle = "white"
		c.font = "40px Verdana"
		c.fillText("Loading, Please wait", this.title_x, this.title_y)
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
	case "loading":
		loading.draw()
		break
	}

	counter++
	c.fillStyle = "white"
	c.font = "20px Verdana"
	c.fillText(delta_time.toString(), 700, 550)
	window.setTimeout(function () {window.requestAnimationFrame(draw)}, 1000.0 / fps)
}

var canvas = document.getElementById("canvas")
canvas.width = width, canvas.height = height
var c = canvas.getContext("2d")
c.fillStyle = "black"
c.fillRect(0, 0, canvas.width, canvas.height)

var state = "entrance"
var entrance = new Entrance, pause, loading, game, player, result = new Result

var delta_time, current_time = new Date(), counter = 0
draw()
