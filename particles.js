class pJS
{
  constructor(tag_id, params)
  {
    this.canvas_el = document.querySelector(`#${tag_id} > .particles-js-canvas-el`);

    this.data = {
      canvas: {
        el: this.canvas_el,
        w: this.canvas_el.offsetWidth,
        h: this.canvas_el.offsetHeight
      },

      particles: {
        number: {
          value: 100,
          density: {
            enable: true,
            value_area: 800
          }
        },

        color: {
          value: '#000'
        },

        shape: {
          type: 'circle',
          stroke: {
            width: 0,
            color: '#000000'
          },

          polygon: {
            nb_sides: 5
          },

          image: {
            src: '',
            width: 100,
            height: 100
          }
        },

        opacity: {
          value: 1,
          random: false,
          anim: {
            enable: false,
            speed: 2,
            opacity_min: 0,
            sync: false
          }
        },

        size: {
          value: 10,
          random: true,
          anim: {
            enable: false,
            speed: 20,
            size_min: 0,
            sync: false
          }
        },

        line_linked: {
          enable: true,
          distance: 100,
          color: '#000',
          opacity: 1,
          width: 1
        },

        move: {
          enable: true,
          speed: 12,
          direction: 'none',
          random: true,
          straight: false,
          out_mode: 'out',
          bounce: false,
          attract: {
            enable: false,
            rotateX: 3000,
            rotateY: 3000
          }
        },

        list: []
      },

      interactivity: {
        detect_on: 'canvas',
        events: {
          onhover: {
            enable: true,
            mode: 'grab'
          },

          onclick: {
            enable: true,
            mode: 'push'
          },

          resize: true
        },
        modes: {
          grab:{
            distance: 100,
            line_linked:{
              opacity: 1
            }
          },

          bubble:{
            distance: 200,
            size: 80,
            duration: 0.4
          },

          repulse:{
            distance: 200,
            duration: 0.4
          },

          push:{
            particles_nb: 4
          },

          remove:{
            particles_nb: 2
          }
        },

        mouse:{}
      },

      retina_detect: false,

      tmp: {}
    };

    /* params settings */
    if(params){
      Object.deepExtend(this.data, params);
    }

    this.data.tmp.obj = {
      size_value: this.data.particles.size.value,
      size_anim_speed: this.data.particles.size.anim.speed,
      move_speed: this.data.particles.move.speed,
      line_linked_distance: this.data.particles.line_linked.distance,
      line_linked_width: this.data.particles.line_linked.width,
      mode_grab_distance: this.data.interactivity.modes.grab.distance,
      mode_bubble_distance: this.data.interactivity.modes.bubble.distance,
      mode_bubble_size: this.data.interactivity.modes.bubble.size,
      mode_repulse_distance: this.data.interactivity.modes.repulse.distance
    };

  /* ---------- pJS - start ------------ */

    //this.data.drawAnimFrame = null;
    that = this;

    this.eventsListeners();
    this.start();
  }
}

pJS.prototype.init = function()     // DONE!!
{
  /* init canvas + particles */
  this.retinaInit();
  this.canvasInit();
  this.canvasSize();
  this.canvasPaint();
  this.particlesCreate();
  this.densityAutoParticles();

  /* particles.line_linked - convert hex colors to rgb */
  if(!this.data.particles.line_linked.random)
    this.data.particles.line_linked.color_rgb_line = Particle.hexToRgb(this.data.particles.line_linked.color);
};

pJS.prototype.start = function()    // DONE!!
{
  if(isInArray('image', this.data.particles.shape.type))
  {
    this.data.tmp.img_type = this.data.particles.shape.image.src.substr(this.data.particles.shape.image.src.length - 3);
    this.loadImg(this.data.tmp.img_type);
  }
  else
  {
    this.checkBeforeDraw();
  }
}

pJS.prototype.grabParticle = function(p)    // DONE!!
{
  if(this.data.interactivity.events.onhover.enable && this.data.interactivity.status == 'mousemove')
  {
    let dx_mouse = p.x - this.data.interactivity.mouse.pos_x;
    let dy_mouse = p.y - this.data.interactivity.mouse.pos_y;
    let dist_mouse = Math.sqrt((dx_mouse ** 2) + (dy_mouse ** 2));

    /* draw a line between the cursor and the particle if the distance between them is under the config distance */
    if(dist_mouse <= this.data.interactivity.modes.grab.distance)
    {
      let opacity_line = this.data.interactivity.modes.grab.line_linked.opacity - (dist_mouse / (1 / this.data.interactivity.modes.grab.line_linked.opacity)) / this.data.interactivity.modes.grab.distance;

      if(opacity_line > 0)
      {
        /* style */
        
        //let color_line = this.data.particles.line_linked.color_rgb_line;

        let color_line;
        if(!this.data.particles.line_linked.random)
          color_line = this.data.particles.line_linked.color_rgb_line;
        else
        {
          color_line = {
            r: Math.floor(Math.random() * 255),
            g: Math.floor(Math.random() * 255),
            b: Math.floor(Math.random() * 255)
          }
        }




        this.data.canvas.ctx.strokeStyle = `rgba(${color_line.r},${color_line.g},${color_line.b},${opacity_line})`;
        this.data.canvas.ctx.lineWidth = this.data.particles.line_linked.width;
        //pJS.canvas.ctx.lineCap = 'round'; /* performance issue */
        
        /* path */
        this.data.canvas.ctx.beginPath();
        this.data.canvas.ctx.moveTo(p.x, p.y);
        this.data.canvas.ctx.lineTo(this.data.interactivity.mouse.pos_x, this.data.interactivity.mouse.pos_y);
        this.data.canvas.ctx.stroke();
        this.data.canvas.ctx.closePath();
      }
    }
  }
}

