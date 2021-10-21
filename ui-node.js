let all_ui_points = [] // all UINodes automatically add themself to this list
//Draggable implementation: https://github.com/awillats/dynamics-visualizer-p5/blob/main/dragPoints.js


function add_ui_node(node){
  all_ui_points.push(node)
}

function update_all_ui( force_param_update = false ){
  all_ui_points.forEach( function(item,index){ item.update( force_param_update );item.over();} ); 
}
function show_all_ui(){
  all_ui_points.forEach( function(item,index){ item.show(); } ); 
}
function press_all_ui(){
  all_ui_points.forEach( function(item,index){ item.pressed(); } ); 
}

function release_all_ui(){
  all_ui_points.forEach( function(item,index){ item.released(); } ); 
}

// misc helper function 

function get_ui_colors(){
  var style = window.getComputedStyle(document.body)
  //var style = document.querySelector(':root').style;
  let color_spec = {
   'face':style.getPropertyValue('--ui-face-color'),
   'edge':style.getPropertyValue('--ui-edge-color'),
   'light_edge':style.getPropertyValue('--ui-light-edge-color'),
   'back':style.getPropertyValue('--ui-back-color'),
   //'light_edge':style.getPropertyValue('--ui-edge-color'),
  }
  return color_spec
}

function fnum(num) {
  return num.toFixed(1);
}
function round_by(val,step){
  dv = val%step
  if (dv>step/2.0){
    dv -= step
  }
  return val-dv
}

function int_range(min_v,max_v=false){
  //akin to numpy's range function, generates integers between min and max val
  if (!max_v)
  {
    max_v = min_v
    min_v = 0
  }
  return Array(max_v-min_v+1).fill().map((_,idx)=>min_v+idx)
}

////

class LinearConstraint {
  constructor(min,max,step=false)
  {
    this.min=min
    this.max=max
    this.step=step
  }
  shift(dv)
  {
    this.min+=dv
    this.max+=dv
  }
  expand(dc)
  {
    this.min-=dv
    this.max+=dv
  }
  scale(s){
    this.min*=s
    this.max*=s
    if (this.step){
      this.step*=s
    }
  }
  range(){ return this.max-this.min }
  center(){ return this.range()/2.0+this.min }
  mapval(v,to_min=0.0, to_max=1.0){
    return map(v, this.min, this.max, to_min, to_max)
  }
  dv(v) { return v-this.min }
  bound(v){ return constrain(v, this.min, this.max) }
  round_to_step(v)
  {
    if (!this.step) { return v }
    return this.min + round_by( this.dv(v), this.step ) 
  }
  constrain(v){ 
    return this.bound(this.round_to_step(v));
    //return this.bound(v)
  }
  n_steps(){ 
    if (!this.step) { return 0; }
    return floor(this.range()/this.step);
  }
  index_to_step_val(idx){
    return idx*this.step+this.min;
  }
  step_vals(){
    if (!this.step) { return []; }
    let step_indices = int_range(this.n_steps());
    return step_indices.map( v => this.index_to_step_val(v) );
  }
  horiz_line(y) { line(this.min, y, this.max, y); }
  vert_line(x) { line(x, this.min, x, this.max); }
}

////

class BoxConstraint {
  constructor(xcon, ycon)
  {
    this.xcon=xcon;
    this.ycon=ycon;
  }
  constrain(x, y){
    x = this.xcon.constrain(x)
    y = this.ycon.constrain(y)
    return [x,y];
  }
  minmin(){
    return new p5.Vector(this.xcon.min,this.ycon.min)
  }
  maxmax(){
    return new p5.Vector(this.xcon.max,this.ycon.max)
  }
  center(){
    let diff_v = this.maxmax().sub(this.minmin()).div(2)
    return diff_v.add(this.minmin())
  }
  midleft(){return new p5.Vector(this.xcon.min, this.ycon.center())}
  width() {return this.xcon.range() }
  height() {return this.ycon.range() }
  show(){
    push()
    
    push()
    noFill()
    stroke(color(get_ui_colors().light_edge))
    // draw gridlines
    this.xcon.step_vals().forEach(v => line(v, this.ycon.min, v, this.ycon.max ) ) 
    this.ycon.step_vals().forEach(v => line(this.xcon.min, v, this.xcon.max, v ) ) 
    pop()
    //stroke(get_ui_colors().edge)
    
    rectMode(CORNERS)
    rect(this.xcon.min, this.ycon.min, this.xcon.max, this.ycon.max)
  
    pop()
  }
  //likely useless, want to think about constraining outer edge of circle to within bounds
  expand_constraints(dx,dy){
    this.xcon.expand(dx);
    this.ycon.expand(dy);
  }
  shift(dx=0.0, dy=0.0){
    this.xcon.add(dx);
    this.xcon.add(dy);
  }
  scale(xScale=1.0, yScale=1.0){
    this.xcon.scale(xScale)
    this.ycon.scale(yScale)
  }
  scaled_copy(xScale,yScale){
    var scaled_clone = Object.assign({}, this);
    scaled_clone.scale(xScale, yScale)
    return scaled_clone
  }
  mapfrom_xy(x,y){
    mx = this.xcon.map(x, 0.0, 1.0)
    my = this.ycon.map(y, 0.0, 1.0)
  }
}

/////

