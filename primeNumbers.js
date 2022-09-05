function multipleOf(num1, num2) {
  return Math.max(num1, num2) % Math.min(num1, num2) === 0 ? true : false;
}

const arrayToObject = array => {
  let obj = {};
  for (let n of array.values()) {
    obj[n] = n;
  }
  return obj;
};

function testPrimality(number, exportPrimesList = false, primesList = false) {
  if (number <= 1) {
    return false;
  }
  if (!exportPrimesList && number !== 2 && number % 2 === 0) {
    return false;
  }

  primesList = primesList || {};

  let numbersToTest = [2];
  for (let n = 3; n <= number; n += 2) {
    numbersToTest.push(n);
  }

  let limit = number ** 0.5;
  for (let i = 0; numbersToTest[i] <= limit; i++) {
    let num = numbersToTest[i];

    if (primesList[num] || testPrimality(num, true, primesList)) {
      if (!exportPrimesList && multipleOf(number, num)) {
        return false;
      }
      primesList[num] = num;
      numbersToTest = numbersToTest.filter(n => !multipleOf(num, n));
      i = -1;
    }
  }

  primesList = { ...primesList, ...arrayToObject(numbersToTest) };

  let isPrime = primesList[number] ? true : false;

  return exportPrimesList ? { isPrime, primesList } : isPrime;
}

const memoizePrimesList = () => {
  let primeNumbersCache = {};

  return number => {
    isValidNumber(number);
    let result = { primesList: primeNumbersCache };

    if (primeNumbersCache[number]) {
      result.isPrime = true;
    } else {
      let lastPrimeInTheList = Object.values(primeNumbersCache).pop();

      if (lastPrimeInTheList && number < lastPrimeInTheList) {
        result.isPrime = false;
      }
    }

    if (result.isPrime !== undefined) {
      return result;
    }

    result = testPrimality(number, true, primeNumbersCache);
    primeNumbersCache = result.primesList;
    return result;
  };
};

const cachedPrimes = memoizePrimesList();

const primeNumbersUpTo = number => {
  let primesList = cachedPrimes(number).primesList;

  return Object.values(primesList).filter(n => n <= number);
};

const setsDifference = (setA, setB) => {
  let result = new Set(setA);

  for (let n of setB) {
    if (setA.has(n)) {
      result.delete(n);
    } else {
      result.add(n);
    }
  }

  return result;
};

function primeNumbersListBetween(from, to) {
  let list1 = new Set(primeNumbersUpTo(from));
  let list2 = new Set(primeNumbersUpTo(to));

  let result = [...setsDifference(list1, list2)];
  let min = Math.min(from, to);

  if (cachedPrimes(min).isPrime) {
    result.unshift(min);
  }

  return result;
}

function firstNPrimes(number) {
  isValidNumber(number);
  if (number === 0) {
    return [];
  }
  let digits = (number + '').length;
  let factor = 3 * 2 ** (digits - 1);

  let listOfPrimes = primeNumbersUpTo(number * factor);
  listOfPrimes.splice(number);
  return listOfPrimes;
}

class InvalidArgumentError extends Error {
  constructor(message) {
    super();
    this.message = message;
    this.name = 'InvalidArgumentError';
  }
}

function isValidNumber(number) {
  let message = '';
  let limit = 20_000_000;

  if (typeof number !== 'number') {
    message = `Argument should be a number. Current type: ${typeof number}`;
    throw new TypeError(message);
  } else if (!Number.isInteger(number) || number < 0) {
    message = `Only positive integers are allowed. Current value: ${number}`;
    throw new InvalidArgumentError(message);
  } else if (number > limit) {
    message = `Number too large. Only numbers less than or equal to ${limit} are allowed`;
    throw new InvalidArgumentError(message);
  }

  return true;
}

// module.exports = {
//   InvalidArgumentException,
//   isValidNumber,
//   testPrimality,
//   primeNumbersUpTo,
//   cachedPrimes,
//   primeNumbersListBetween,
//   firstNPrimes,
// };

export {
  primeNumbersUpTo,
  cachedPrimes,
  primeNumbersListBetween,
  firstNPrimes,
  InvalidArgumentError,
  isValidNumber,
};

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