pJS.prototype.eventsListeners = function()    // DONE!!
{
  /* events target element */
  if( this.data.interactivity.detect_on == 'window' )
    this.data.interactivity.el = window;
  else
    this.data.interactivity.el = this.data.canvas.el;
  
  /* detect mouse pos - on hover / click event */
  if( this.data.interactivity.events.onhover.enable || this.data.interactivity.events.onclick.enable)
  {
    /*mousemove */
    this.data.interactivity.el.addEventListener('mousemove', function(e){
      let pos_x;
      let pos_y;

      // TODO: reši kako drugače, ker je trenutno vezan na enega
      if( pJSDom[0].data.interactivity.el == window){
        pos_x = e.clientX;
        pos_y = e.clientY;
      }
      else{
        pos_x = e.offsetX || e.clientX;
        pos_y = e.offsetY || e.clientY;
      }

      pJSDom[0].data.interactivity.mouse.pos_x = pos_x;
      pJSDom[0].data.interactivity.mouse.pos_y = pos_y;

      if(pJSDom[0].data.tmp.retina)
      {
        pJSDom[0].data.interactivity.mouse.pos_x *= pJSDom[0].data.canvas.pxratio;
        pJSDom[0].data.interactivity.mouse.pos_y *= pJSDom[0].data.canvas.pxratio;
      }

      pJSDom[0].data.interactivity.status = 'mousemove';

    });

    /*onmouseleave */
    this.data.interactivity.el.addEventListener('mouseleave', function(e){
      pJSDom[0].data.interactivity.mouse.pos_x = null;
      pJSDom[0].data.interactivity.mouse.pos_y = null;
      pJSDom[0].data.interactivity.status = 'mouseleave';
    });
  }

  /* on click event */
  if(this.data.interactivity.events.onclick.enable)
  {
    this.data.interactivity.el.addEventListener('click', function(e){
      pJSDom[0].data.interactivity.mouse.click_pos_x = pJSDom[0].data.interactivity.mouse.pos_x;
      pJSDom[0].data.interactivity.mouse.click_pos_y = pJSDom[0].data.interactivity.mouse.pos_y;
      pJSDom[0].data.interactivity.mouse.click_time = new Date().getTime();

      if(pJSDom[0].data.interactivity.events.onclick.enable)
      {
        switch(pJSDom[0].data.interactivity.events.onclick.mode)
        {
          case 'push':
            if(pJSDom[0].data.particles.move.enable)
            {
              pJSDom[0].pushParticles(pJSDom[0].data.interactivity.modes.push.particles_nb);
            }
            else
            {
              if(pJSDom[0].data.interactivity.modes.push.particles_nb == 1){
                pJSDom[0].pushParticles(pJSDom[0].data.interactivity.modes.push.particles_nb);
              }
              else if(pJSDom[0].data.interactivity.modes.push.particles_nb > 1){
                pJSDom[0].pushParticles(pJSDom[0].data.interactivity.modes.push.particles_nb);
              }
            }
            break;

          case 'remove':
            this.removeParticles(pJSDom[0].data.interactivity.modes.remove.particles_nb);
            break;

          case 'bubble':
            this.data.tmp.bubble_clicking = true;
            break;

          case 'repulse':
            this.data.tmp.repulse_clicking = true;
            this.data.tmp.repulse_count = 0;
            this.data.tmp.repulse_finish = false;

            setTimeout(function(){
              this.data.tmp.repulse_clicking = false;
            }, this.data.interactivity.modes.repulse.duration * 1000);

            break;
        }
      }
    });
  }
}

pJS.prototype.densityAutoParticles = function()   //DONE!!
{
  if(this.data.particles.number.density.enable)
  {
    /* calc area */
    let area = this.data.canvas.el.width * this.data.canvas.el.height / 1000;

    if(this.data.tmp.retina)
    {
      area = area / (this.data.canvas.pxratio * 2);
    }

    /* calc number of particles based on density area */
    let nb_particles = area * this.data.particles.number.value / this.data.particles.number.density.value_area;

    /* add or remove X particles */
    let missing_particles = this.data.particles.list.length - nb_particles;

    if(missing_particles < 0) 
      this.pushParticles(Math.abs(missing_particles));
    else 
      this.removeParticles(missing_particles);
  }
}

pJS.prototype.destroypJS = function()   // DONE!!
{
  cancelAnimationFrame(this.data.drawAnimFrame);
  this.data.canvas_el.remove();
  this.data.pJSDom = null;
  that = null;
}

pJS.prototype.draw = function()   // DONE!!
{
  if(that.data.particles.shape.type == 'image')
  {
    if(this.data.tmp.img_type == 'svg')
    {
      if(this.data.tmp.count_svg >= this.data.particles.number.value)
      {
        this.particlesDraw();

        if(!this.data.particles.move.enable) 
          cancelRequestAnimFrame( this.data.drawAnimFrame);
        else 
          this.data.drawAnimFrame = requestAnimFrame(this.draw);
      }
      else
      {
        if(!this.data.tmp.img_error) 
          this.data.drawAnimFrame = requestAnimFrame(this.draw);
      }
    }
    else
    {
      if(this.data.tmp.img_obj != undefined)
      {
        this.particlesDraw();

        if(!this.data.particles.move.enable) 
          cancelRequestAnimFrame( this.data.drawAnimFrame);
        else 
          this.data.drawAnimFrame = requestAnimFrame(this.draw);
      }
      else
      {
        if(!this.data.tmp.img_error) 
          this.data.drawAnimFrame = requestAnimFrame(this.draw);
      }
    }
  }
  else
  {
    that.particlesDraw();

    if(!that.data.particles.move.enable) 
      cancelRequestAnimFrame(that.data.drawAnimFrame);
    else 
      that.data.drawAnimFrame = requestAnimFrame(that.draw);
  }
}

