let all_ui_points = []


function get_css_colors(){
  var style = window.getComputedStyle(document.body)
  //var style = document.querySelector(':root').style;
  let default_fill_color = style.getPropertyValue('--ui-face-color')
  let default_edge_color = style.getPropertyValue('--ui-edge-color')
  return default_fill_color
}

function add_ui_node(node){
  all_ui_points.push(node)
}

function update_all_ui(){
  all_ui_points.forEach( function(item,index){ item.update();item.over();} ); 
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

class PositionConstraint {
  constructor(xcon, ycon)
  {
    this.xcon=xcon;
    this.ycon=ycon;
  }
  constrain(x, y){
    x = constrain(x, this.xcon.min, this.xcon.max);
    y = constrain(y, this.ycon.min, this.ycon.max);
    return [x,y];
  }
  show(){
    push()
    rectMode(CORNERS)
    rect(this.xcon.min, this.ycon.min, this.xcon.max, this.ycon.max)
    pop()
  }
  //likely useless, want to think about constraining outer edge of circle to within bounds
  expand_constraints(dx,dy){
    this.xcon.min-=dx
    this.xcon.max+=dx
    this.ycon.min-=dy
    this.ycon.max+=dy
  }
}

class UINode extends Draggable {
  constructor(x,y, node_color = get_css_colors()){
    super(x, y, node_color)
    this.hw = 20;
    this.hh = this.hw;
    this.color = node_color;

    //this.position_constraints = constraints
    this.position_constraints = new PositionConstraint({'min':0,'max':150},{'min':50,'max':150})

  }
  drawCircle() { 
    ellipseMode(RADIUS)
    ellipse(this.x, this.y, this.hh)
  }
  update() {
    super.update();
    if (this.position_constraints){
      [this.x,this.y] = this.position_constraints.constrain(this.x,this.y)
    }
  }
  show() {
    if (this.position_constraints){
      noFill()
      stroke(0)
      this.position_constraints.show()
    }
    super.show()
  }
}


