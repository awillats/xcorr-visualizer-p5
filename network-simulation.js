/*
 * (~) generate a random signal of a fixed length
 * ( ) plot it
 * ( ) add signal length to buffer class
 *
 *
 */

function plot1DArray(ary, x0 = 0.0, y0 = 0.0, xScale = 1.0, yScale = -1.0){
  //could do this scaling with a map instead
  push();
  beginShape();
  noFill();
  ary.forEach((item,i)=>{
    //vertex( (i+x0)*xScale, (item+y0)*yScale ) 
    vertex( (i*xScale + x0), (item*yScale + y0) ) 
  });
  endShape();
  pop();
}
function plotVecArray(vAry, v0=createVector(0,0))
{
    beginShape();
    noFill();
    vAry.forEach((item, i) => {
        //console.log(i)
        vertex(item.x+v0.x, item.y+v0.y)
    });
    endShape();
}

class SignalBuffer{
  constructor(len){
    this.len = len;
    this.signal = Array(len);
    //have default x and y scales?
  }
  set_from_array(v_ary)
  { 
    this.signal = v_ary;
    this.len = v_ary.length;
  }
  plot(x0 = 0.0, y0 = 0.0 , xScale = 1.0 , yScale = -1.0){
    //plotVecArray(this.signal, new p5.Vector(x0, y0));
    plot1DArray(this.signal, x0, y0, xScale, yScale);
  }
  enque( val ) { this.signal.push(val); }
  deque() { this.signal.shift(); }
  cycle_in( val )
  {
    this.enque(val);
    this.deque();
  }
}


//does signal generator contain the whole network?
class SignalGenerator{
  //consider turning this into an abstract base class:
  //https://stackoverflow.com/questions/597769/how-do-i-create-an-abstract-base-class-in-javascript
  constructor()
  {
  }
}

class GaussianGenerator extends SignalGenerator {
  constructor(mu=0.0, sigma=1.0)
  {
    super();
    this.mu = mu;
    this.sigma = sigma;
  }
  gen_sample()
  {
    return randomGaussian(this.mu, this.sigma)
  }
  gen(nt)
  {
    return Array(nt).fill().map( this.gen_sample , this)
  }
}

class PerlinGenerator extends SignalGenerator {
  constructor(dx = 0.01, noise_scale=1.0, x0=false){
    super();
    this.dx = dx;
    this.noise_scale = noise_scale;
    

    this.x0 = ( x0 ? x0 : rand_start() );
    if (!x0) {
      this.x0 = rand_start()   
    }
    else{
      this.x0 = x0;
    }


  }
  rand_start()
  {
    this.x0 = random(-100,100);
    return this.x0;
  }

  gen_sample(i)
  {
    return noise( ( this.x0 + i * this.dx ) * this.noise_scale )
  }
  gen(nt, do_rand_start = false)
  {
    if (do_rand_start) { this.rand_start() }
    return Array(nt).fill().map( (_,i) => this.gen_sample(i), this )
  }
}

class PoissonGenerator extends SignalGenerator {
  constructor( lambda = 0.1 ) {
    super();
    this.lambda = lambda;
  }
  gen_sample()
  {
    //using inverse transform sampling algo. from wikipedia:
    // https://en.wikipedia.org/wiki/Poisson_distribution#Generating_Poisson-distributed_random_variables
    let x = 0;
    let p = exp( -this.lambda );
    let s = p;
    let u = random()

    while (u > s){
      x++;
      p *= this.lambda/x;
      s += p;
    }
    return x;
  }
  gen( nt ){
    return Array(nt).fill().map( this.gen_sample, this );
  }
}

class MultiPoissonGenerator extends PoissonGenerator {
  constructor( lambda = 0.1, n = 1)
  {
    super(lambda);
    this.n = n;
  }
  gen_sample( do_avg = false)
  {
    let vals = Array(this.n).fill().map( super.gen_sample, this );
    //compute the sum
    let sum = vals.reduce( (a,b) => a+b, 0)
    return ( do_avg ? sum/this.n : sum ) 
  }
  gen( nt , do_avg = false)
  {
    return Array(nt).fill().map( _=>this.gen_sample(do_avg), this);
  }

}








