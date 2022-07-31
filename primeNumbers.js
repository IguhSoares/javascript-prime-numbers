<<<<<<< HEAD
function multipleOf(num1, num2) {
  return Math.max(num1, num2) % Math.min(num1, num2) === 0 ? true : false;
}

function verifyPrimeNumber(number, upTo = null, outputType = 'string') {
  if (!['array', 'string'].includes(outputType)) {
    throw new InvalidArgumentException(
      'Invalid outputType: choose "array" or "string"'
    );
  }
  if (upTo === 0) {
    upTo = null;
  }
  if (upTo !== null) {
    // generates a list of the upTo first prime numbers
    if (number !== 0) {
      try {
        return generatePrimeNumbersList(number, upTo, outputType);
      } catch (error) {
        return console.log(error.message);
      }
    }
    if (!validate(upTo)[0]) {
      throw new InvalidArgumentException(validate(upTo)['message']);
    }

    var generatingListOfPrimes = true;
    var sqrt = Math.floor(Math.sqrt(upTo));
    var totalNumbers = upTo;
  } else {
    // verifies if number is prime
    if (number === 0 || number === 1 || number < 0) {
      return false;
    }
    var generatingListOfPrimes = false;

    var sqrt = Math.floor(Math.sqrt(number));
    var totalNumbers = number;
  }

  var primes = [];
  for (let i = 2; i <= totalNumbers; i++) {
    primes.push(i);
  }
  if (primes.length === 0) {
    return true;
  }

  var tmp = [];
  let num = null;
  for (let i = 0; primes[i] <= sqrt; i++) {
    num = primes[i];

    if (verifyPrimeNumber(num)) {
      if (!generatingListOfPrimes && multipleOf(number, num)) {
        return false;
      }
      primes = primes.filter(n => !multipleOf(num, n));
      i = -1; // back to begining of new primes list
      tmp.push(num); // tmp stores already tested prime numbers
    }
  }
  if (!generatingListOfPrimes) {
    // number is not a multiple of any prime <= sqrt(number)
    return true;
  }

  primes = tmp.concat(primes);
  if (outputType == 'string') {
    return primes.join(', ');
  } else {
    return primes;
  }
}

function verificaNumeroPrimo(num) {
  if (!validate(num)[0]) {
    throw new InvalidArgumentException(validate(num)['message']);
  }

  var simPrimo = `O número ${num} é primo.`;
  var naoPrimo = `O número ${num} não é primo.`;

  return verifyPrimeNumber(num) ? simPrimo : naoPrimo;
}

function generatePrimeNumbersList(from, to, outputType = 'string') {
  if (!['array', 'string'].includes(outputType)) {
    throw new InvalidArgumentException(
      'Invalid outputType: choose "array" or "string"'
    );
  }
  if (!validate(from)[0]) {
    throw new InvalidArgumentException(validate(from)['message']);
  }
  if (!validate(to)[0]) {
    throw new InvalidArgumentException(validate(to)['message']);
  }
  if (from > to) {
    let tmp = from;
    from = to;
    to = tmp;
  }
  if ([0, 1, 2].includes(from)) {
    return verifyPrimeNumber(0, to, outputType);
  }

  var list1 = verifyPrimeNumber(0, from, 'array');
  var list2 = verifyPrimeNumber(0, to, 'array');

  var res = list2.filter(n => {
    return n === from || !list1.includes(n);
  });
  if (outputType === 'string') {
    return res.join(', ');
  }
  return res;
}

function validate(num) {
  var response = { 0: true, message: '' };

  if (!Number.isInteger(num) || num < 0) {
    response[0] = false;
    response['message'] =
      'Entrada inválida.\n' +
      'Apenas números inteiros positivos serão computados.';
  }
  return response;
}

function InvalidArgumentException(message) {
  this.message = message;
  this.name = 'InvalidArgumentException';
}