class UINode extends Draggable {
  constructor(x,y, node_color = get_ui_colors().face){
    super(x, y, node_color)
    this.hw = 20;
    this.hh = this.hw;
    this.color = color(node_color);
    add_ui_node( this );
    this.ondrag_callbacks = [];
  }
//  drawCircle() { 
//    ellipseMode(RADIUS)
//    ellipse(this.x, this.y, this.hh)
//  }
  _draw_node_()
  {
    super.show();
  }
  draw_text(str){
    push()
    //rectMode(CENTER)
    textAlign(CENTER, CENTER)
    
    fill( get_style_prop('--ui-text-color'))
    let size_str = get_style_prop('--ui-text-size')

    textSize( parseFloat(size_str) );
    text(str, this.x, this.y)
    pop()
    noStroke();
  }
  show() {
    push()
    super.show()
    let val = this.getValue()
    this.draw_text( `${fnum(val.x)}, ${fnum(val.y)}` )
    pop();
  }
  update( force_param_update = false)
  {
    super.update()
    if ((this.dragging) || (force_param_update))
    {
      // some alternate implementations here:
      // modeled after Alter the register function to take the object: http://www.bitstructures.com/2007/11/javascript-method-callbacks.html
      // https://stackoverflow.com/questions/20279484/how-to-access-the-correct-this-inside-a-callback
      this.ondrag_callbacks.forEach( f => f() );
    }
  }

}
class Slider1D extends UINode {
  constructor(x, y,
      wh = 50,
      is_vertical = true,
      node_color = get_ui_colors().face
      ) {
    super (x,y, node_color)
    this.is_vertical = is_vertical
    let v = this.pos(x,y);// (is_vertical ? y : x)

    let pos_con = new LinearConstraint( v-wh, v+wh );
    this.set_constraints(new LinearConstraint(0, 1), pos_con);
  }
  set_constraints( val_con, pos_con){
    this.value_constraints = val_con;
    if (pos_con) {
      this.position_constraints = pos_con;
    }
    
    //let con_min = this.position_constraints.max;
    let xo = (this.is_vertical ? this.x : this.position_constraints.min );
    let yo = (this.is_vertical ? this.position_constraints.max : this.y );
    this.origin = new p5.Vector(xo, yo)

    this.xScale = this.value_constraints.range()/this.position_constraints.range()
    this.yScale = -this.value_constraints.range()/this.position_constraints.range()

    if (!pos_con){
      this.position_constraints.step = this.value_constraints.step / this.pos(this.xScale, this.yScale)
    }

  }
  set_origin(x=null, y=null)
  {
    if (x==null) { x = this.x; }
    if (y==null) { y = this.y; }
    let xo = (this.is_vertical ? this.x : x);
    let yo = (this.is_vertical ? y : this.y );
    this.origin = new p5.Vector(xo, yo)
  }
  pos(x=null, y=null){
    if (x instanceof p5.Vector) {
      let xy = x.copy();
      x = xy.x;
      y = xy.y;
    }
    else{
      x = (x==null ? this.x : x);
      y = (y==null ? this.y : y);
    }
    return (this.is_vertical ? y : x)
  }
  update(){
    super.update()
    this.constrain_pos();
  }
  constrain_pos()
  {
    if ( this.is_vertical ){
      this.x = this.origin.x;
      this.y = this.position_constraints.constrain(this.y);
    }
    else{
      this.x = this.position_constraints.constrain(this.x);
      this.y = this.origin.y;
    }
  }
  getValue(){
    this.constrain_pos();
    return super.getValue();
  }
  set_value( v )
  {
    //certainly has to be a more concise way to write this
    // should be a general method for mapping between two ranges (if doesnt already exist)
  if (this.is_vertical)
    {
      this.y = this.value_constraints.mapval(v, this.position_constraints.min, this.position_constraints.max);
    }
    else
    {
      this.x = this.value_constraints.mapval(v, this.position_constraints.min, this.position_constraints.max);
    }
  }
  show(){
    push()
    noFill();
    strokeWeight(2);
    stroke(get_ui_colors().edge);

    if ( this.is_vertical ){
      this.position_constraints.vert_line(this.origin.x);
    }
    else{
      this.position_constraints.horiz_line(this.origin.y);
    }
    pop()
    super._draw_node_();
    //super.show();
    let val = this.getValue()
    let relevant_val = (this.is_vertical ? val.y : val.x)
    this.draw_text( `${fnum(relevant_val)}` )

  }
}

//

class Slider2D extends UINode {
  constructor(x,y, node_color = get_ui_colors().face) {
    super (x,y, node_color)
    this.value_constraints = new BoxConstraint(
      new LinearConstraint(0,10,1),
      new LinearConstraint(-5,5,.1));

    this.position_constraints = new BoxConstraint(
      new LinearConstraint(x, x+100),
      new LinearConstraint(y-50, y+50));

    if (this.position_constraints){
      this.origin = this.position_constraints.midleft()
      this.xScale = this.value_constraints.width()/this.position_constraints.width()
      this.yScale = -this.value_constraints.height()/this.position_constraints.height()
    }
  }
  update() {
    super.update();
    [this.x,this.y] = this.position_constraints.constrain(this.x,this.y)
  }

  show() {
    noFill()
    stroke(get_ui_colors().light_edge)
    this.position_constraints.show()

    push()
    strokeWeight(2)
    stroke(get_ui_colors().edge)
    this.position_constraints.xcon.horiz_line(this.origin.y)
    this.position_constraints.ycon.vert_line(this.origin.x)
    pop()

    super.show();
  }
}

