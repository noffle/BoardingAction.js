var Physics = require('./physics')
var PixiSprite = require('./pixi-sprite')
var WeaponDefs = require('./weapon-defs')
var ProjectileDefs = require('./projectile-defs')

function Weapons () {
  this.attached = []

  this.attach = function (weaponDef, opts) {
    if (!weaponDef) throw new Error('missing weaponDef param')
    opts = opts || {}
    opts.x = opts.x || 0
    opts.y = opts.y || 0
    opts.rot = opts.rot || 0
    opts.fixed = (opts.fixed === true || opts.fixed === false) || true

    this.attached.push({
      lastFireTime: 0,
      def: weaponDef,
      x: opts.x,
      y: opts.y,
      rot: opts.rot,
      fixed: opts.fixed
    })
  }
}

Weapons.install = function (recs, app) {
  recs.on([Physics, Weapons], 'fire-weapon', function (e, idx) {
    idx = idx || 0

    var weapon = e.weapons.attached[idx]
    var weaponDef = WeaponDefs[weapon.def]
    var projDef = ProjectileDefs[weaponDef.projectileDef]

    var now = (new Date()).getTime()
    if (now - weapon.lastFireTime > weaponDef.fireRate) {
      weapon.lastFireTime = now
    } else {
      return
    }

    // TODO: maybe fire an event /w the projectile?

    recs.entity('projectile', [Physics, PixiSprite], function (p) {
      var proj = new PIXI.Graphics()
      proj.lineStyle(projDef.lineWidth, projDef.lineColor, 1)
      proj.moveTo(0, 0)
      proj.lineTo(projDef.lineLength, 0)
      app.stage.addChild(proj)
      p.pixiSprite = proj

      p.physics.x = e.physics.x
      p.physics.y = e.physics.y
      p.physics.rot = e.physics.rot
      p.physics.xv = Math.cos(p.physics.rot) * projDef.speed
      p.physics.yv = Math.sin(p.physics.rot) * projDef.speed
    })
    console.log('bang bang! shot a', WeaponDefs[weapon.def].projectileDef, 'from a', weapon.def)
  })
}

module.exports = Weapons