pJS.prototype.checkBeforeDraw = function()    // DONE!!
{
  // if shape is image
  if(this.data.particles.shape.type == 'image')
  {
    if(this.data.tmp.img_type == 'svg' && this.data.tmp.source_svg == undefined)
    {
      this.data.tmp.checkAnimFrame = requestAnimFrame(check);
    }
    else
    {
      cancelRequestAnimFrame(this.data.tmp.checkAnimFrame);

      if(!this.data.tmp.img_error)
      {
        this.init();
        this.draw();
      }
    }
  }
  else
  {
    this.init();
    this.draw(this);
  }
}

pJS.prototype.drawShape = function(c, startX, startY, sideLength, sideCountNumerator, sideCountDenominator)     // DONE!!
{
  // By Programming Thomas - https://programmingthomas.wordpress.com/2013/04/03/n-sided-shapes/
  let sideCount = sideCountNumerator * sideCountDenominator;
  let decimalSides = sideCountNumerator / sideCountDenominator;
  let interiorAngleDegrees = (180 * (decimalSides - 2)) / decimalSides;
  let interiorAngle = Math.PI - Math.PI * interiorAngleDegrees / 180; // convert to radians
  c.save();
  c.beginPath();
  c.translate(startX, startY);
  c.moveTo(0,0);
  for (let i = 0; i < sideCount; i++) {
    c.lineTo(sideLength,0);
    c.translate(sideLength,0);
    c.rotate(interiorAngle);
  }
  //c.stroke();
  c.fill();
  c.restore();
}

pJS.prototype.linkParticles = function(p1, p2)    // DONE!!
{
  let color_line;
  if(!this.data.particles.line_linked.random)
    color_line = this.data.particles.line_linked.color_rgb_line;
  else
  {
    color_line = {
      r: Math.floor(Math.random() * 255),
      g: Math.floor(Math.random() * 255),
      b: Math.floor(Math.random() * 255)
    }
  }

  let dx = p1.x - p2.x;
  let dy = p1.y - p2.y;
  let dist = Math.sqrt((dx ** 2) + (dy ** 2));

  /* draw a line between p1 and p2 if the distance between them is under the config distance */
  if(dist <= this.data.particles.line_linked.distance)
  {
    let opacity_line = this.data.particles.line_linked.opacity - (dist / (1 / this.data.particles.line_linked.opacity)) / this.data.particles.line_linked.distance;

    if( opacity_line > 0)
    {        
      /* style */
      
      this.data.canvas.ctx.strokeStyle = `rgba(${color_line.r},${color_line.g},${color_line.b},${opacity_line})`;
      this.data.canvas.ctx.lineWidth = this.data.particles.line_linked.width;
      //pJS.canvas.ctx.lineCap = 'round'; /* performance issue */
      
      /* path */
      this.data.canvas.ctx.beginPath();
      this.data.canvas.ctx.moveTo(p1.x, p1.y);
      this.data.canvas.ctx.lineTo(p2.x, p2.y);
      this.data.canvas.ctx.stroke();
      this.data.canvas.ctx.closePath();
    }
  }
}

pJS.prototype.attractParticles = function(p1, p2)     // DONE!!
{
  /* condensed particles */
  let dx = p1.x - p2.x;
  let dy = p1.y - p2.y;
  let dist = Math.sqrt((dx ** 2) + (dy ** 2));

  if(dist <= this.data.particles.line_linked.distance)
  {
    let ax = dx / (this.data.particles.move.attract.rotateX * 1000);
    let ay = dy / (this.data.particles.move.attract.rotateY * 1000);

    p1.vx -= ax;
    p1.vy -= ay;

    p2.vx += ax;
    p2.vy += ay;
  }
}

pJS.prototype.bounceParticles = function(p1, p2)    // DONE!!
{
  let dx = p1.x - p2.x;
  let dy = p1.y - p2.y;
  let dist = Math.sqrt((dx ** 2) + (dy ** 2));
  let dist_p = p1.radius + p2.radius;

  if(dist <= dist_p)
  {
    p1.vx = -p1.vx;
    p1.vy = -p1.vy;

    p2.vx = -p2.vx;
    p2.vy = -p2.vy;
  }
}

pJS.prototype.pushParticles = function(number)    // DONE!
{
  this.data.tmp.pushing = true;

  for(let i = 0; i < number; i++)
    this.data.particles.list.push(
      new Particle(this)
    );

  if(!this.data.particles.move.enable)
    this.particlesDraw();

  this.data.tmp.pushing = false;
}

pJS.prototype.removeParticles = function(nb)
{
  this.data.particles.list.splice(0, nb);

  if(!this.data.particles.move.enable)
    this.particlesDraw();
}

