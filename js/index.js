import {
  cachedPrimes,
  primeNumbersListBetween,
  firstNPrimes,
  InvalidArgumentError,
  isValidNumber,
} from '../primeNumbers.js';

const asyncTimeout = miliseconds => {
  return new Promise(resolve => {
    setTimeout(resolve, miliseconds);
  });
};

class Message {
  static display(type, message, messageArea) {
    messageArea.text(`${message}`).hide();

    let isListResult = false;
    if (messageArea.hasClass('listResult')) {
      messageArea.removeClass('listResult');
      isListResult = true;
    }

    messageArea.addClass('msg');
    messageArea.addClass(type);

    messageArea.slideDown('slow', async () => {
      await asyncTimeout(2000);
      messageArea.slideUp('slow', () => messageArea.empty());
      await asyncTimeout(2000);

      messageArea.removeClass(type);
      messageArea.removeClass('msg');
      isListResult ? messageArea.addClass('listResult') : null;
    });
  }
}

function validateInput(value, message = 'Digite um número inteiro positivo.') {
  let parsedValue = parseInt(value);

  if (value.match(/\D+/)) {
    throw new InvalidArgumentError(message);
  }

  try {
    isValidNumber(parsedValue);
  } catch (error) {
    throw new InvalidArgumentError(message);
  }

  return parsedValue;
}

const getInputValue = elementSelector => $(elementSelector).val();

const togglePeriod = (element, char) => {
  let punctuationMark = element.text();
  if (punctuationMark !== char) {
    element.text(char);
  }
};

/**
 * Encapsulates operations performed on input change
 *
 * @function handleInputChange
 * @typedef {Object} jQuerySelector -
 *  Any valid Selector, as a string or a DOM Element
 * @typedef {Object} jQuery -
 *  Objets created using jQuery() or $()
 * @params {jQuerySelector|jQuerySelector[]} elementSelector -
 *  If there's more than one input to handle,
 *  they're passed as an array of Selectors
 * @params {function (number,[number],jQuery):string} fn -
 *  Callback function wich performs actual operations with the input value
 */
function handleInputChange(elementSelector, fn) {
  let inputArray = [];
  let inputName = undefined;

  if (Array.isArray(elementSelector)) {
    for (let element of elementSelector) {
      inputArray.push(getInputValue(element));
    }

    /** @type {string} - The name attribute of the input tag,
     *    corresponding to the action being performed. In case there are more than
     *    one input for the same action, each name attribute must have a '-something'
     *    at the end to differentiate each input
     */
    inputName = $(elementSelector[0]).attr('name').split(/-\w*$/)[0];
  } else {
    inputArray.push(getInputValue(elementSelector));
    inputName = $(elementSelector).attr('name');
  }

  let resultArea = $(`p[id*="${inputName}"].js-result`);

  if (inputArray.some(value => value === '')) {
    resultArea.slideUp('slow');
    togglePeriod($(`span[id*="${inputName}"]`), '.');
  } else {
    try {
      let msg = fn(...inputArray, resultArea);

      resultArea.hide();
      resultArea.text(msg);
      togglePeriod($(`span[id*="${inputName}"]`), ':');
      resultArea.slideDown('slow');
    } catch (error) {
      Message.display('error', error.message, resultArea);
    }
  }
}

const checkInputValidity = jQueryElement => {
  let value = jQueryElement.val();
  if (value !== '' && value.match(/\D+/) !== null) {
    return false;
  }
  return true;
};

function handleInputInput(elementSelector) {
  if (!checkInputValidity($(elementSelector))) {
    $(elementSelector)
      .get(0)
      .setCustomValidity('Digite um número inteiro positvo.');
    $(elementSelector).get(0).reportValidity();
    $(elementSelector).attr(
      'style',
      'border-color: var(--invalid-input-border)'
    );
  } else {
    $(elementSelector).get(0).setCustomValidity('');
    $(elementSelector).attr('style', 'border-color: var(--input-border)');
  }
}

const initInputHandlers = () => {
  [
    '#verify-number-input',
    '#generate-list-from-input',
    '#generate-list-to-input',
    '#generate-first-n-primes-input',
  ].forEach(elementSelector => {
    $(elementSelector).on('input', event => {
      handleInputInput(event.target);
    });
  });
};

const start = () => {
  initInputHandlers();

  $('#verify-number-input').on('change', event => {
    handleInputChange(event.target, number => {
      number = validateInput(number);
      let result = cachedPrimes(number).isPrime;

      let msg = `${number} `;
      if (result === false) {
        msg += 'não ';
      }
      msg += 'é um número primo';

      return msg;
    });
  });

  $('#generate-list-p').on('change', () => {
    handleInputChange(
      ['#generate-list-from-input', '#generate-list-to-input'],
      (from, to) => {
        from = validateInput(from);
        to = validateInput(to);

        return primeNumbersListBetween(from, to).join(' ');
      }
    );
  });

  $('#generate-first-n-primes-p').on('change', event => {
    handleInputChange(event.target, number => {
      number = validateInput(number);

      return firstNPrimes(number).join(' ');
    });
  });
};

start();
