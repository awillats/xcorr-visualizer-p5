let bgColor;
let sb;
let g;
let p; 
function preload() {
}

function setup() {
  createCanvas(800, 600);
  
  // talk to css, set background color

  bgColor = get_style_prop('--page-color')
  set_style_prop('--page-color',lightenColor(bgColor, .9))
  // set up GUI elementsi
  p = new UINode(width/3, height/2)
  add_ui_node(p);

  g = new GaussianGenerator(0,1);
  //g = new PoissonGenerator(.01);
  //g = new MultiPoissonGenerator(.01, 1000);
  sb = new SignalBuffer(0);
  sb.set_from_array(g.gen(5000, true));

//  print(g.gen(100))
}


function draw() {
  background(bgColor);

  update_all_ui();
  show_all_ui();

  g.sigma = abs(p.getValue().y);
  //g.lambda = map( abs(p.getValue().y), 0,5, 0, .1);
  Array(6).fill().forEach( _=> {
    sb.cycle_in( g.gen_sample(true) );
  });
  push()
  colorMode(HSB,360,100,100);
  stroke(color(270,30,30));
  //strokeWeight(2);
  sb.plot( p.position_constraints.xcon.max, p.position_constraints.ycon.center(), 0.1, -5);
  //sb.plot( p.position_constraints.xcon.max, p.position_constraints.ycon.max, 0.1, -1);
  pop()
}

// UI Functions



function mousePressed(){
  press_all_ui();
}
function mouseReleased(){
  release_all_ui();
}



// CSS functions 

function set_style_prop(var_name, value){
  //var style = window.getComputedStyle(document.body)
  var style = document.querySelector(':root').style
  style.setProperty(var_name, value);
}

function get_style_prop(var_name){
  var style = window.getComputedStyle(document.body)
  return style.getPropertyValue(var_name);
}