pJS.prototype.bubbleParticle = function(p)    // DONE!!
{
  /* on hover event */
  if(this.data.interactivity.events.onhover.enable && isInArray('bubble', this.data.interactivity.events.onhover.mode))
  {
    let dx_mouse = p.x - this.data.interactivity.mouse.pos_x;
    let dy_mouse = p.y - this.data.interactivity.mouse.pos_y;
    let dist_mouse = Math.sqrt((dx_mouse ** 2) + (dy_mouse ** 2));
    let ratio = 1 - dist_mouse / this.data.interactivity.modes.bubble.distance

    function init()
    {
      p.opacity_bubble = p.opacity;
      p.radius_bubble = p.radius;
    }

    /* mousemove - check ratio */
    if(dist_mouse <= this.data.interactivity.modes.bubble.distance)
    {
      if(ratio >= 0 && this.data.interactivity.status == 'mousemove')
      {
        /* size */
        if(this.data.interactivity.modes.bubble.size != this.data.particles.size.value)
        {
          if(this.data.interactivity.modes.bubble.size > this.data.particles.size.value)
          {
            let size = p.radius + (this.data.interactivity.modes.bubble.size * ratio);
            
            if(size >= 0)
              p.radius_bubble = size;
          }
          else
          {
            let dif = p.radius - this.data.interactivity.modes.bubble.size;
            let size = p.radius - (dif * ratio);

            if(size > 0)
              p.radius_bubble = size;
            else
              p.radius_bubble = 0;
          }
        }

        /* opacity */
        if(this.data.interactivity.modes.bubble.opacity != this.data.particles.opacity.value)
        {
          if(this.data.interactivity.modes.bubble.opacity > this.data.particles.opacity.value)
          {
            let opacity = this.data.interactivity.modes.bubble.opacity * ratio;

            if(opacity > p.opacity && opacity <= this.data.interactivity.modes.bubble.opacity)
              p.opacity_bubble = opacity;
          }
          else
          {
            let opacity = p.opacity - (this.data.particles.opacity.value-this.data.interactivity.modes.bubble.opacity) * ratio;

            if(opacity < p.opacity && opacity >= this.data.interactivity.modes.bubble.opacity)
              p.opacity_bubble = opacity;
          }
        }
      }
    }
    else
      init();


    /* mouseleave */
    if(this.data.interactivity.status == 'mouseleave')
      init();
  }
  /* on click event */
  else if(this.data.interactivity.events.onclick.enable && isInArray('bubble', this.data.interactivity.events.onclick.mode))
  {
    if(this.data.tmp.bubble_clicking)
    {
      let dx_mouse = p.x - this.data.interactivity.mouse.click_pos_x;
      let dy_mouse = p.y - this.data.interactivity.mouse.click_pos_y;
      let dist_mouse = Math.sqrt((dx_mouse ** 2) + (dy_mouse ** 2));
      let time_spent = (new Date().getTime() - this.data.interactivity.mouse.click_time) / 1000;

      if(time_spent > this.data.interactivity.modes.bubble.duration)
      {
        this.data.tmp.bubble_duration_end = true;
      }

      if(time_spent > this.data.interactivity.modes.bubble.duration*2)
      {
        this.data.tmp.bubble_clicking = false;
        this.data.tmp.bubble_duration_end = false;
      }
    }

    function process(bubble_param, particles_param, p_obj_bubble, p_obj, id)
    {
      if(bubble_param != particles_param)
      {
        if(!this.data.tmp.bubble_duration_end)
        {
          if(dist_mouse <= this.data.interactivity.modes.bubble.distance)
          {
            let obj;

            if(p_obj_bubble != undefined) 
              obj = p_obj_bubble;
            else 
              obj = p_obj;
            
            if(obj != bubble_param)
            {
              let value = p_obj - (time_spent * (p_obj - bubble_param) / this.data.interactivity.modes.bubble.duration);

              if(id == 'size') 
                p.radius_bubble = value;
              if(id == 'opacity') 
                p.opacity_bubble = value;
            }
          }
          else
          {
            if(id == 'size') 
              p.radius_bubble = undefined;
            if(id == 'opacity') 
              p.opacity_bubble = undefined;
          }
        }
        else
        {
          if(p_obj_bubble != undefined)
          {
            let value_tmp = p_obj - (time_spent * (p_obj - bubble_param) / this.data.interactivity.modes.bubble.duration);
            let dif = bubble_param - value_tmp;
            let value = bubble_param + dif;

            if(id == 'size') 
              p.radius_bubble = value;
            if(id == 'opacity') 
              p.opacity_bubble = value;
          }
        }
      }
    }

    if(this.data.tmp.bubble_clicking)
    {
      /* size */
      process(this.data.interactivity.modes.bubble.size, this.data.particles.size.value, p.radius_bubble, p.radius, 'size');
      /* opacity */
      process(this.data.interactivity.modes.bubble.opacity, this.data.particles.opacity.value, p.opacity_bubble, p.opacity, 'opacity');
    }
  }
}

pJS.prototype.repulseParticle = function(p)   // DONE!!
{
  if(this.data.interactivity.events.onhover.enable && isInArray('repulse', this.data.interactivity.events.onhover.mode) && this.data.interactivity.status == 'mousemove') 
  {
    let dx_mouse = p.x - this.data.interactivity.mouse.pos_x;
    let dy_mouse = p.y - this.data.interactivity.mouse.pos_y;
    let dist_mouse = Math.sqrt((dx_mouse ** 2) + (dy_mouse ** 2));

    let normVec = {
      x: dx_mouse/dist_mouse, 
      y: dy_mouse/dist_mouse
    };
    let repulseRadius = this.data.interactivity.modes.repulse.distance;
    let velocity = 100;
    let repulseFactor = clamp((1 / repulseRadius)*(-1 * Math.pow(dist_mouse/repulseRadius,2)+1)*repulseRadius*velocity, 0, 50);
    
    let pos = {
      x: p.x + normVec.x * repulseFactor,
      y: p.y + normVec.y * repulseFactor
    }

    if(this.data.particles.move.out_mode == 'bounce')
    {
      if(pos.x - p.radius > 0 && pos.x + p.radius < this.data.canvas.w)
        p.x = pos.x;
      if(pos.y - p.radius > 0 && pos.y + p.radius < this.data.canvas.h)
        p.y = pos.y;
    }
    else
    {
      p.x = pos.x;
      p.y = pos.y;
    }
  }
  else if(this.data.interactivity.events.onclick.enable && isInArray('repulse', this.data.interactivity.events.onclick.mode))
  {
    if(!this.data.tmp.repulse_finish)
    {
      this.data.tmp.repulse_count++;

      if(this.data.tmp.repulse_count == this.data.particles.array.length)
      {
        this.data.tmp.repulse_finish = true;
      }
    }

    if(this.data.tmp.repulse_clicking)
    {
      let repulseRadius = Math.pow(this.data.interactivity.modes.repulse.distance/6, 3);

      let dx = this.data.interactivity.mouse.click_pos_x - p.x;
      let dy = this.data.interactivity.mouse.click_pos_y - p.y;
      let d = dx*dx + dy*dy;

      let force = -repulseRadius / d * 1;

      function process()
      {
        let f = Math.atan2(dy,dx);
        p.vx = force * Math.cos(f);
        p.vy = force * Math.sin(f);

        if(this.data.particles.move.out_mode == 'bounce')
        {
          let pos = {
            x: p.x + p.vx,
            y: p.y + p.vy
          };

          if (pos.x + p.radius > this.data.canvas.w) 
            p.vx = -p.vx;
          else if (pos.x - p.radius < 0) 
            p.vx = -p.vx;
          if (pos.y + p.radius > this.data.canvas.h) 
            p.vy = -p.vy;
          else if (pos.y - p.radius < 0) 
            p.vy = -p.vy;
        }
      }

      // default
      if(d <= repulseRadius)
      {
        process();
      }
    }
    else
    {
      if(this.data.tmp.repulse_clicking == false)
      {
        p.vx = p.vx_i;
        p.vy = p.vy_i;
      }
    }
  }
}

