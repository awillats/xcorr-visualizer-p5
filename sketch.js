let bgColor;


function preload() {
}

function setup() {
  createCanvas(800, 600);
  
  // talk to css, set background color

  bgColor = get_style_prop('--page-color')
  set_style_prop('--page-color',lightenColor(bgColor, .9))
  // set up GUI elements
  add_ui_node(new UINode(width/3,height/2))
}


function draw() {
  background(bgColor);

  update_all_ui();
  show_all_ui();
  //noLoop();
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

