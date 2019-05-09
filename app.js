function isPrime(num) {

    if (num === 2) {
      return 'Number is Prime';
    }
    else if(num > 1){
      for (var i = 2;  i < num; i++) {
  
        if (num % i !== 0 ) {
          return 'Number is Prime';
        }
  
        else if (num === i * i) {
          return 'Number is not Prime'
        }
  
        else {
          return 'Number is not Prime';
        }
      }
    }
    else {
      return 'Number is not prime';
    }
  
  }
  
  console.log(isPrime(35));

  module.exports = {
    isPrime
  }