pJS.prototype.particlesCreate = function()    // DONE!!
{
  for(let i = 0; i < this.data.particles.number.value; i++)
    this.data.particles.list.push(new Particle(this));
}

pJS.prototype.particlesDraw = function()      // DONE!!
{
  /* clear canvas */
  this.data.canvas.ctx.clearRect(0, 0, this.data.canvas.w, this.data.canvas.h);

  /* update each particles param */
  this.particlesUpdate();

  /* draw each particle */
  this.data.particles.list.forEach( particle => {
    particle.draw();
  });
}

pJS.prototype.particlesEmpty = function()    // DONE!!
{
  this.data.particles.list = [];
}

pJS.prototype.particlesRefresh = function()     // DONE!!
{
  /* init all */
  cancelRequestAnimFrame(this.data.checkAnimFrame);
  cancelRequestAnimFrame(this.data.drawAnimFrame);
  this.data.tmp.source_svg = undefined;
  this.data.tmp.img_obj = undefined;
  this.data.tmp.count_svg = 0;
  this.particlesEmpty();
  this.canvasClear();
  
  /* restart */
  this.start();
}

pJS.prototype.retinaInit = function()       // DONE!!
{
  if(this.data.retina_detect && window.devicePixelRatio > 1)
  {
    this.data.canvas.pxratio = window.devicePixelRatio; 
    this.data.tmp.retina = true;
  } 
  else
  {
    this.data.canvas.pxratio = 1;
    this.data.tmp.retina = false;
  }

  this.data.canvas.w = this.data.canvas.el.offsetWidth * this.data.canvas.pxratio;
  this.data.canvas.h = this.data.canvas.el.offsetHeight * this.data.canvas.pxratio;

  this.data.particles.size.value = this.data.tmp.obj.size_value * this.data.canvas.pxratio;
  this.data.particles.size.anim.speed = this.data.tmp.obj.size_anim_speed * this.data.canvas.pxratio;
  this.data.particles.move.speed = this.data.tmp.obj.move_speed * this.data.canvas.pxratio;
  this.data.particles.line_linked.distance = this.data.tmp.obj.line_linked_distance * this.data.canvas.pxratio;
  this.data.interactivity.modes.grab.distance = this.data.tmp.obj.mode_grab_distance * this.data.canvas.pxratio;
  this.data.interactivity.modes.bubble.distance = this.data.tmp.obj.mode_bubble_distance * this.data.canvas.pxratio;
  this.data.particles.line_linked.width = this.data.tmp.obj.line_linked_width * this.data.canvas.pxratio;
  this.data.interactivity.modes.bubble.size = this.data.tmp.obj.mode_bubble_size * this.data.canvas.pxratio;
  this.data.interactivity.modes.repulse.distance = this.data.tmp.obj.mode_repulse_distance * this.data.canvas.pxratio;
}

pJS.prototype.canvasInit = function()    // DONE!!
{
  this.data.canvas.ctx = this.data.canvas.el.getContext('2d');
}

pJS.prototype.canvasSize = function()       // DONE!!
{
  this.data.canvas.el.width = this.data.canvas.w;
  this.data.canvas.el.height = this.data.canvas.h;

  if(this.data && this.data.interactivity.events.resize)
  {
    window.addEventListener('resize', function(){

      pJSDom[0].data.canvas.w = pJSDom[0].data.canvas.el.offsetWidth;
      pJSDom[0].data.canvas.h = pJSDom[0].data.canvas.el.offsetHeight;

        /* resize canvas */
        if(pJSDom[0].data.tmp.retina){
          pJSDom[0].data.canvas.w *= pJSDom[0].data.canvas.pxratio;
          pJSDom[0].data.canvas.h *= pJSDom[0].data.canvas.pxratio;
        }

        pJSDom[0].data.canvas.el.width = pJSDom[0].data.canvas.w;
        pJSDom[0].data.canvas.el.height = pJSDom[0].data.canvas.h;

        /* repaint canvas on anim disabled */
        if(!pJSDom[0].data.particles.move.enable)
        {
          pJSDom[0].particlesEmpty();
          pJSDom[0].particlesCreate();
          pJSDom[0].particlesDraw();
          pJSDom[0].densityAutoParticles();
        }

        /* density particles enabled */
        pJSDom[0].densityAutoParticles();
    });
  }
}

pJS.prototype.canvasPaint = function()    // DONE!!
{
  this.data.canvas.ctx.fillRect(0, 0, this.data.canvas.w, this.data.canvas.h);
}

pJS.prototype.canvasClear = function()    // DONE!!
{
  this.data.canvas.ctx.clearRect(0, 0, this.data.canvas.w, this.data.canvas.h);
}

