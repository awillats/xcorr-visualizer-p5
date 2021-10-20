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
  plot(x0 = 0.0, y0 = 0.0 , xScale = 1.0 , yScale = -1.0, numpts = false){
    //plotVecArray(this.signal, new p5.Vector(x0, y0));
    let signal = this.signal;
    if (numpts)
    {
      signal = get_last(this.signal, numpts);
    }
    plot1DArray(signal, x0, y0, xScale, yScale);
  }
  enque( val ) { this.signal.push(val); }
  deque() { this.signal.shift(); }
  cycle_in( val )
  {
    this.enque(val);
    this.deque();
  }
  last() { return this.signal.at(-1); }
  get_delayed(delay=1) {
    if (delay>this.signal.length)
    {
      return this.signal[0];
    }
    return this.signal.at(-delay);
  }
}


//does signal generator contain the whole network?
class SignalGenerator{
  //consider turning this into an abstract base class:
  //https://stackoverflow.com/questions/597769/how-do-i-create-an-abstract-base-class-in-javascript
  constructor()
  {
  }
  gen_sample(nt) {}
  gen() {}
  set_variance(v) {}
}

class GaussianGenerator extends SignalGenerator {
  constructor(mu=0.0, sigma=1.0)
  {
    super();
    this.mu = mu;
    this.sigma = sigma;
    this.type_str = 'Gaussian'
  }
  gen_sample()
  {
    return randomGaussian(this.mu, this.sigma)
  }
  gen(nt)
  {
    return Array(nt).fill().map( this.gen_sample , this)
  }
  set_variance( stdv )
  {
    this.sigma = stdv;
  }

}

class PerlinGenerator extends SignalGenerator {
  constructor(y_scale = 1.0, dx = 0.01, t_scale = 20.0, x0 = false){
    super();
    this.dx = dx;
    this.t_scale = t_scale;
    this.y_scale = y_scale;
    this.y_bias = 0.0;
    
    this.i = 0;
    this.x0 = ( x0 ? x0 : this.rand_start() );
    this.type_str = 'Perlin'
  }
  set_variance( y_scale )
  {
    this.y_scale = y_scale;
  }
  rand_start()
  {
    this.x0 = random(-100,100);
    return this.x0;
  }

  gen_sample(i=false)
  {
    i = (i ? i : this.i)
    i = this.i;
    this.i++
    let n = noise( (this.x0 + i*this.dx) * this.t_scale )
    let scaled_noise = (n + this.y_bias)*this.y_scale;
    return scaled_noise
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
    this.type_str = 'Poisson'
  }
  set_variance( lam )
  {
    this.lambda = constrain(lam, 0, 9999);
    if (lam != this.lambda)
    {
      console.log( 'clipped lambda in construction of Poisson Generator' )
    }
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
  constructor( lambda = 0.1, n = 20, do_avg = true)
  {
    super(lambda);
    this.n = n;
    this.do_avg = do_avg;
    this.type_str = `${n} Avergaed Poisson`
  }
  gen_sample( do_avg = null)
  {
    if (do_avg == null) { do_avg = this.do_avg; };
    let vals = Array(this.n).fill().map( super.gen_sample, this );
    //compute the sum
    let sum = vals.reduce( (a,b) => a+b, 0)
    return ( do_avg ? sum/this.n : sum ) 
  }
  gen( nt , do_avg = null)
  {
    return Array(nt).fill().map( _=>this.gen_sample(do_avg), this);
  }

}

function noise_gen_type_by_idx( idx = -1)
{
  //to avoid having to clone objects
  //this only returns the function for generating the noise gen object
  let noise_gen_funs = [
    () => new GaussianGenerator(),
    () => new PoissonGenerator(),
    () => new MultiPoissonGenerator(),
    () => new PerlinGenerator(),
  ];

  let this_ngf = (idx<0 ? random(noise_gen_funs) : noise_gen_funs[idx] ) ;
  console.log( this_ngf );
  return this_ngf;
}