pJS.prototype.particlesUpdate = function()      // DONE!!
{
  this.data.particles.list.forEach( particle => {
    /* move the particle */
    if(this.data.particles.move.enable)
    {
      let ms = this.data.particles.move.speed / 2;
      particle.x += particle.vx * ms;
      particle.y += particle.vy * ms;
    }

    /* change opacity status */
    if(this.data.particles.opacity.anim.enable)
    {
      if(particle.opacity_status == true)
      {
        if(particle.opacity >= this.data.particles.opacity.value) 
          particle.opacity_status = false;
        
        particle.opacity += particle.vo;
      }
      else
      {
        if( particle.opacity <= this.data.particles.opacity.anim.opacity_min)
          particle.opacity_status = true;
        
          particle.opacity -= particle.vo;
      }

      if(particle.opacity < 0) 
        particle.opacity = 0;
    }

    /* change size */
    if(this.data.particles.size.anim.enable)
    {
      if(particle.size_status == true)
      {
        if(particle.radius >= this.data.particles.size.value) 
          particle.size_status = false;
        
        particle.radius += particle.vs;
      }
      else
      {
        if(particle.radius <= this.data.particles.size.anim.size_min)
          particle.size_status = true;
        
        particle.radius -= particle.vs;
      }
      if(particle.radius < 0)
        particle.radius = 0;
    }

    /* change particle position if it is out of canvas */
    let new_pos;
    if(this.data.particles.move.out_mode == 'bounce')
    {
      new_pos = {
        x_left: particle.radius,
        x_right:  this.data.canvas.w,
        y_top: particle.radius,
        y_bottom: this.data.canvas.h
      }
    }
    else
    {
      new_pos = {
        x_left: -particle.radius,
        x_right: this.data.canvas.w + particle.radius,
        y_top: -particle.radius,
        y_bottom: this.data.canvas.h + particle.radius
      }
    }

    if(particle.x - particle.radius > this.data.canvas.w)
    {
      particle.x = new_pos.x_left;
      particle.y = Math.random() * this.data.canvas.h;
    }
    else if(particle.x + particle.radius < 0)
    {
      particle.x = new_pos.x_right;
      particle.y = Math.random() * this.data.canvas.h;
    }

    if(particle.y - particle.radius > this.data.canvas.h)
    {
      particle.y = new_pos.y_top;
      particle.x = Math.random() * this.data.canvas.w;
    }
    else if(particle.y + particle.radius < 0)
    {
      particle.y = new_pos.y_bottom;
      particle.x = Math.random() * this.data.canvas.w;
    }

    /* out of canvas modes */
    switch(this.data.particles.move.out_mode)
    {
      case 'bounce':
        if (particle.x + particle.radius > this.data.canvas.w) 
          particle.vx = -particle.vx;
        else if (particle.x - particle.radius < 0) 
          particle.vx = -particle.vx;
        if (particle.y + particle.radius > this.data.canvas.h) 
          particle.vy = -particle.vy;
        else if (particle.y - particle.radius < 0) 
          particle.vy = -particle.vy;
      break;
    }

    /* events */
    if(isInArray('grab', this.data.interactivity.events.onhover.mode))
    {
      this.grabParticle(particle);
    }

    if(isInArray('bubble', this.data.interactivity.events.onhover.mode) || isInArray('bubble', this.data.interactivity.events.onclick.mode))
    {
      this.bubbleParticle(particle);
    }

    if(isInArray('repulse', this.data.interactivity.events.onhover.mode) || isInArray('repulse', this.data.interactivity.events.onclick.mode))
    {
      this.repulseParticle(particle);
    }

    /* interaction auto between particles */
    if(this.data.particles.line_linked.enable || this.data.particles.move.attract.enable)
    {
      this.data.particles.list.forEach( particle2 => {
         /* link particles */
        if(this.data.particles.line_linked.enable)
        {
          this.linkParticles(particle,particle2);
        }

        /* attract particles */
        if(this.data.particles.move.attract.enable)
        {
          this.attractParticles(particle,particle2);
        }

        /* bounce particles */
        if(this.data.particles.move.bounce)
        {
          this.bounceParticles(particle,particle2);
        }
      });
    }
  });
}

/*
  Parameters:
  color:   <-- Object:
    - value:
      - r
      - g
      - b
      <-- ali Array ali string
  opacity:   <-- Object:
    - random
    - value
    - anim: 
      - speed
      - sync
  position:   <-- Object:
    - x
    - y
  size:       <-- Object:
    - random
    - value
    - anim: 
      - enable
      - speed
      - sync
  canvas:     <-- Object
*/
class Particle
{
  constructor(parent)
  {
    this.parent = parent;

    /* size */
    this.radius = (this.parent.data.particles.size.random ? Math.random() : 1) * this.parent.data.particles.size.value;
    
    if(this.parent.data.particles.size.anim.enable)
    {
      this.size_status = false;
      this.vs = this.parent.data.particles.size.anim.speed / 100;
      if(!this.parent.data.particles.size.anim.sync)
        this.vs = this.vs * Math.random();
    }

    /* position */
    this.x = this.parent.data.interactivity.mouse.click_pos_x ? this.parent.data.interactivity.mouse.click_pos_x : Math.random() * this.parent.data.canvas.w;
    this.y = this.parent.data.interactivity.mouse.click_pos_y ? this.parent.data.interactivity.mouse.click_pos_y : Math.random() * this.parent.data.canvas.h;

    /* check position  - into the canvas */
    if( this.x > (this.parent.data.canvas.w - this.radius * 2) )
      this.x = this.x - this.radius;
    else if( this.x < (this.radius * 2) ) 
      this.x = this.x + this.radius;
    if( this.y > (this.parent.data.canvas.h - this.radius * 2))
      this.y = this.y - this.radius;
    else if( this.y < (this.radius * 2) )
      this.y = this.y + this.radius;

    /* check position - avoid overlap */
    if(this.parent.data.particles.move.bounce)
    {
      Particle.checkOverlap(this, {
        x: this.x,
        y: this.y
      });
    }

    /* color */
    this.color = {};
    this.line_linked = {};

    if(typeof(this.parent.data.particles.color.value) == 'object')
    {
      // TODO: kasneje dodaj za Array
      
       if(this.parent.data.particles.color.value instanceof Array)
      {
        let color_selected = this.parent.data.particles.color.value[Math.floor(Math.random() * this.parent.data.particles.color.value.length)];
        this.color.rgb = hexToRgb(color_selected);
      }
      else
      {
         if(this.parent.data.particles.color.value.r)
          this.color.rgb = {
            r: this.parent.data.particles.color.value.r ? this.parent.data.particles.color.value.r : 255,
            g: this.parent.data.particles.color.value.g ? this.parent.data.particles.color.value.g : 255,
            b: this.parent.data.particles.color.value.b ? this.parent.data.particles.color.value.b : 255
          }

        if(this.parent.data.particles.color.value.h)
          this.color.hsl = {
            h: this.parent.data.particles.color.value.h,
            s: this.parent.data.particles.color.value.s,
            l: this.parent.data.particles.color.value.l
          }

      }

    }
    else if(this.parent.data.particles.color.value == 'random')
    {
      this.color.rgb = {
        r: ( Math.floor( Math.random() * (255 - 0 + 1)) + 0),
        g: ( Math.floor( Math.random() * (255 - 0 + 1)) + 0),
        b: ( Math.floor( Math.random() * (255 - 0 + 1)) + 0)
      }
    }
    else if(typeof(this.parent.data.particles.color.value) == 'string')
    {
      this.color = this.parent.data.particles.color;
      this.color.rgb = Particle.hexToRgb(this.color.value);
    }

    /* opacity */
    this.opacity = ( this.parent.data.particles.opacity.random ? Math.random() : 1) * this.parent.data.particles.opacity.value;

    if(this.parent.data.particles.opacity.anim.enable)
    {
      this.opacity_status = false;
      this.vo = this.parent.data.particles.opacity.anim.speed / 100;

      if(!this.parent.data.particles.opacity.anim.sync)
      {
        this.vo = this.vo * Math.random();
      }
    }

    /* animation - velocity for speed */
    this.move(this.parent.data.particles.move);

    this.shape = this.parent.data.particles.shape.type;

    if(this.shape == 'image')
    {
      let sh = this.parent.data.particles.shape;

      this.img = {
        src: sh.image.src,
        ratio: sh.image.width / sh.image.height
      }

      if(!this.img.ratio) 
        this.img.ratio = 1;
      
      if(pJS.tmp.img_type == 'svg' && pJS.tmp.source_svg != undefined)
      {
        this.parent.createSvgImg(this);

        if(this.parent.tmp.pushing)
        {
          this.img.loaded = false;
        }
      }
    }
  }

  static checkOverlap(p1, position)       // DONE!!
  {
    p1.parent.data.particles.list.forEach(p2 => {
      if(p2 != p1)
      {
        let dx = p1.x - p2.x;
        let dy = p1.y - p2.y;
        let dist = Math.sqrt((dx ** 2) + (dy ** 2));

        if(dist <= (p1.radius + p2.radius))
        {
          p1.x = position ? position.x : Math.random() * p1.parent.data.canvas.w;
          p1.y = position ? position.y : Math.random() * p1.parent.data.canvas.h;
          Particle.checkOverlap(p1);
        }
      }
    });
  }

  static hexToRgb(hex)      // DONE!!
  {
    // By Tim Down - http://stackoverflow.com/a/5624139/3493650
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")

    let shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function(m, r, g, b) {
      return r + r + g + g + b + b;
    });
    let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

    return result ? {
      r: parseInt( result[1], 16),
      g: parseInt( result[2], 16),
      b: parseInt( result[3], 16)
    } : null;
  }

  move(move)
  {
    if(move.direction)
      switch(move.direction){
        case 'top':
          this.velbase = { 
            x: 0, 
            y: -1 
          };
          
          break;
        case 'top-right':
          this.velbase = { 
            x: 0.5, 
            y: -0.5 
          };

          break;
        case 'right':
          this.velbase = { 
            x: 1, 
            y: -0 
          };

          break;
        case 'bottom-right':
          this.velbase = { 
            x: 0.5, 
            y: 0.5 
          };

          break;
        case 'bottom':
          this.velbase = { 
            x: 0, 
            y: 1 
          };

          break;
        case 'bottom-left':
          this.velbase = { 
            x: -0.5,
            y: 1 
            };

          break;
        case 'left':
          this.velbase = { 
            x: -1, 
            y: 0 
          };

          break;
        case 'top-left':
          this.velbase = { 
            x: -0.5, 
            y: -0.5 
          };

          break;
        default:
          this.velbase = { 
            x: 0, 
            y: 0 
          };
          
          break;
      }

    if(move.straight)
    {
      this.vx = this.velbase.x;
      this.vy = this.velbase.y;

      if(move.random)
      {
        this.vx = this.vx * (Math.random());
        this.vy = this.vy * (Math.random());
      }
    }
    else
    {
      this.vx = this.velbase.x + Math.random()-0.5;
      this.vy = this.velbase.y + Math.random()-0.5;
    }

    this.vx_i = this.vx;
    this.vy_i = this.vy;
  }
}

Particle.prototype.draw = function()      // DONE!!
{
  let opacity = this.opacity_bubble ? this.opacity_bubble : this.opacity;
  let radius = this.radius_bubble ? this.radius_bubble : this.radius;
  let color_value = this.color.rgb ? `rgba(${this.color.rgb.r},${this.color.rgb.g},${this.color.rgb.b},${opacity})` : `hsla(${p.color.hsl.h},${p.color.hsl.s}%,${p.color.hsl.l}%,${opacity})`;

  this.parent.data.canvas.ctx.fillStyle = color_value;
  this.parent.data.canvas.ctx.beginPath();

  switch(this.shape)
  {
    case 'circle':
      this.parent.data.canvas.ctx.arc(this.x, this.y, radius, 0, Math.PI * 2, false);
      break;

    case 'box':
      this.parent.data.canvas.ctx.rect(this.x-radius, this.y-radius, radius*2, radius*2);
      break;

    case 'triangle':
      this.parent.drawShape(this.parent.data.canvas.ctx, this.x-radius, this.y+radius / 1.66, radius*2, 3, 2);
      break;

    case 'polygon':
      this.parent.drawShape(
        this.parent.data.canvas.ctx,
        this.x - radius / (this.parent.data.particles.shape.polygon.nb_sides/3.5), // startX
        this.y - radius / (2.66/3.5), // startY
        radius*2.66 / (this.parent.data.particles.shape.polygon.nb_sides/3), // sideLength
        this.parent.data.particles.shape.polygon.nb_sides, // sideCountNumerator
        1 // sideCountDenominator
      );
      break;

    case 'star':
      this.parent.drawShape(
        this.parent.data.canvas.ctx,
        this.x - radius*2 / (this.parent.data.particles.shape.polygon.nb_sides/4), // startX
        this.y - radius / (2*2.66/3.5), // startY
        radius*2*2.66 / (this.parent.data.particles.shape.polygon.nb_sides/3), // sideLength
        this.parent.data.particles.shape.polygon.nb_sides, // sideCountNumerator
        2 // sideCountDenominator
      );
      break;

    case 'image':

      function draw(){
        this.parent.data.canvas.ctx.drawImage(
          img_obj,
          this.x-radius,
          this.y-radius,
          radius*2,
          radius*2 / p.img.ratio
        );
      }

      if(this.parent.tmp.img_type == 'svg'){
        let img_obj = this.img.obj;
      }else{
        let img_obj = this.parent.tmp.img_obj;
      }

      if(img_obj)
      {
        draw();
      }
      break;
  }

  this.parent.data.canvas.ctx.closePath();
  
  if(this.parent.data.particles.shape.stroke.width > 0)
  {
    this.parent.data.canvas.ctx.strokeStyle = this.parent.data.particles.shape.stroke.color;
    this.parent.data.canvas.ctx.lineWidth = this.parent.data.particles.shape.stroke.width;
    this.parent.data.canvas.ctx.stroke();
  }

  this.parent.data.canvas.ctx.fill();
}

/* ---------- global functions - vendors ------------ */

Object.deepExtend = function(destination, source) {
  for (let property in source) {
    if (source[property] && source[property].constructor &&
     source[property].constructor === Object) {
      destination[property] = destination[property] || {};
      arguments.callee(destination[property], source[property]);
    } else {
      destination[property] = source[property];
    }
  }
  return destination;
};

window.requestAnimFrame = ( function(){
  return window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame    ||
    window.oRequestAnimationFrame      ||
    window.msRequestAnimationFrame     ||
    function(callback)
    {
      window.setTimeout(callback, 1000 / 60);
    };
})();

window.cancelRequestAnimFrame = ( function() {
  return window.cancelAnimationFrame         ||
    window.webkitCancelRequestAnimationFrame ||
    window.mozCancelRequestAnimationFrame    ||
    window.oCancelRequestAnimationFrame      ||
    window.msCancelRequestAnimationFrame     ||
    clearTimeout
} )();

function clamp(number, min, max) {
  return Math.min(Math.max(number, min), max);
};

function isInArray(value, array) {
  return array.indexOf(value) > -1;
}

/* ---------- particles.js functions - start ------------ */

window.pJSDom = [];
let that = {};

window.particlesJS = function(tag_id = 'particles-js', params){

  /* no string id? so it's object params, and set the id with default id */
  if(typeof(tag_id) != 'string'){
    params = tag_id;
    tag_id = 'particles-js';
  }

  /* pJS elements */
  let pJS_tag = document.getElementById(tag_id);
  
  pJS_canvas_class = 'particles-js-canvas-el';

  exist_canvas = pJS_tag.getElementsByClassName(pJS_canvas_class);

  /* remove canvas if exists into the pJS target tag */
  while(exist_canvas.length > 0){
    pJS_tag.removeChild(exist_canvas[0]);
  }

  /* create canvas element */
  let canvas_el = document.createElement('canvas');
  canvas_el.className = pJS_canvas_class;

  /* set size canvas */
  canvas_el.style.width = "100%";
  canvas_el.style.height = "100%";

  /* append canvas */
  var canvas = document.getElementById(tag_id).appendChild(canvas_el);

  /* launch particle.js */
   if(canvas != null){
    pJSDom.push(new pJS(tag_id, params));
  } 
  // **************
};

window.particlesJS.load = function({noFile, param, tag_id, path_config_json, callback}){

  if(!noFile)
  {
    /* load json config */
    var xhr = new XMLHttpRequest();
    xhr.open('GET', path_config_json);
    xhr.onreadystatechange = function (data) {
      if(xhr.readyState == 4){
        if(xhr.status == 200){
          var params = JSON.parse(data.currentTarget.response);
          window.particlesJS(tag_id, params);
          if(callback) callback();
        }else{
          console.log('Error pJS - XMLHttpRequest status: '+xhr.status);
          console.log('Error pJS - File config not found');
        }
      }
    };
    xhr.send();
  }
  else
  {
    window.particlesJS(tag_id, param);
    if(callback) 
      callback();
  }
};

/*

  Added:
  1. possible to start without json file
  2. fixed if tag_id is not added in window.particlesJS
  3. removed if statment in window.particlesJS


*/